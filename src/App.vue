<template>
    <v-app>
        <v-app-bar v-if="showApp">
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
import {RouterView, useRouter} from 'vue-router'
import router from './router/index.js'
import { getAuth, signOut } from 'firebase/auth';
import { computed } from 'vue';

export default {
    components: {
        RouterView
    },
    setup() {
        const router = useRouter();
        const theme = useTheme()
        const showApp = computed(() => {
            return !router.currentRoute.value.meta.hideApp;
        });
        
        const toggleTheme = () => {
            theme.global.name.value = theme.global.current.value.dark ?
             'light' : 'dark' 
        }

        const navigateToFavorites = () => {
            router.push('/favoritos')
        }

        const navigateToChat = () => {
            router.push('/chat')
        }

        const logOut = async () => {
            const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
            if (confirmed) {
                const auth = getAuth();
                try {
                await signOut(auth);
                router.push('/');
                } catch (error) {
                console.error('Error al cerrar sesión:', error);
                }
            }
        };
    
        return {toggleTheme, theme, navigateToFavorites, navigateToChat, logOut, showApp }
    },
}
</script>