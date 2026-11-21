import AVFoundation
import Capacitor
import Foundation
import Speech
import UIKit

/// Speech recognition and speech synthesis that never leave the device.
///
/// The web build sends the child's voice to a cloud speech service. A children's
/// app on the store should not, and it should also work with no connection, so
/// the native build uses the models that ship with the operating system:
///
/// - iOS 26 and later: `SpeechAnalyzer` + `SpeechTranscriber`. Always on device.
///   The language model is downloaded once by the system, then works offline.
/// - iOS 15 to 25: `SFSpeechRecognizer` with `requiresOnDeviceRecognition`. If
///   the device has no on-device model for the language, recognition is reported
///   as unavailable. It never falls back to Apple's servers.
/// - Speaking: `AVSpeechSynthesizer`, which is always local.
@objc(DeviceSpeechPlugin)
public class DeviceSpeechPlugin: CAPPlugin, CAPBridgedPlugin, AVSpeechSynthesizerDelegate {
    public let identifier = "DeviceSpeechPlugin"
    public let jsName = "DeviceSpeech"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "microphoneStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "prepare", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "listen", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "speak", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopSpeaking", returnType: CAPPluginReturnPromise)
    ]

    private var session: ListenSession?
    private var listenCall: CAPPluginCall?
    private var lastText = ""
    private var settleTimer: Timer?
    private var hardTimer: Timer?
    private var finishTimer: Timer?

    private lazy var synthesizer: AVSpeechSynthesizer = {
        let synth = AVSpeechSynthesizer()
        synth.delegate = self
        return synth
    }()
    private var speakCall: CAPPluginCall?

    // MARK: - permission

    /// Whether the microphone has been allowed, refused, or not asked about yet:
    /// `{ state: "granted" | "denied" | "prompt" }`. Lets the game explain the
    /// system's question to a child before it appears.
    @objc func microphoneStatus(_ call: CAPPluginCall) {
        let state: String
        if #available(iOS 17.0, *) {
            switch AVAudioApplication.shared.recordPermission {
            case .granted: state = "granted"
            case .denied: state = "denied"
            default: state = "prompt"
            }
        } else {
            switch AVAudioSession.sharedInstance().recordPermission {
            case .granted: state = "granted"
            case .denied: state = "denied"
            default: state = "prompt"
            }
        }
        call.resolve(["state": state])
    }

    /// Open this app's page in Settings, where a refused microphone is turned
    /// back on. The game puts this behind its parental gate.
    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let url = URL(string: UIApplication.openSettingsURLString) {
                UIApplication.shared.open(url)
            }
            call.resolve()
        }
    }

    // MARK: - prepare

    /// Ask for the microphone, and make sure a model for the language is on the
    /// device. Resolves with what the app needs to decide whether it can listen:
    /// `{ microphone, available, engine }`.
    @objc func prepare(_ call: CAPPluginCall) {
        let locale = Locale(identifier: call.getString("locale") ?? "en-GB")
        Task { @MainActor in
            let microphone = await Self.requestMicrophone()
            var available = false
            var engine = "none"
            var reason = ""

            if !microphone {
                reason = "microphone-denied"
            } else if #available(iOS 26.0, *) {
                engine = "speech-analyzer"
                do {
                    available = try await AnalyzerSession.ensureModel(for: locale) { [weak self] in
                        // The model for this language is not on the phone yet.
                        // The game shows "Oliver is learning..." while it arrives.
                        self?.notifyListeners("modelDownload", data: ["state": "started"])
                    }
                    if !available { reason = "language-unsupported" }
                } catch {
                    // The usual cause is a first run with no connection: the
                    // model has never been downloaded.
                    reason = "model-not-installed"
                }
            } else {
                engine = "sf-speech"
                let authorised = await Self.requestSpeechAuthorisation()
                let recogniser = SFSpeechRecognizer(locale: locale)
                if !authorised {
                    reason = "speech-denied"
                } else if recogniser?.supportsOnDeviceRecognition == true && recogniser?.isAvailable == true {
                    available = true
                } else {
                    reason = "model-not-installed"
                }
            }

            call.resolve([
                "microphone": microphone,
                "available": available,
                "engine": engine,
                "reason": reason
            ])
        }
    }

    // MARK: - listen

    /// Open the microphone and resolve with what was heard: `{ text }`. An empty
    /// string means nothing was heard. Partial transcripts arrive as `partial`
    /// events while the child is speaking.
    ///
    /// The on-device recognisers do not decide for themselves that the speaker
    /// has finished, so the turn ends when the transcript has stopped changing
    /// for `settleSeconds`, or after `maxSeconds` whatever happens.
    @objc func listen(_ call: CAPPluginCall) {
        let locale = Locale(identifier: call.getString("locale") ?? "en-GB")
        let maxSeconds = call.getDouble("maxSeconds") ?? 8
        let settleSeconds = call.getDouble("settleSeconds") ?? 1.2

        Task { @MainActor in
            // One turn at a time. A turn still open is closed empty.
            self.abandonCurrentTurn()

            let newSession: ListenSession
            if #available(iOS 26.0, *) {
                newSession = AnalyzerSession()
            } else {
                newSession = LegacySession()
            }
            self.session = newSession
            self.listenCall = call
            self.lastText = ""

            do {
                try Self.configureAudioSession()
                try await newSession.start(
                    locale: locale,
                    onPartial: { [weak self, weak newSession] text in
                        DispatchQueue.main.async {
                            guard let self, let newSession, self.session === newSession else { return }
                            self.lastText = text
                            self.notifyListeners("partial", data: ["text": text])
                            if !text.isEmpty {
                                self.settleTimer?.invalidate()
                                self.settleTimer = Timer.scheduledTimer(withTimeInterval: settleSeconds, repeats: false) { [weak self] _ in
                                    self?.finishTurn()
                                }
                            }
                        }
                    },
                    onFinal: { [weak self, weak newSession] text in
                        DispatchQueue.main.async {
                            guard let self, let newSession, self.session === newSession else { return }
                            self.complete(with: text ?? self.lastText)
                        }
                    }
                )
                guard self.session === newSession else { return }
                self.hardTimer = Timer.scheduledTimer(withTimeInterval: maxSeconds, repeats: false) { [weak self] _ in
                    self?.finishTurn()
                }
            } catch {
                guard self.session === newSession else { return }
                newSession.cancel()
                self.clearTurn()
                call.reject("Could not start listening: \(error.localizedDescription)")
            }
        }
    }

    /// End the turn now. The pending `listen` call resolves with whatever was
    /// heard so far.
    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.finishTurn()
            call.resolve()
        }
    }

    /// Stop the audio and ask the recogniser for its final answer. If it does
    /// not give one promptly, the last partial transcript stands.
    private func finishTurn() {
        guard let session else { return }
        settleTimer?.invalidate()
        hardTimer?.invalidate()
        session.finish()
        finishTimer?.invalidate()
        finishTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: false) { [weak self, weak session] _ in
            guard let self, let session, self.session === session else { return }
            session.cancel()
            self.complete(with: self.lastText)
        }
    }

    private func complete(with text: String) {
        let call = listenCall
        clearTurn()
        call?.resolve(["text": text.trimmingCharacters(in: .whitespacesAndNewlines)])
    }

    private func abandonCurrentTurn() {
        guard let session else { return }
        session.cancel()
        let call = listenCall
        clearTurn()
        call?.resolve(["text": ""])
    }

    private func clearTurn() {
        settleTimer?.invalidate()
        hardTimer?.invalidate()
        finishTimer?.invalidate()
        settleTimer = nil
        hardTimer = nil
        finishTimer = nil
        session = nil
        listenCall = nil
    }

    // MARK: - speak

    /// Say `text` with the best voice installed for `locale`. Resolves when the
    /// voice has finished, or has been stopped.
    @objc func speak(_ call: CAPPluginCall) {
        guard let text = call.getString("text"), !text.isEmpty else {
            call.resolve()
            return
        }
        let localeId = call.getString("locale") ?? "en-GB"
        let rate = call.getFloat("rate") ?? 0.92

        DispatchQueue.main.async {
            if self.synthesizer.isSpeaking {
                self.synthesizer.stopSpeaking(at: .immediate)
            }
            self.speakCall?.resolve(["completed": false])
            self.speakCall = call

            try? Self.configureAudioSession()
            let utterance = AVSpeechUtterance(string: text)
            utterance.voice = Self.bestVoice(for: localeId)
            utterance.rate = AVSpeechUtteranceDefaultSpeechRate * rate
            self.synthesizer.speak(utterance)
        }
    }

    @objc func stopSpeaking(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.synthesizer.isSpeaking {
                self.synthesizer.stopSpeaking(at: .immediate)
            }
            call.resolve()
        }
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.speakCall?.resolve(["completed": true])
            self.speakCall = nil
        }
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.speakCall?.resolve(["completed": false])
            self.speakCall = nil
        }
    }

    /// The highest quality voice the device has for the language. A parent who
    /// has downloaded an Enhanced or Premium voice in Settings gets it.
    private static func bestVoice(for localeId: String) -> AVSpeechSynthesisVoice? {
        let language = String(localeId.prefix(2))
        let voices = AVSpeechSynthesisVoice.speechVoices()
        let exact = voices.filter { $0.language == localeId }
        let candidates = exact.isEmpty ? voices.filter { $0.language.hasPrefix(language) } : exact
        return candidates.max { $0.quality.rawValue < $1.quality.rawValue }
            ?? AVSpeechSynthesisVoice(language: localeId)
    }

    // MARK: - permissions and audio

    private static func requestMicrophone() async -> Bool {
        await withCheckedContinuation { continuation in
            if #available(iOS 17.0, *) {
                AVAudioApplication.requestRecordPermission { continuation.resume(returning: $0) }
            } else {
                AVAudioSession.sharedInstance().requestRecordPermission { continuation.resume(returning: $0) }
            }
        }
    }

    private static func requestSpeechAuthorisation() async -> Bool {
        await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { continuation.resume(returning: $0 == .authorized) }
        }
    }

    /// One session for the whole game: the robot speaks, then the microphone
    /// opens, many times a minute. Switching category each time clicks.
    private static func configureAudioSession() throws {
        let audio = AVAudioSession.sharedInstance()
        if audio.category != .playAndRecord {
            try audio.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetooth])
        }
        try audio.setActive(true)
    }
}

