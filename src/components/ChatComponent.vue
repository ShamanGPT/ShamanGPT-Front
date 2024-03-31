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
      </div>
      <v-btn
        @click="startRecording((text) => {
          message += text
        } )"
      >
        Micrófono
      </v-btn>
    </v-sheet>
  </div>
</template>

<script>
import Message from './Message.vue'
import { reactive, ref } from 'vue'
import { TranscribeStreamingClient, StartStreamTranscriptionCommand } from "@aws-sdk/client-transcribe-streaming";
import MicrophoneStream from "microphone-stream";
import Buffer from "buffer";

// UPDATE THIS ACCORDING TO YOUR AWS CREDENTIALS:
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "../../aws";

export default {
  components: {
    Message
  },
  setup() {
    const message = ref(null);
    const messages = reactive([]);
    let microphoneStream = undefined;
    const language = "es-ES";
    const SAMPLE_RATE = 44100;
    let transcribeClient = undefined;

    const userInput = async () => {
      messages.push({
        role: 'user',
        content: message.value
      });

      try {
        console.log("message:", message.value )
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

    const createMicrophoneStream = async () => {
      microphoneStream = new MicrophoneStream();
      microphoneStream.setStream(
        await window.navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        })
      );
    };

    const createTranscribeClient = () => {
      transcribeClient = new TranscribeStreamingClient({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      });
    };

    const encodePCMChunk = (chunk) => {
      const input = MicrophoneStream.toRaw(chunk);
      let output = new Uint8Array(input.length * 2);
      let outputOffset = 0;
      for (let i = 0; i < input.length; i++, outputOffset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        let val = s < 0 ? s * 0x8000 : s * 0x7fff;
        output[outputOffset] = val & 0xff;
        output[outputOffset + 1] = (val >> 8) & 0xff;
      }
      return output;
    };  

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

    const stopRecording = function () {
      if (microphoneStream) {
        microphoneStream.stop();
        microphoneStream.destroy();
        microphoneStream = undefined;
      }
    };

    return { userInput, createMicrophoneStream, createTranscribeClient, encodePCMChunk, getAudioStream, startStreaming, startRecording, stopRecording, message, messages, microphoneStream, language, SAMPLE_RATE, transcribeClient };
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
