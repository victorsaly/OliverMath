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

    <ion-content class="ion-padding stats-content">
      <!-- Hero Star Display -->
      <div class="star-hero">
        <div class="star-circle">
          <span class="star-emoji">⭐</span>
          <span class="star-count">{{ starsDisplay }}</span>
        </div>
        <p class="star-subtitle">{{ t('totalStars') }}</p>
      </div>

      <!-- Quick Stats Row -->
      <div class="quick-stats-row">
        <div class="quick-stat">
          <span class="quick-value">{{ stats.total }}</span>
          <span class="quick-label">{{ t('totalProblems') }}</span>
        </div>
        <div class="quick-stat success">
          <span class="quick-value">{{ stats.correct }}</span>
          <span class="quick-label">{{ t('correctAnswers') }}</span>
        </div>
        <div class="quick-stat accent">
          <span class="quick-value">{{ stats.accuracy }}%</span>
          <span class="quick-label">{{ t('accuracy') }}</span>
        </div>
      </div>

      <!-- Performance by Operator -->
      <ion-card v-if="operatorStats.length > 0" class="performance-section">
        <ion-card-header>
          <ion-card-title>{{ t('performanceByOperator') }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="operator-grid">
            <div v-for="op in operatorStats" :key="op.operator" class="operator-item">
              <div class="operator-symbol">{{ op.operator }}</div>
              <div class="operator-bar-container">
                <div class="operator-bar" :style="{ width: op.accuracy + '%' }"></div>
              </div>
              <div class="operator-info">
                <span class="operator-accuracy">{{ op.accuracy }}%</span>
                <span class="operator-attempts">{{ op.total }} {{ op.total === 1 ? t('attempt') : t('attempts') }}</span>
              </div>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Answer Details / Recent Problems -->
      <ion-card v-if="recentHistory.length > 0" class="answer-details-section">
        <ion-card-header>
          <ion-card-title>{{ t('recentAnswers') }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="recent-problems-list">
            <div v-for="problem in recentHistory" :key="problem.id" class="recent-problem" :class="problem.isCorrect ? 'correct' : 'incorrect'">
              <div class="problem-left">
                <span class="problem-equation">{{ problem.num1 }} {{ problem.operator }} {{ problem.num2 }} = {{ problem.correctAnswer }}</span>
              </div>
              <div class="problem-right">
                <span class="result-icon">{{ problem.isCorrect ? '✓' : '✗' }}</span>
                <span v-if="!problem.isCorrect" class="wrong-answer">{{ problem.userAnswer }}</span>
              </div>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Achievements Section -->
      <Achievements :stats="achievementStats" />
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
  IonButtons,
  IonBackButton,
} from '@ionic/vue';
import { getHistory, getHistoryStats, getAllOperatorStats } from '@/services/historyService';
import { t, getPreferredLanguage } from '@/config/i18n';
import Achievements from '@/components/Achievements.vue';

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
    IonButtons,
    IonBackButton,
    Achievements,
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
      achievementStats: {
        correct: 0,
        bestStreak: 0,
        stars: 0,
        operatorStats: [],
      },
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

      // Load achievement stats
      this.achievementStats = {
        correct: stats.correct,
        bestStreak: parseInt(localStorage.getItem('bestStreak') || 0),
        stars: this.stars,
        operatorStats: this.operatorStats,
      };
    },
  },
  mounted() {
    this.loadStats();
  },
};
</script>

<style scoped>
.stats-content {
  --background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

/* Hero Star Display */
.star-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  margin-bottom: 16px;
}

.star-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffd700, #ffed4a);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.star-emoji {
  font-size: 28px;
  margin-bottom: 4px;
}

.star-count {
  font-size: 32px;
  font-weight: 800;
  color: #1a1a1a;
}

.star-subtitle {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* Quick Stats Row */
.quick-stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.quick-stat {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top: 3px solid var(--ion-color-primary);
}

.quick-stat.success {
  border-top-color: var(--ion-color-success);
}

.quick-stat.accent {
  border-top-color: #8b5cf6;
}

.quick-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.quick-label {
  display: block;
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

/* Performance Section */
.performance-section {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.operator-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.operator-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.operator-symbol {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(145deg, #e0e5ec, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.operator-bar-container {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.operator-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.operator-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 60px;
}

.operator-accuracy {
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
}

.operator-attempts {
  font-size: 10px;
  color: #888;
}

/* Answer Details Section */
.answer-details-section {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.recent-problems-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-problem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border-left: 3px solid #ccc;
}

.recent-problem.correct {
  border-left-color: var(--ion-color-success);
  background: #f0fdf4;
}

.recent-problem.incorrect {
  border-left-color: var(--ion-color-danger);
  background: #fef2f2;
}

.problem-left {
  flex: 1;
}

.problem-equation {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  font-family: 'SF Mono', 'Courier New', monospace;
}

.problem-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-icon {
  font-size: 16px;
  font-weight: 700;
}

.recent-problem.correct .result-icon {
  color: var(--ion-color-success);
}

.recent-problem.incorrect .result-icon {
  color: var(--ion-color-danger);
}

.wrong-answer {
  font-size: 12px;
  color: var(--ion-color-danger);
  text-decoration: line-through;
}

/* Achievements Container adjustments */
:deep(.achievements-container) {
  margin-top: 20px;
}

@media (max-width: 480px) {
  .star-circle {
    width: 100px;
    height: 100px;
  }

  .star-count {
    font-size: 28px;
  }

  .quick-value {
    font-size: 20px;
  }

  .quick-label {
    font-size: 9px;
  }
}
</style>
