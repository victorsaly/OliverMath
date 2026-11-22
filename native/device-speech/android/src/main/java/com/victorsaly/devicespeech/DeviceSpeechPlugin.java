package com.victorsaly.devicespeech;

import android.Manifest;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.speech.RecognitionListener;
import android.speech.RecognitionSupport;
import android.speech.RecognitionSupportCallback;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Speech recognition and speech synthesis that never leave the device.
 *
 * Recognition uses the on-device recogniser added in Android 12 (API 31),
 * {@link SpeechRecognizer#createOnDeviceSpeechRecognizer}. On older versions,
 * or on a device without one, recognition is reported as unavailable. It never
 * falls back to the network recogniser. Speaking uses the system TextToSpeech
 * engine.
 */
@CapacitorPlugin(
    name = "DeviceSpeech",
    permissions = { @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO }) }
)
public class DeviceSpeechPlugin extends Plugin {

    private static final String MICROPHONE = "microphone";

    private final Handler main = new Handler(Looper.getMainLooper());

    private SpeechRecognizer recogniser;
    private PluginCall listenCall;
    private String lastText = "";

    private TextToSpeech tts;
    private boolean ttsReady = false;
    private PluginCall speakCall;
    private int utteranceCounter = 0;

    // ------------------------------------------------------------- permission

    /**
     * Whether the microphone has been allowed, refused, or not asked about yet:
     * { state: "granted" | "denied" | "prompt" }.
     */
    @PluginMethod
    public void microphoneStatus(PluginCall call) {
        PermissionState permission = getPermissionState(MICROPHONE);
        String state = "prompt";
        if (permission == PermissionState.GRANTED) state = "granted";
        else if (permission == PermissionState.DENIED) state = "denied";
        JSObject result = new JSObject();
        result.put("state", state);
        call.resolve(result);
    }

