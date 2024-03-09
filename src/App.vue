<template>
    <v-app>
        <v-app-bar>
            <v-app-bar-title>ChamanGPT</v-app-bar-title>
            <v-btn @click="navigateToChat">
                Chat
            </v-btn>                        
            <v-btn @click="navigateToFavorites">
                Favoritos
            </v-btn>
            <v-btn @click="toggleTheme" 
            :icon="theme.global.current.value.dark ? 
            'mdi-weather-night' : 'mdi-weather-sunny'">
            </v-btn>
            <v-btn @click="logOut">
                Cerrar Sesión
            </v-btn>
        </v-app-bar>
        <v-main>
            <RouterView />
        </v-main>
    </v-app>
</template>
<script>

import {useTheme} from 'vuetify'
import {RouterView} from 'vue-router'
import router from './router/index.js'
import { getAuth, signOut } from 'firebase/auth';

export default {
    components: {
        RouterView
    },
    setup() {
        const theme = useTheme()
        
        const toggleTheme = () => {
            theme.global.name.value = theme.global.current.value.dark ?
             'light' : 'dark' 
        }

        const navigateToFavorites = () => {
            // Inserta aquí el código para navegar a la ruta '/favoritos'
            // Ejemplo:
            router.push('/favoritos')
        }

        const navigateToChat = () => {
            // Inserta aquí el código para navegar a la ruta '/favoritos'
            // Ejemplo:
            router.push('/')
        }

        const logOut = async () => {
            const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
            if (confirmed) {
                const auth = getAuth();
                try {
                await signOut(auth);
                router.push('/login');
                } catch (error) {
                console.error('Error al cerrar sesión:', error);
                }
            }
        };
    
        return {toggleTheme, theme, navigateToFavorites, navigateToChat, logOut}
    },
}
</script>