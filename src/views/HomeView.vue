<template>
  <div class="home-view">
    <div class="left-side">
      <img src="../assets/fondo.jpg" alt="fondo" />
    </div>
    <div class="right-side">
      <h1>Comenzar</h1>
      <div class="button-container">
        <v-btn class="custom-button" @click="navigateToLogin">Iniciar Sesión</v-btn>
        <v-btn class="custom-button" @click="navigateToRegister">Registro</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToLogin = () => {
  router.push('/login');
}

const navigateToRegister = () => {
  router.push('/register');
}
</script>

<style scoped>
html, body {
  overflow-y: hidden;
}

.home-view {
  display: flex;
  height: 100vh; 
}

.left-side {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.left-side img {
  height: 100%; 
  width: 100%;
}

.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: auto;
}

.button-container {
  margin-top: 10px;
  width: auto;
  justify-content: center;
  align-items: center;
  display:flex;
}

.custom-button {
  width: 13vw;
  background-color: #089B27;
  font-size: 1.0vw;
}

.custom-button:hover{
  background-color: #1D6303;
}

.v-btn {
  margin: 10px;
}

h1 {
  font-size: 3vw; 
}
</style>
