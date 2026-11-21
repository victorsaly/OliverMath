import { describe, it, expect } from 'vitest'

describe('Home.vue', () => {
  it('renders the game with a Play button', async () => {
    const { mount } = await import('@vue/test-utils')
    const Home = (await import('@/views/Home.vue')).default

    // The robot is stubbed. jsdom has no WebGL, so the real component falls
    // back to a Lottie animation that keeps loading after the test has ended
    // and throws "document is not defined" once the environment is torn down.
    const wrapper = mount(Home, {
      global: { stubs: { AnimatedBot: true, 'router-link': true } }
    })

    // find() always returns a wrapper, so the old toBeTruthy() check passed
    // whether or not the button was there.
    expect(wrapper.find('.round-btn.play').exists()).toBe(true)

    wrapper.unmount()
  })
})
