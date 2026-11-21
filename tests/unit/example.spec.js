import { describe, it, expect, vi } from 'vitest'

// lottie-web starts a timer the moment it is imported, polling
// document.readyState. On a slower machine that timer fires after the test
// environment has gone and fails the run with "document is not defined".
// Stubbing the component is not enough, because the import still happens, so
// the library itself is replaced here.
vi.mock('vue3-lottie', () => ({
  Vue3Lottie: { name: 'Vue3Lottie', render: () => null }
}))

describe('Home.vue', () => {
  it('renders the game with a Play button', async () => {
    const { mount } = await import('@vue/test-utils')
    const Home = (await import('@/views/Home.vue')).default

    // The robot is stubbed: jsdom has no WebGL to draw it with.
    const wrapper = mount(Home, {
      global: { stubs: { AnimatedBot: true, 'router-link': true } }
    })

    // find() always returns a wrapper, so the old toBeTruthy() check passed
    // whether or not the button was there.
    expect(wrapper.find('.round-btn.play').exists()).toBe(true)

    wrapper.unmount()
  })
})