// MARK: - Listening engines

protocol ListenSession: AnyObject {
    func start(
        locale: Locale,
        onPartial: @escaping (String) -> Void,
        onFinal: @escaping (String?) -> Void
    ) async throws
    /// Stop the microphone and let the recogniser deliver its final transcript.
    func finish()
    /// Stop everything. Nothing more is delivered.
    func cancel()
}

enum DeviceSpeechError: LocalizedError {
    case unavailable(String)

    var errorDescription: String? {
        switch self {
        case .unavailable(let why): return why
        }
    }
}

/// iOS 26+: SpeechAnalyzer. Runs entirely on the device.
@available(iOS 26.0, *)
final class AnalyzerSession: ListenSession {
    private let engine = AVAudioEngine()
    private var analyzer: SpeechAnalyzer?
    private var input: AsyncStream<AnalyzerInput>.Continuation?
    private var resultsTask: Task<Void, Never>?
    private var finished = false
    private var cancelled = false

    private static func transcriber(for locale: Locale) -> SpeechTranscriber {
        SpeechTranscriber(
            locale: locale,
            transcriptionOptions: [],
            reportingOptions: [.volatileResults],
            attributeOptions: []
        )
    }

    /// True when a model for the language is installed, downloading it first if
    /// the system has not already. False when the language is not supported.
    /// Throws when the download cannot happen (no connection on a first run).
    static func ensureModel(for locale: Locale, onDownload: (() -> Void)? = nil) async throws -> Bool {
        guard let supported = await SpeechTranscriber.supportedLocale(equivalentTo: locale) else {
            return false
        }
        let module = transcriber(for: supported)
        if let request = try await AssetInventory.assetInstallationRequest(supporting: [module]) {
            onDownload?()
            try await request.downloadAndInstall()
        }
        return true
    }

