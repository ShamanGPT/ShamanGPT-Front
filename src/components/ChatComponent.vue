<template>
  <div class="chat-container">
    <v-sheet
      class="mx-auto mt-1 container"
      elevation="4"
      max-width="85%"
      max-height="60vh"
      style="display: block;"
    >
      <Message v-for="(message, index) in messages" :key="index" :msg="message" />
    </v-sheet>
    <v-sheet
      class="mx-auto mt-1 container pa-5"
      elevation="4"
      max-width="85%"
    >
      <div class="d-flex" style="width: 100%;">
        <v-textarea
          label="¿Cuál es tu dolencia?"
          variant="underlined"
          class="me-5"
          v-model="message"
        ></v-textarea>
        <v-btn
          @click="userInput"
          icon="mdi-send"
          class="align-self-center"
        ></v-btn>
        <v-btn
          @click="startRecordingOnButtonClick"
          icon="mdi-microphone"
          class="align-self-center"
        ></v-btn>
      </div>
    </v-sheet>
  </div>
</template>

<script>
// El siguiente componente sirve para mostrar los mensajes de los usuarios, permite el input en texto y voz.
import Message from './Message.vue'
import { reactive, ref } from 'vue'
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";
import MicrophoneStream from "microphone-stream";
import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;
// UPDATE THIS ACCORDING TO YOUR AWS CREDENTIALS:
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "../../aws"

export default {
  components: {
    Message
  },

  setup() {
    const message = ref(null);
    const messages = reactive([]);


    //funcion para guardar en local y saber si sí está grabando xde luego se elimina
    const saveRecording = (audioBlob) => {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'grabacion_audio.webm';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const language = "es-ES";
    const SAMPLE_RATE = 44100;
    let mediaRecorder = null;

    // Maneja el evento cuando se presiona el microfono y llama a la funcion principal (startRecording)
    const startRecordingOnButtonClick = async () => {
      await startRecording();
    };

    // Se usa para escribir la transcripcion en el html.
    const handleTranscription = (transcription) => {
      messages.push({
        role: 'user',
        content: transcription
      });
    };

    // Pulse-code modulation, para representar señales análogas de manera digital.
    const encodePCMChunk = (chunk) => {
      let offset = 0;
      const buffer = new ArrayBuffer(chunk.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < chunk.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, chunk[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
      return Buffer.from(buffer);
    };


    //función que manda el audio al servicio Transcribe
    const sendAudioToTranscribe = async (audioArrayBuffer) => {
      const client = new TranscribeStreamingClient({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY
        }
      });

      // Empieza la transmision de la voz hacia el cliente AWS. 
      const command = new StartStreamTranscriptionCommand({
        LanguageCode: language,
        MediaEncoding: 'pcm',
        MediaSampleRateHertz: SAMPLE_RATE,
        AudioStream: new Uint8Array(audioArrayBuffer)
      });

      try {
        console.log("llegué hasta aquí")
        const response = await client.send(command);
        console.log("response",response)
        const transcription = response.TranscriptResultStream.TranscriptEvent.Transcript.Results.reduce((prev, curr) => prev + curr.Alternatives[0].Transcript, '');
        handleTranscription(transcription);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    // La siguiente función empieza a grabar,  es la principal.
    const startRecording = async () => {
      if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        alert("Set AWS env variables first.");
        return false;
      }

      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        alert("Grabación detenida")
        return;
      }

      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(audioStream);

      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks);
        saveRecording(audioBlob);
        const audioArrayBuffer = await audioBlob.arrayBuffer();
        sendAudioToTranscribe(audioArrayBuffer);
      };

      mediaRecorder.start();
      alert("Grabando...Vuelva a presionar el icono para detener")
    }

    // La siguiente funcion se encarga de procesar los inputs en forma de texto y los renderiza en la interfaz.
    const userInput = async () => {
      messages.push({
        role: 'user',
        content: message.value
      });

      try {
        console.log("message:", message.value)
        const fetchResponse = async () => {
          const response = await fetch('https://shamangpt-back.onrender.com/ask', {
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

    return { startRecordingOnButtonClick, userInput, message, messages };
  }
}
</script>

<style scoped>
.chat-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}

.container {
  overflow-y: auto;
  flex-direction: column;
}


</style>
