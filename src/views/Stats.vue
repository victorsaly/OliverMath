<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ t('stats') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Overview Stats Card -->
      <ion-card class="stats-overview-card">
        <ion-card-header>
          <ion-card-title>{{ t('overview') }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-grid>
            <ion-row class="stat-row">
              <ion-col size="6">
                <div class="stat-item">
                  <div class="stat-value">{{ starsDisplay }}</div>
                  <div class="stat-label">{{ t('totalStars') }}</div>
                </div>
              </ion-col>
              <ion-col size="6">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.total }}</div>
                  <div class="stat-label">{{ t('totalProblems') }}</div>
                </div>
              </ion-col>
            </ion-row>
            <ion-row class="stat-row">
              <ion-col size="6">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.correct }}</div>
                  <div class="stat-label">{{ t('correctAnswers') }}</div>
                </div>
              </ion-col>
              <ion-col size="6">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.accuracy }}%</div>
                  <div class="stat-label">{{ t('averageAccuracy') }}</div>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <!-- Performance by Operator -->
      <ion-card v-if="operatorStats.length > 0" class="performance-section">
        <ion-card-header>
          <ion-card-title>{{ t('performanceByOperator') }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-grid>
            <ion-card v-for="op in operatorStats" :key="op.operator" class="operator-card">
              <ion-card-content>
                <div class="operator-row">
                  <div class="operator-label">{{ getOperatorLabel(op.operator) }}</div>
                  <div class="operator-stats">
                    <span class="attempts">{{ op.total }} {{ t('attempt') }}{{ op.total !== 1 ? 's' : '' }}</span>
                    <span class="accuracy">{{ op.accuracy }}%</span>
                  </div>
                </div>
                <div class="accuracy-bar">
                  <div class="accuracy-fill" :style="{ width: op.accuracy + '%' }"></div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <!-- Answer Details / Recent Problems -->
      <ion-card v-if="recentHistory.length > 0" class="answer-details-section">
        <ion-card-header>
          <ion-card-title>{{ t('recentAnswers') }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-card v-for="problem in recentHistory" :key="problem.id" class="history-item" :class="problem.isCorrect ? 'correct' : 'incorrect'">
            <ion-card-content>
              <div class="history-row">
                <div class="problem-display">
                  <div class="problem-equation">{{ problem.num1 }} {{ problem.operator }} {{ problem.num2 }}</div>
                  <div class="answer-row">
                    <span class="correct-answer">{{ t('answer') }}: {{ problem.correctAnswer }}</span>
                    <span class="result-badge" :class="problem.isCorrect ? 'success' : 'danger'">
                      {{ problem.isCorrect ? t('correct') : t('incorrect') }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="!problem.isCorrect" class="user-answer-display">
                <small>{{ t('yourAnswer') }}: <strong>{{ problem.userAnswer || '(No response)' }}</strong></small>
              </div>
            </ion-card-content>
          </ion-card>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';
import { getHistory, getHistoryStats, getAllOperatorStats } from '@/services/historyService';
import { t, getPreferredLanguage } from '@/config/i18n';

export default {
  name: 'Stats',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButtons,
    IonBackButton,
  },
  data() {
    return {
      selectedLanguage: getPreferredLanguage(),
      stars: 0,
      starsDisplay: '0',
      stats: {
        total: 0,
        correct: 0,
        accuracy: 0,
      },
      operatorStats: [],
      recentHistory: [],
    };
  },
  methods: {
    t(key) {
      return t(this.selectedLanguage, key);
    },
    getOperatorLabel(operator) {
      const labels = {
        '+': this.t('plus'),
        '−': this.t('minus'),
        '×': this.t('times'),
        '÷': this.t('dividedBy'),
      };
      return labels[operator] || operator;
    },
    loadStats() {
      // Load overview stats
      const stats = getHistoryStats();
      this.stats = {
        total: stats.total,
        correct: stats.correct,
        accuracy: stats.accuracy,
      };

      // Load operator stats
      this.operatorStats = getAllOperatorStats().sort((a, b) => b.total - a.total);

      // Load recent history (last 10 problems)
      const allHistory = getHistory();
      this.recentHistory = allHistory.slice(0, 10);

      // Load localStorage values
      this.stars = parseInt(localStorage.getItem('stars') || 0);
      this.starsDisplay = Math.min(this.stars, 100) >= 100 ? '100 ⭐' : Math.min(this.stars, 100).toString();
    },
  },
  mounted() {
    this.loadStats();
  },
};
</script>

<style scoped>
.stats-overview-card {
  margin-bottom: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-row {
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: linear-gradient(145deg, #f0f4f8, #ffffff);
  border-radius: 12px;
  border-left: 4px solid var(--ion-color-primary);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--ion-color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--ion-color-medium);
  margin-top: 8px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.performance-section {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.operator-card {
  margin-bottom: 12px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.operator-card ion-card-content {
  padding: 12px;
}

.operator-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.operator-label {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  min-width: 40px;
}

.operator-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.attempts {
  font-size: 12px;
  color: var(--ion-color-medium);
  background: var(--ion-color-step-100);
  padding: 4px 8px;
  border-radius: 6px;
}

.accuracy {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-primary);
  min-width: 40px;
  text-align: right;
}

.accuracy-bar {
  width: 100%;
  height: 6px;
  background: var(--ion-color-step-200);
  border-radius: 3px;
  overflow: hidden;
}

.accuracy-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--ion-color-medium);
}

.answer-details-section {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.history-item {
  margin-bottom: 10px;
  border-radius: 10px;
  border-left: 4px solid var(--ion-color-medium);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.history-item.correct {
  border-left-color: var(--ion-color-success);
  background: linear-gradient(145deg, #f1f8e9, #ffffff);
}

.history-item.incorrect {
  border-left-color: var(--ion-color-danger);
  background: linear-gradient(145deg, #ffebee, #ffffff);
}

.history-item ion-card-content {
  padding: 10px;
}

.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.problem-display {
  flex: 1;
}

.problem-equation {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6px;
  font-family: 'Courier New', monospace;
}

.answer-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.correct-answer {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.result-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.result-badge.success {
  background: var(--ion-color-success);
  color: white;
}

.result-badge.danger {
  background: var(--ion-color-danger);
  color: white;
}

.user-answer-display {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 12px;
  color: var(--ion-color-danger);
}

@media (max-width: 480px) {
  .stat-item {
    padding: 12px 8px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
