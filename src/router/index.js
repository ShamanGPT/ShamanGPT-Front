import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Favoritos from '../components/Favoritos.vue'
import Login from '@/components/Login.vue'
import {getAuth, onAuthStateChanged} from 'firebase/auth'

const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory("/"),
  routes: [
    {
      path: '/chat',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/favoritos',
      name: 'favoritos',
      component: Favoritos,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener()
        resolve(user)
      },
      reject
    )
  })
}

router.beforeEach( async (to, from, next) => {
  if(to.matched.some((record) => record.meta.requiresAuth)){
    if(await getCurrentUser()){
      next()
    }
    else{
      alert('Para acceder al chat primero debes loguearte')
      next('/login')
    }
  }
  else {
    next()
  }
} )

export default router