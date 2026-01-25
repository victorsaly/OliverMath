import { vi } from 'vitest'

// Mock canvas context for lottie-web
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillStyle: '',
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: [] })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}))

// Mock lottie-web
vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: vi.fn().mockReturnValue({
      destroy: vi.fn(),
      play: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      setSpeed: vi.fn(),
      goToAndStop: vi.fn(),
      goToAndPlay: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  },
}))

// Mock SpeechSynthesis
window.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn().mockReturnValue([])
}

// Mock SpeechSynthesisUtterance
window.SpeechSynthesisUtterance = class {
  constructor() {
    this.text = ''
    this.voice = null
    this.rate = 1
    this.pitch = 1
  }
}

// Mock AudioContext
window.AudioContext = vi.fn().mockImplementation(() => ({
  createAnalyser: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    fftSize: 256,
    frequencyBinCount: 128,
    getByteFrequencyData: vi.fn(),
  }),
  createMediaElementSource: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  close: vi.fn(),
  destination: {},
}))
