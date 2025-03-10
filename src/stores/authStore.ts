import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { type User } from 'src/models'
import { useRouter } from 'vue-router'
import { Loading, Notify, useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const $q = useQuasar()
  const isLogin = computed(() => {
    return user.value !== null
  })
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  function saveUserToStorage() {
    // localStorage.setItem('user', JSON.stringify(user.value))
    $q.localStorage.setItem('user', user.value)
    $q.localStorage.setItem('token', token.value)
  }
  function loadUserFromStorage() {
    user.value = $q.localStorage.getItem('user')
    token.value = $q.localStorage.getItem('token')
  }
  function clearUserFromStroage() {
    $q.localStorage.removeItem('user')
    $q.localStorage.remove('token')
  }
  async function login(email: string, password: string): Promise<boolean> {
    try {
      Loading.show()
      const res = await api.post('/auth/login', { login: email, password: password })
      user.value = res.data.user
      token.value = res.data.access_token
      saveUserToStorage()
      return true
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Add failed',
        icon: 'report_problem'
      })
      return false
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  function logout() {
    router.replace({ path: '/login' })
    clearUserFromStroage()
    user.value = null
    token.value = null
  }
  loadUserFromStorage()
  return { login, isLogin, logout, user, token }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
