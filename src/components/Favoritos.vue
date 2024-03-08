<template>
    <div>
        <h1>Favoritos</h1>
        <ul>
            <li v-for="receta in recetas" :key="receta.id">
                {{ receta.titulo }} - {{ receta.instruccion }}
            </li>
        </ul>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, query, where, onSnapshot, doc } from 'firebase/firestore'

export default {
    setup() {
        const recetas = ref([])

        // Obtener información del usuario autenticado
        const auth = getAuth()
        const usuario = ref(auth.currentUser)
        // console.log(usuario)
        const db = getFirestore()
        onMounted(() => {
            // Escuchar cambios en la autenticación
            onAuthStateChanged(auth, (user) => {
                usuario.value = user
                if (user) {
                    // Si el usuario está autenticado, obtener las recetas favoritas
                    // console.log(user.email)
                    obtenerRecetasFavoritas(user.email)
                } else {
                    recetas.value = [] // Limpiar las recetas si no hay usuario autenticado
                }
            })
        })
      
        const obtenerRecetasFavoritas = (userEmail) => {
            const usuarioRef = doc(db, 'usuarios', userEmail); // Obtener referencia al documento de usuario
            // console.log(usuarioRef)
            onSnapshot(usuarioRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    if (data.receteas && Array.isArray(data.receteas)) {
                        recetas.value = data.receteas;
                        console.log(data.receteas)
                    } else {
                        console.log('El campo "receteas" no es un array o no existe en el documento de usuario.');
                    }
                } else {
                    console.log('No se encontró el usuario con el correo electrónico:', userEmail);
                }
            });

        }

        return {
            recetas
        }
    }
}
</script>

<style>

</style>
