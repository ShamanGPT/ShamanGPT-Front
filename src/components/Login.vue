<template>
  <div class="login-container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="text" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Iniciar Sesión</button>
    </form>
    <p>¿No tienes cuenta? <router-link to="/register">Regístrate</router-link>.</p>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import router from '../router/index.js'
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth'

export default {
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async login() {
      const auth = getAuth()
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        // Usuario autenticado con éxito
        console.log('Usuario autenticado:', userCredential.user);
        router.push('/')
      } catch (error) {
        // Si hay un error durante la autenticación
        console.error('Error de autenticación:', error.message);
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px;
  margin-top: 5%;
  border: 1px solid #ccc;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  padding: 10px 20px;
  background-color: #089B27;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}

button:hover {
  background-color: #1D6303;
}

p {
  margin-top: 10px;
  text-align: center;
}

router-link {
  color: blue;
}
</style>