    /** Open this app's page in Settings. The game puts this behind its parental gate. */
    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.fromParts("package", getContext().getPackageName(), null));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open Settings: " + e.getMessage());
        }
    }

    // ---------------------------------------------------------------- prepare

    @PluginMethod
    public void prepare(PluginCall call) {
        if (getPermissionState(MICROPHONE) != PermissionState.GRANTED) {
            requestPermissionForAlias(MICROPHONE, call, "microphonePermissionResult");
            return;
        }
        checkModel(call);
    }

    @PermissionCallback
    private void microphonePermissionResult(PluginCall call) {
        if (getPermissionState(MICROPHONE) != PermissionState.GRANTED) {
            resolvePrepare(call, false, false, "none", "microphone-denied");
            return;
        }
        checkModel(call);
    }

    private boolean hasOnDeviceRecogniser() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
            && SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext());
    }

    /** Is there a model for this language on the device? Start the download if not. */
    private void checkModel(PluginCall call) {
        if (!hasOnDeviceRecogniser()) {
            resolvePrepare(call, true, false, "none", "no-on-device-recogniser");
            return;
        }

        // Before Android 13 the system cannot say which languages are installed.
        // Listening reports the truth: an unavailable language is an error there.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            resolvePrepare(call, true, true, "android-on-device", "");
            return;
        }

        final String localeTag = call.getString("locale", "en-GB");
        main.post(() -> {
            try {
                final SpeechRecognizer probe = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
                final Intent intent = recogniserIntent(localeTag);
                probe.checkRecognitionSupport(
                    intent,
                    getContext().getMainExecutor(),
                    new RecognitionSupportCallback() {
                        @Override
                        public void onSupportResult(RecognitionSupport support) {
                            boolean installed = matches(support.getInstalledOnDeviceLanguages(), localeTag);
                            boolean pending = matches(support.getPendingOnDeviceLanguages(), localeTag);
                            boolean downloadable = matches(support.getSupportedOnDeviceLanguages(), localeTag);
                            if (!installed && !pending && downloadable) {
                                // Asks the system to fetch the model. It needs a
                                // connection once; after that it works offline.
                                probe.triggerModelDownload(intent);
                            }
                            probe.destroy();
                            if (installed) {
                                resolvePrepare(call, true, true, "android-on-device", "");
                            } else if (pending || downloadable) {
                                resolvePrepare(call, true, false, "android-on-device", "model-not-installed");
                            } else {
                                resolvePrepare(call, true, false, "android-on-device", "language-unsupported");
                            }
                        }

                        @Override
                        public void onError(int error) {
                            probe.destroy();
                            // The check itself is not supported by every
                            // recogniser. Let listening find out.
                            resolvePrepare(call, true, true, "android-on-device", "");
                        }
                    }
                );
            } catch (Exception e) {
                resolvePrepare(call, true, false, "none", "no-on-device-recogniser");
            }
        });
    }

    private static boolean matches(List<String> tags, String wanted) {
        if (tags == null) return false;
        String language = Locale.forLanguageTag(wanted).getLanguage();
        boolean sameLanguage = false;
        for (String tag : tags) {
            if (tag.equalsIgnoreCase(wanted)) return true;
            if (Locale.forLanguageTag(tag).getLanguage().equals(language)) sameLanguage = true;
        }
        return sameLanguage;
    }

    private void resolvePrepare(PluginCall call, boolean microphone, boolean available, String engine, String reason) {
        JSObject result = new JSObject();
        result.put("microphone", microphone);
        result.put("available", available);
        result.put("engine", engine);
        result.put("reason", reason);
        call.resolve(result);
    }

    // ----------------------------------------------------------------- listen

    private Intent recogniserIntent(String localeTag) {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, localeTag);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getContext().getPackageName());
        return intent;
    }

    /**
     * Open the microphone and resolve with what was heard: { text }. An empty
     * string means nothing was heard. Partial transcripts arrive as "partial"
     * events. The system recogniser decides when the speaker has finished.
     */
    @PluginMethod
    public void listen(PluginCall call) {
        if (getPermissionState(MICROPHONE) != PermissionState.GRANTED) {
            call.reject("Microphone permission has not been granted.");
            return;
        }
        if (!hasOnDeviceRecogniser()) {
            call.reject("This device has no on-device speech recogniser.");
            return;
        }

        final String localeTag = call.getString("locale", "en-GB");
        main.post(() -> {
            // One turn at a time. A turn still open is closed empty.
            abandonCurrentTurn();

            listenCall = call;
            lastText = "";
            try {
                recogniser = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
                recogniser.setRecognitionListener(new TurnListener(recogniser));
                recogniser.startListening(recogniserIntent(localeTag));
            } catch (Exception e) {
                destroyRecogniser();
                listenCall = null;
                call.reject("Could not start listening: " + e.getMessage());
            }
        });
    }

    /** End the turn now. The pending listen call resolves with what was heard so far. */
    @PluginMethod
    public void stop(PluginCall call) {
        main.post(() -> {
            if (recogniser != null) {
                final SpeechRecognizer current = recogniser;
                current.stopListening();
                // If the recogniser never answers, the last partial stands.
                main.postDelayed(() -> {
                    if (recogniser == current) complete(lastText);
                }, 2000);
            }
            call.resolve();
        });
    }

    private void complete(String text) {
        PluginCall call = listenCall;
        listenCall = null;
        destroyRecogniser();
        if (call != null) {
            JSObject result = new JSObject();
            result.put("text", text == null ? "" : text.trim());
            call.resolve(result);
        }
    }

    private void fail(String message) {
        PluginCall call = listenCall;
        listenCall = null;
        destroyRecogniser();
        if (call != null) call.reject(message);
    }

    private void abandonCurrentTurn() {
        if (recogniser != null) {
            recogniser.cancel();
            complete("");
        }
    }

    private void destroyRecogniser() {
        if (recogniser != null) {
            try {
                recogniser.destroy();
            } catch (Exception ignored) {
                // Already gone.
            }
            recogniser = null;
        }
    }

    private static String firstResult(Bundle bundle) {
        if (bundle == null) return "";
        ArrayList<String> results = bundle.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        return results == null || results.isEmpty() ? "" : results.get(0);
    }

    private class TurnListener implements RecognitionListener {

        private final SpeechRecognizer owner;

        TurnListener(SpeechRecognizer owner) {
            this.owner = owner;
        }

        private boolean stale() {
            return recogniser != owner;
        }

        @Override
        public void onPartialResults(Bundle partialResults) {
            if (stale()) return;
            String text = firstResult(partialResults);
            if (text.isEmpty()) return;
            lastText = text;
            JSObject event = new JSObject();
            event.put("text", text);
            notifyListeners("partial", event);
        }

        @Override
        public void onResults(Bundle results) {
            if (stale()) return;
            String text = firstResult(results);
            complete(text.isEmpty() ? lastText : text);
        }

        @Override
        public void onError(int error) {
            if (stale()) return;
            switch (error) {
                // Silence, or speech it could not make out. Not a fault.
                case SpeechRecognizer.ERROR_NO_MATCH:
                case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                case SpeechRecognizer.ERROR_CLIENT:
                    complete(lastText);
                    break;
                case SpeechRecognizer.ERROR_LANGUAGE_NOT_SUPPORTED:
                case SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE:
                    fail("model-not-installed");
                    break;
                case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                    fail("microphone-denied");
                    break;
                default:
                    fail("Speech recognition failed (" + error + ").");
            }
        }

        @Override
        public void onReadyForSpeech(Bundle params) {}

        @Override
        public void onBeginningOfSpeech() {}

        @Override
        public void onRmsChanged(float rmsdB) {}

        @Override
        public void onBufferReceived(byte[] buffer) {}

        @Override
        public void onEndOfSpeech() {}

        @Override
        public void onEvent(int eventType, Bundle params) {}
    }

    // ------------------------------------------------------------------ speak

    /** Say the text with the system voice. Resolves when it has finished or been stopped. */
    @PluginMethod
    public void speak(PluginCall call) {
        final String text = call.getString("text", "");
        if (text == null || text.isEmpty()) {
            call.resolve();
            return;
        }
        final String localeTag = call.getString("locale", "en-GB");
        final float rate = call.getFloat("rate", 0.92f);

        main.post(() -> {
            if (tts == null) {
                tts = new TextToSpeech(getContext(), status -> main.post(() -> {
                    ttsReady = status == TextToSpeech.SUCCESS;
                    if (!ttsReady) {
                        tts = null;
                        call.reject("No text-to-speech engine is available.");
                        return;
                    }
                    tts.setOnUtteranceProgressListener(new SpeakListener());
                    speakNow(call, text, localeTag, rate);
                }));
            } else if (ttsReady) {
                speakNow(call, text, localeTag, rate);
            } else {
                call.reject("The text-to-speech engine is still starting.");
            }
        });
    }

    private void speakNow(PluginCall call, String text, String localeTag, float rate) {
        finishSpeaking(false);
        speakCall = call;

        int language = tts.setLanguage(Locale.forLanguageTag(localeTag));
        if (language == TextToSpeech.LANG_MISSING_DATA || language == TextToSpeech.LANG_NOT_SUPPORTED) {
            tts.setLanguage(new Locale(Locale.forLanguageTag(localeTag).getLanguage()));
        }
        tts.setSpeechRate(rate);
        utteranceCounter += 1;
        int queued = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "oliver-" + utteranceCounter);
        if (queued != TextToSpeech.SUCCESS) {
            speakCall = null;
            call.reject("The voice could not speak.");
        }
    }

    @PluginMethod
    public void stopSpeaking(PluginCall call) {
        main.post(() -> {
            if (tts != null) tts.stop();
            finishSpeaking(false);
            call.resolve();
        });
    }

    private void finishSpeaking(boolean completed) {
        PluginCall call = speakCall;
        speakCall = null;
        if (call != null) {
            JSObject result = new JSObject();
            result.put("completed", completed);
            call.resolve(result);
        }
    }

    private class SpeakListener extends UtteranceProgressListener {

        private boolean current(String utteranceId) {
            return ("oliver-" + utteranceCounter).equals(utteranceId);
        }

        @Override
        public void onStart(String utteranceId) {}

        @Override
        public void onDone(String utteranceId) {
            main.post(() -> {
                if (current(utteranceId)) finishSpeaking(true);
            });
        }

        @Override
        public void onError(String utteranceId) {
            main.post(() -> {
                if (current(utteranceId)) finishSpeaking(false);
            });
        }

        @Override
        public void onStop(String utteranceId, boolean interrupted) {
            main.post(() -> {
                if (current(utteranceId)) finishSpeaking(false);
            });
        }
    }

    @Override
    protected void handleOnDestroy() {
        destroyRecogniser();
        if (tts != null) {
            tts.shutdown();
            tts = null;
        }
        super.handleOnDestroy();
    }
}
