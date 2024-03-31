<template>
  <div class="chat-container">
    <v-sheet class="mx-auto mt-1 container" elevation="4" max-width="85%" max-height="60vh" style="display: block;">
      <Message v-for="(message, index) in messages" :key="index" :msg="message" />
    </v-sheet>
    <v-sheet class="mx-auto mt-1 container pa-5" elevation="4" max-width="85%">
      <div class="d-flex" style="width: 100%;">
        <audio controls style="display: none;" ref="audioElement"></audio>
        <v-textarea label="¿Cuál es tu dolencia?" variant="underlined" class="me-5" v-model="message"></v-textarea>
        <v-btn @click="userInput" icon="mdi-send" class="align-self-center"></v-btn>
        <v-btn ref="btnStart" icon="mdi-microphone" class="align-self-center"></v-btn>
        <v-btn ref="btnStop" icon="mdi-stop" class="align-self-center"></v-btn>
        <audio controls id="audioPlay" style="display: block;" ref="audioElement"></audio>
      </div>
    </v-sheet>
  </div>
</template>

<script>
// El siguiente componente sirve para mostrar los mensajes de los usuarios, permite el input en texto y voz.
import Message from './Message.vue'
import { reactive, ref } from 'vue'
import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;
import { v4 as uuidv4 } from 'uuid';


import AWS from 'aws-sdk'
import { StartTranscriptionJobCommand, TranscribeClient } from "@aws-sdk/client-transcribe";
import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME, AWS_S3_URI } from "../../aws"

export default {
  components: {
    Message
  },
  setup() {
    const audioElement = ref(null);
    const btnStop = ref(null)
    const btnStart = ref(null)

    const message = ref(null);
    const messages = reactive([]);

    let s3 = undefined;


    // La siguiente funcion se encarga de procesar y mostrar los inputs en forma de audio y los renderiza en la interfaz.

    const language = "es-ES";
    let transcribeClient = undefined;

    // Se asocia el microfono del usuario con una callback function que procesa la respuesta.
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (mediaStreamObj) {

        let playAudio = document.getElementById('audioPlay');
        let start = btnStart.value.$el
        let stop = btnStop.value.$el

        // This is the main thing to recorded 
        // the audio 'MediaRecorder' API
        let mediaRecorder = new MediaRecorder(mediaStreamObj, { audioBitsPerSecond: 5000 });
        // Pass the audio stream 

        // Start event
        start.addEventListener('click', function (ev) {
          mediaRecorder.start();
        })

        // Stop event
        stop.addEventListener('click', function (ev) {
          mediaRecorder.stop();
        });

        // If audio data available then push 
        // it to the chunk array
        mediaRecorder.ondataavailable = function (ev) {
          dataArray.push(ev.data);
        }

        // Chunk array to store the audio data 
        let dataArray = [];

        // Convert the audio data in to blob 
        // after stopping the recording
        mediaRecorder.onstop = function (ev) {

          // blob of type wav
          let audioData = new Blob(dataArray,
            { 'type': 'audio/wav' });

          // array make it empty
          dataArray = [];

          // Creating audio url with reference 
          // of created blob named 'audioData'
          let audioSrc = window.URL
            .createObjectURL(audioData);

          playAudio.src = audioSrc;

          //Creating bucket file name:
          let bucketFileName = "shaman-input-" + uuidv4() + ".wav"
          createBucketClient();
          uploadFileToBucket(bucketFileName, audioData);
          createTranscribeClient()
          transcribeAudioFile(bucketFileName)
          getTranscription(bucketFileName)
        }
      })
      .catch(function (err) {
        console.log(err.name, err.message);
      });



    // Se crea el cliente AWS TRANSCRIBE.
    const createTranscribeClient = () => {
      transcribeClient = new TranscribeClient({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      });
    };

    //Esta funcion se encarga de crear un cliente de aws s3 bucket.
    const createBucketClient = async () => {
      AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION // Por ejemplo, 'us-east-1'
      });
      s3 = new AWS.S3()
    }

    // Esta funcion se encarga de subir la grabacion a un bucket s3.
    const uploadFileToBucket = async (fileName, audioBlob) => {
      const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: audioBlob
      };

      // Subir el archivo a S3
      s3.upload(params, function (err, data) {
        if (err) {
          console.error('Error al subir el archivo a S3:', err);
        } else {
          console.log('Archivo subido exitosamente a S3:', data.Location);
        }
      });
    }

    // Envia a AWS para hacer la transcripcion del audio
    const transcribeAudioFile = async (bucketFileName) => {
      const params = {
        TranscriptionJobName: bucketFileName,
        LanguageCode: language, // For example, 'en-US'
        Media: {
          MediaFileUri: AWS_S3_URI + bucketFileName,
        },
        MediaFormat: "wav",
        OutputBucketName: BUCKET_NAME,
      };

      try {
        const data = await transcribeClient.send(
          new StartTranscriptionJobCommand(params)
        );
        console.log("Success - put", data);
        return data; // For unit tests.
      } catch (err) {
        console.log("Error", err);
      }

    };

    const getTranscription = async (fileName) => {
      setTimeout(() => {
        const params = {
          Bucket: BUCKET_NAME,
          Key: fileName + ".json",
        };
        s3.getObject(params, function (err, data) {
          if (err) {
            console.error('Error al descargar el archivo desde S3:', err);
          } else {
            console.log("El data es", data.Body)
          }
        });

      },40000)

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

    return { audioElement, btnStop, btnStart, userInput, message, messages };
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
