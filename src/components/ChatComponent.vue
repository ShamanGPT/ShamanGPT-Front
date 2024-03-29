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

    // Maneja el evento cuando se presiona el microfono y llama a la funcion principal (startRecording)
    const startRecordingOnButtonClick = async () => {
      await startRecording(handleTranscription);
    };

    // Se usa para escribir la transcripcion en el html.
    const handleTranscription = (transcription) => {
      messages.push({
        role: 'user',
        content: transcription
      });
    };
    // La siguiente funcion se encarga de procesar y mostrar los inputs en forma de audio y los renderiza en la interfaz.

    let microphoneStream = undefined;
    const language = "es-ES";
    const SAMPLE_RATE = 44100;
    let transcribeClient = undefined;
    // Se crea el stream de audio.
    const createMicrophoneStream = async () => {
      microphoneStream =
        await window.navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        })

    };
    // Se crea el cliente AWS TRANSCRIBE.
    const createTranscribeClient = () => {
      transcribeClient = new TranscribeStreamingClient({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      });
    };
    //Pulse-code modulation, para representar señales análogas de manera digital.
    const encodePCMChunk = (chunk) => {
      const input = MicrophoneStream.toRaw(chunk);
      let offset = 0;
      const buffer = new ArrayBuffer(input.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < input.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
      return Buffer.from(buffer);
    };
    // Acomoda los chunks de audio en un formato que AWS TRANSCRIBE acepte.
    const getAudioStream = async function* () {
      for await (const chunk of microphoneStream) {
        if (chunk.length <= SAMPLE_RATE) {
          yield {
            AudioEvent: {
              AudioChunk: encodePCMChunk(chunk),
            },
          };
        }
      }
    };
    // Empieza la transmision de la voz hacia el cliente AWS. 
    const startStreaming = async (language, callback) => {
      const command = new StartStreamTranscriptionCommand({
        LanguageCode: language,
        MediaEncoding: "pcm",
        MediaSampleRateHertz: SAMPLE_RATE,
        AudioStream: getAudioStream(),
      });
      const data = await transcribeClient.send(command);
      for await (const event of data.TranscriptResultStream) {
        const results = event.TranscriptEvent.Transcript.Results;
        if (results.length && !results[0]?.IsPartial) {
          const newTranscript = results[0].Alternatives[0].Transcript;
          console.log(newTranscript);
          callback(newTranscript + " ");
        }
      }
    };
    // La siguiente función empieza a grabar,  es la principal.
    const startRecording = async (callback) => {
      if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        alert("Set AWS env variables first.");
        return false;
      }

      if (microphoneStream || transcribeClient) {
        stopRecording();
      }
      createTranscribeClient();
      createMicrophoneStream();
      await startStreaming(language, callback);
    };

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
