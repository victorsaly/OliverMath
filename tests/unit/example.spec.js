import { describe, it, expect, beforeAll, vi } from 'vitest'

// Mock Speech APIs before importing Home component
beforeAll(() => {
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
})

describe('Home.vue', () => {
  it('renders home vue', async () => {
    const { mount } = await import('@vue/test-utils')
    const Home = (await import('@/views/Home.vue')).default
    
    const wrapper = mount(Home)
    expect(wrapper.find('.start-button')).toBeTruthy()
  })
})
