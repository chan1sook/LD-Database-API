export const state = () => ({
  user: null,
})

export const getters = {
  role(state) {
    if (!state.user || !state.user.role) {
      return 'guest'
    }
    return state.user.role
  },
  userImage(state) {
    if (!state.user || !state.user.role || state.user.role === 'guest') {
      return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp'
    }
    return `https://ui-avatars.com/api/?name=${state.user.firstName}+${state.user.lastName}`
  },
}

export const mutations = {
  SET_USER(state, user) {
    state.user = user
  },
}

export const actions = {
  async nuxtServerInit({ commit }, { req, $axios }) {
    try {
      const { response: userData } = await $axios.$get('/api/user')
      commit('SET_USER', userData)
    } catch (error) {
      console.error(error)
    }
  },
}