    func start(
        locale: Locale,
        onPartial: @escaping (String) -> Void,
        onFinal: @escaping (String?) -> Void
    ) async throws {
        guard let supported = await SpeechTranscriber.supportedLocale(equivalentTo: locale) else {
            throw DeviceSpeechError.unavailable("This language is not supported on the device.")
        }
        let transcriber = Self.transcriber(for: supported)
        let analyzer = SpeechAnalyzer(modules: [transcriber])
        self.analyzer = analyzer

        guard let targetFormat = await SpeechAnalyzer.bestAvailableAudioFormat(compatibleWith: [transcriber]) else {
            throw DeviceSpeechError.unavailable("No speech model is installed for this language.")
        }

        let (stream, continuation) = AsyncStream<AnalyzerInput>.makeStream()
        self.input = continuation

        // Finalised text accumulates; the volatile tail is replaced each time.
        resultsTask = Task { [weak self] in
            var settled = ""
            do {
                for try await result in transcriber.results {
                    let text = String(result.text.characters)
                    if result.isFinal {
                        settled += text
                        onPartial(settled)
                    } else {
                        onPartial(settled + text)
                    }
                }
            } catch {
                // Falls through: whatever was settled is the answer.
            }
            if self?.cancelled != true {
                onFinal(settled.isEmpty ? nil : settled)
            }
        }

        let inputNode = engine.inputNode
        let micFormat = inputNode.outputFormat(forBus: 0)
        guard micFormat.sampleRate > 0, let converter = AVAudioConverter(from: micFormat, to: targetFormat) else {
            throw DeviceSpeechError.unavailable("The microphone is not available.")
        }

        inputNode.installTap(onBus: 0, bufferSize: 4096, format: micFormat) { buffer, _ in
            let ratio = targetFormat.sampleRate / micFormat.sampleRate
            let capacity = AVAudioFrameCount(Double(buffer.frameLength) * ratio) + 16
            guard let converted = AVAudioPCMBuffer(pcmFormat: targetFormat, frameCapacity: capacity) else { return }
            var consumed = false
            var conversionError: NSError?
            converter.convert(to: converted, error: &conversionError) { _, status in
                if consumed {
                    status.pointee = .noDataNow
                    return nil
                }
                consumed = true
                status.pointee = .haveData
                return buffer
            }
            if conversionError == nil, converted.frameLength > 0 {
                continuation.yield(AnalyzerInput(buffer: converted))
            }
        }

        engine.prepare()
        try engine.start()
        try await analyzer.start(inputSequence: stream)
    }

