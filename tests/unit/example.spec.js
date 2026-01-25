import { describe, it, expect } from 'vitest'

describe('Home.vue', () => {
  it('renders home vue', async () => {
    const { mount } = await import('@vue/test-utils')
    const Home = (await import('@/views/Home.vue')).default
    
    const wrapper = mount(Home)
    expect(wrapper.find('.start-button')).toBeTruthy()
  })
})
