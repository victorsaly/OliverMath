<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Assistant</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item v-for="(m, idx) in messages" :key="idx" lines="none">
          <ion-label>
            <h3>{{ m.role === 'user' ? 'You' : 'Assistant' }}</h3>
            <p>{{ m.content }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-item>
        <ion-textarea
          v-model="input"
          auto-grow
          :disabled="loading"
          placeholder="Ask a math question or request an explanation..."
        />
      </ion-item>

      <ion-button expand="block" :disabled="loading || !input.trim()" @click="send">
        {{ loading ? 'Thinking…' : 'Send' }}
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script>
import { reactive, ref } from 'vue';
import api from '../services/api';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonTextarea, IonButton } from '@ionic/vue';

export default {
  name: 'Assistant',
  components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonTextarea, IonButton },
  setup() {
    const messages = reactive([]);
    const input = ref('');
    const loading = ref(false);

    const send = async () => {
      const text = input.value.trim();
      if (!text) return;
      messages.push({ role: 'user', content: text });
      input.value = '';
      loading.value = true;
      try {
        const { data } = await api.post('/api/chat', { messages: messages.map(m => ({ role: m.role, content: m.content })) });
        messages.push({ role: 'assistant', content: data.reply || data.choices?.[0]?.message?.content || '(No reply)' });
      } catch (err) {
        messages.push({ role: 'assistant', content: 'Sorry, there was an error. Please try again.' });
         
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    return { messages, input, loading, send };
  }
};
</script>

<style scoped>
ion-item h3 {
  margin: 0 0 4px;
}
ion-item p {
  white-space: pre-wrap;
}
</style>