    private func stopAudio() {
        if engine.isRunning {
            engine.stop()
        }
        engine.inputNode.removeTap(onBus: 0)
        input?.finish()
        input = nil
    }

    func finish() {
        guard !finished else { return }
        finished = true
        stopAudio()
        let analyzer = self.analyzer
        Task {
            // Ends the results stream, which delivers the final transcript.
            try? await analyzer?.finalizeAndFinishThroughEndOfInput()
        }
    }

    func cancel() {
        cancelled = true
        finished = true
        stopAudio()
        let analyzer = self.analyzer
        Task { await analyzer?.cancelAndFinishNow() }
        resultsTask?.cancel()
    }
}

/// iOS 15 to 25: SFSpeechRecognizer, forced to stay on the device.
final class LegacySession: ListenSession {
    private let engine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var finished = false
    private var delivered = false

    func start(
        locale: Locale,
        onPartial: @escaping (String) -> Void,
        onFinal: @escaping (String?) -> Void
    ) async throws {
        guard let recogniser = SFSpeechRecognizer(locale: locale),
              recogniser.isAvailable,
              recogniser.supportsOnDeviceRecognition else {
            throw DeviceSpeechError.unavailable("No on-device speech model for this language.")
        }

        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        // The whole point: the child's voice is never sent anywhere.
        request.requiresOnDeviceRecognition = true
        self.request = request

        task = recogniser.recognitionTask(with: request) { [weak self] result, error in
            guard let self, !self.delivered else { return }
            if let result {
                let text = result.bestTranscription.formattedString
                if result.isFinal {
                    self.delivered = true
                    onFinal(text)
                } else {
                    onPartial(text)
                }
            } else if error != nil {
                // "No speech detected" arrives here. It is silence, not a fault.
                self.delivered = true
                onFinal(nil)
            }
        }

        let inputNode = engine.inputNode
        let micFormat = inputNode.outputFormat(forBus: 0)
        guard micFormat.sampleRate > 0 else {
            throw DeviceSpeechError.unavailable("The microphone is not available.")
        }
        inputNode.installTap(onBus: 0, bufferSize: 4096, format: micFormat) { [weak request] buffer, _ in
            request?.append(buffer)
        }
        engine.prepare()
        try engine.start()
    }

    private func stopAudio() {
        if engine.isRunning {
            engine.stop()
        }
        engine.inputNode.removeTap(onBus: 0)
    }

    func finish() {
        guard !finished else { return }
        finished = true
        stopAudio()
        request?.endAudio()
    }

    func cancel() {
        finished = true
        delivered = true
        stopAudio()
        task?.cancel()
    }
}
