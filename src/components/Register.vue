<template>
    <div class="login-container">
        <h2>Registro</h2>
        <form @submit.prevent="register">
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
            <label for="password">Contraseña:</label>
            <input type="password" id="password" v-model="password" required>
        </div>
        <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña:</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" required>
        </div>
        <button type="submit">Registrarse</button>
        </form>
    </div>
</template>

<script>
  import { ref } from 'vue';
  import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
  import { doc, setDoc } from 'firebase/firestore';
  import router from '../router';
  import { getFirestore } from 'firebase/firestore';
  
  export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');

    const register = async () => {
      if (password.value !== confirmPassword.value) {
        console.error('Las contraseñas no coinciden.');
        return;
      }

      const auth = getAuth();
      const db = getFirestore();

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.value,
          password.value
        );

        // Usuario registrado con éxito
        console.log('Usuario registrado:', userCredential.user);

        // Actualizar el documento del usuario en Firestore para incluir el campo receteas
        const userRef = doc(db, 'usuarios', userCredential.user.email);
        await setDoc(userRef, { receteas: [] });

        router.push('/');
      } catch (error) {
        // Si hay un error durante el registro
        console.error('Error de registro:', error.message);
      }
    };

    return { email, password, confirmPassword, register };
  },
};

</script>
  
  <style scoped>
  .login-container {
    max-width: 300px;
    margin: 0 auto;
    padding: 20px;
    margin-top: 5%;
    border: 1px solid #ccc;
    border-radius: 5px;
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
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  