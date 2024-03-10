<template>
    <div class="container">
        <h1 class="title">Recetas Favoritas</h1>
        <button class="addButon" @click="mostrarFormulario">
            Añadir receta
        </button>
        <div v-if="mostrarForm" class="form-container">
            <h2>Agregar Nueva Receta</h2>
            <form @submit.prevent="agregarReceta" class="form">
                <div class="form-group">
                    <label for="titulo">Título:</label>
                    <input type="text" id="titulo" v-model="nuevaReceta.titulo" required>
                </div>
                <div class="form-group">
                    <label for="instruccion">Instrucción:</label>
                    <textarea id="instruccion" v-model="nuevaReceta.instruccion" required></textarea>
                </div>
                <button type="submit" class="submitButton">Agregar</button>
            </form>
        </div>
        <div class="card-container">
            <div v-for="receta in recetas" :key="receta.id" class="card">
                <h2>{{ receta.titulo }}</h2>
                <p>{{ receta.instruccion }}</p>
                <button class="addButon" @click="eliminarReceta(receta)">Eliminar</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'

export default {
    setup() {
        const recetas = ref([])
        const mostrarForm = ref(false)
        const nuevaReceta = ref({ titulo: '', instruccion: '' })

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
                        // console.log(data.receteas)
                    } else {
                        console.log('El campo "receteas" no es un array o no existe en el documento de usuario.');
                    }
                } else {
                    console.log('No se encontró el usuario con el correo electrónico:', userEmail);
                }
            });
        }

        const mostrarFormulario = () => {
            mostrarForm.value = !mostrarForm.value
        }

        const agregarReceta = async () => {
            console.log(usuario.value.email)
            try {
                const usuarioRef = doc(db, 'usuarios', usuario.value.email)
                await updateDoc(usuarioRef, {
                    receteas: [...recetas.value, nuevaReceta.value]
                })
                nuevaReceta.value = { titulo: '', instruccion: '' }
                mostrarForm.value = false
                obtenerRecetasFavoritas(usuario.value.email)
            } catch (error) {
                console.error('Error al agregar la receta:', error)
            }
        }

        const eliminarReceta = async (receta) => {
            try {
                const usuarioRef = doc(db, 'usuarios', usuario.value.email)
                const nuevasRecetas = recetas.value.filter(item => 
                    item.titulo !== receta.titulo || item.instruccion !== receta.instruccion
                );
                await updateDoc(usuarioRef, {
                    receteas: nuevasRecetas
                });
                obtenerRecetasFavoritas(usuario.value.email);
            } catch (error) {
                console.error('Error al eliminar la receta:', error)
            }
        }

        return { recetas, mostrarForm, nuevaReceta, mostrarFormulario, agregarReceta, eliminarReceta }
    }
}
</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .title {
        margin-top: 20px;
    }

    .card-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        /* margin-top: 20px;
        margin-bottom: 20px; */
        padding-top: 15px;
    }

    .card {
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 0px 5px 5px;
        width: 50vw;
        height: 20vh; 
        word-wrap: break-word;
        overflow-y: auto;
    }

    .card h2 {
        margin-top: 0px;
    }

    .addButon {
        margin-top: 1%;
        background-color: #089B27; /* Color azul claro que combina bien */
        border: none;
        border-radius: 20px; /* Ajusta el valor según el radio que desees */
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease; /* Efecto de transición suave */
    }

    .addButon:hover {
        background-color: #1D6303; /* Cambia de color al pasar el ratón */
    }

    form {
        margin-top: 20px;
    }

    form label {
        display: block;
        margin-bottom: 5px;
    }

    form input, form textarea, form button {
        width: 100%; 
        padding: 8px; 
        border-radius: 5px; 
        border: 1px solid #ccc; 
        margin-bottom: 10px;
        max-height: 100px;
    }

    form button {
        background-color: #089B27; 
        cursor: pointer; 
        transition: background-color 0.3s ease; 
    }

    form button:hover {
        background-color: #1D6303; /* Cambia de color al pasar el ratón */
    }

    .form-container {
        margin-top: 20px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .form-group {
        margin-bottom: 10px;
    }

    .form textarea {
        border: 1px solid #ccc;
    }
</style>
