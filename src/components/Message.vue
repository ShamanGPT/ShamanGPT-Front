<template>
  <div class="content">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-end" v-if="message.role === 'user'">
          <v-sheet class="ma-2 pa-2 user-bubble":style="{ borderRadius: '10px'}">
            <div class="bubble-content">
              <pre class="preWrap">{{ message.content }}</pre>
              <v-icon class="user-icon">mdi-account</v-icon>
            </div>
          </v-sheet>
        </div>
        <div class="d-flex justify-start" v-else>
          <v-sheet class="ma-2 pa-2 bot-bubble":style="{ borderRadius: '10px' }">
            <pre class="preWrap">{{ message.content }}</pre>
          </v-sheet>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: ['msg'],
  setup(props) {
    const message = props.msg;
    return { message };
  },
};
</script>

<style scoped>
.content {
  overflow-x: hidden;
  overflow-y: hidden;
  padding-left: 30px;
  padding-right: 60px;
}

.preWrap {
  white-space: pre-wrap;
}

.user-bubble {
  background-color: #388e3c;
}

.bot-bubble {
  background-color: #08a5a3;
}

.user-bubble,
.bot-bubble {
  max-width: 70vw; 
  word-wrap: break-word;
}

.bubble-content {
  position: relative;
}

.user-icon {
  position: absolute;
  top: 50%;
  right: -40px;
  transform: translateY(-50%);
}

</style>
