<template style={overflow: auto}>
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
            <div class="bubble-content">
              <pre class="preWrap">{{ message.content }}</pre>
              <img src="../assets/shamanlogo.png" alt="Bot Icon" class="bot-icon" />
            </div>
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
  padding-left: 60px;
  padding-right: 60px;
}

.preWrap {
  white-space: pre-wrap;
}

.user-bubble {
  background-color: #388e3c;
}

.bot-bubble {
  background-color: #5E6868;
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
  top: 0%;
  right: -40px;
  transform: translateY(-10%);
}

.bot-icon {
  width: 35px;
  top: 0%;
  transform: translateY(-10%);
  position: absolute;
  left: -47px;
}

</style>
