<template>
  <div class="chat-container">
    <v-sheet
      class="mx-auto mt-1 container"
      elevation="4"
      max-width="85%"
      style="max-height: 60vh;"
    >
      <Message v-for="(message, index) in messages" :key="index" :msg="message" />
    </v-sheet>
    <v-sheet
      class="mx-auto mt-1 container pa-5"
      elevation="4"
      max-width="85%"
      height="auto"
    >
      <div class="d-flex">
        <v-textarea
          label="prompt"
          variant="underlined"
          class="me-5"
          v-model="message"
        ></v-textarea>
        <v-btn
          @click="userInput"
          icon="mdi-send"
          class="align-self-center"
        ></v-btn>
      </div>
    </v-sheet>
  </div>
</template>

<script>
import Message from './Message.vue'
import { reactive, ref } from 'vue'

export default {
  components: {
    Message
  },
  setup() {
    const message = ref(null);
    const messages = reactive([]);

    const userInput = async () => {
      messages.push({
        role: 'user',
        content: message.value
      });

      try {
        console.log("message:", message.value )
        const fetchResponse = async () => {
          const response = await fetch('https://invumg5xnqt3abifoqqx5sdxni0ayceb.lambda-url.us-east-1.on.aws/ask', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message.value })
          });
          
          
          if (!response.ok) {
            throw new Error('Ha ocurrido un error');
          }

          return await response.json();
        };

        const responseData = await fetchResponse();

        messages.push({
          role: 'bot',
          content: responseData.content
        });
      } catch (error) {
        console.error('Error:', error);
      }

      message.value = null;
    }

    return { userInput, message, messages };
  }
}
</script>

<style scoped>
.chat-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  /* padding-bottom:  */
}

.container {
  max-height: 75vh;
  overflow-y: auto;
  flex-direction: column;
}


</style>
