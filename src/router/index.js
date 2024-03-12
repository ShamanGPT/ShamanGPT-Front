import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'
import HomeView from '../views/HomeView.vue'
import Favoritos from '../components/Favoritos.vue'
import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'
import {getAuth, onAuthStateChanged} from 'firebase/auth'

const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory("/"),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: false,
        hideApp: true
      }
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
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
    },
    {
      path: '/register',
      name: 'register',
      component: Register
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

router.beforeEach(async (to, from, next) => {
  const currentUser = await getCurrentUser();
  
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (currentUser) {
      next();
    } else {
      alert('Para acceder al chat primero debes loguearte');
      next("/login");
    }
  } else {
    if (to.path === "/" && currentUser) {
      next("/chat");
    } else {
      next(); 
    }
  }
});



export default router