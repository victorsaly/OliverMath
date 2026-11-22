<template>
  <!-- The sums asked so far, and how each one went. -->
  <ion-modal :is-open="open" @didDismiss="$emit('close')" role="dialog" aria-labelledby="history-modal-title">
    <ion-header>
      <ion-toolbar class="navy-bar">
        <ion-title id="history-modal-title">{{ t('history') }}</ion-title>
        <ion-button slot="end" fill="clear" @click="$emit('close')" aria-label="Close history">
          <ion-icon :icon="alertIcon" slot="icon-only" style="color: white;" aria-hidden="true"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="history.length === 0" class="no-history">
        <p>{{ t('noHistory') }}</p>
      </div>
      <ion-list v-else>
        <ion-item v-for="problem in history" :key="problem.id" :class="problem.isCorrect ? 'correct-item' : 'incorrect-item'">
          <ion-label>
            <h2 class="problem-equation">
              {{ problem.num1 }} {{ getOperatorSymbol(problem.operator) }} {{ problem.num2 }} = {{ problem.correctAnswer }}
            </h2>
            <p v-if="!problem.isCorrect" class="user-answer">
              {{ t('yourAnswer') }}: {{ problem.userAnswer || '?' }}
            </p>
            <p class="problem-time">{{ formatTimestamp(problem.timestamp) }}</p>
          </ion-label>
          <ion-icon 
            slot="end" 
            :icon="problem.isCorrect ? starIcon : alertIcon" 
            :color="problem.isCorrect ? 'success' : 'danger'"
          ></ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script>
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButton, IonContent, IonIcon, IonList, IonItem, IonLabel } from '@ionic/vue';
import { star, alertCircle } from 'ionicons/icons';
import { t } from '@/config/i18n';
import { formatTimestamp, getOperatorSymbol } from '@/services/historyService';

export default {
  name: 'HistorySheet',
  components: { IonModal, IonHeader, IonToolbar, IonTitle, IonButton, IonContent, IonIcon, IonList, IonItem, IonLabel },
  props: {
    open: { type: Boolean, default: false },
    language: { type: String, required: true },
    history: { type: Array, default: () => [] }
  },
  emits: ['close'],
  setup() {
    return { starIcon: star, alertIcon: alertCircle };
  },
  methods: {
    t(key) {
      return t(this.language, key);
    },
    formatTimestamp,
    getOperatorSymbol
  }
};
</script>

<style scoped>
ion-toolbar.navy-bar {
  --background: #101b3d;
  --color: #ffffff;
  --border-color: rgba(255, 255, 255, 0.12);
}
/* Problem History Modal */
.no-history {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
}

.correct-item {
  --border-left: 4px solid var(--ion-color-success);
}

.incorrect-item {
  --border-left: 4px solid var(--ion-color-danger);
}

.problem-equation {
  font-size: 18px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.user-answer {
  color: var(--ion-color-danger);
  font-size: 13px;
}

.problem-time {
  font-size: 11px;
  color: var(--ion-color-medium);
}
</style>
