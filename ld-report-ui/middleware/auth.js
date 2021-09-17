export default function ({ route, store, redirect }) {
  if (
    store.getters.role === 'guest' &&
    !['/register', '/login'].includes(route.path)
  ) {
    return redirect('/login')
  } else if (
    store.getters.role !== 'guest' &&
    ['/register', '/login'].includes(route.path)
  ) {
    return redirect('/')
  }
}
