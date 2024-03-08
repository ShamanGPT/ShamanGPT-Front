import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeApp } from "firebase/app";

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Vue.config.productionTip = false

const firebaseConfig = {
  apiKey: "AIzaSyCw-FSERPuOXHOpdFu-2cRnwTVeA1Np0rs",
  authDomain: "loginshamangpt.firebaseapp.com",
  projectId: "loginshamangpt",
  storageBucket: "loginshamangpt.appspot.com",
  messagingSenderId: "30967393825",
  appId: "1:30967393825:web:76e6c21e6fb37601f3fd60",
  measurementId: "G-T24X8QV40M"
};

initializeApp(firebaseConfig);

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark'
  }
})

const app = createApp(App).use(vuetify)

app.use(router)

app.mount('#app')