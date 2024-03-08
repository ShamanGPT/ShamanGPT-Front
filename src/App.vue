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
            router.push('/chat')
        }
        return {toggleTheme, theme, navigateToFavorites, navigateToChat}
    },
}
</script>