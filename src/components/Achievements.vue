<template>
  <div class="achievements-container">
    <h3 class="achievements-title">{{ t('achievements') }}</h3>
    <div class="badges-grid">
      <div v-for="badge in badges" :key="badge.id" class="badge-card" :class="{ unlocked: badge.unlocked }">
        <div class="badge-icon" :class="badge.icon">
          <ion-icon v-if="!badge.unlocked" :icon="lockClosedIcon" class="lock-icon"></ion-icon>
        </div>
        <div class="badge-info">
          <h4 class="badge-name">{{ t(badge.nameKey) }}</h4>
          <p class="badge-description">{{ t(badge.descKey) }}</p>
          <div v-if="badge.progress < badge.target" class="badge-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (badge.progress / badge.target) * 100 + '%' }"></div>
            </div>
            <span class="progress-text">{{ badge.progress }}/{{ badge.target }}</span>
          </div>
          <div v-else class="badge-unlocked-date">
            ✓ {{ t('unlockedOn') }} {{ formatDate(badge.unlockedDate) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { IonIcon } from '@ionic/vue';
import { lockClosed } from 'ionicons/icons';
import { t } from '@/config/i18n';

export default {
  name: 'Achievements',
  components: { IonIcon },
  props: {
    stats: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      lockClosedIcon: lockClosed,
      badges: [
        {
          id: 'first_correct',
          icon: 'badge-star',
          nameKey: 'firstCorrect',
          descKey: 'firstCorrectDesc',
          target: 1,
          progress: 0,
          unlocked: false,
          unlockedDate: null,
        },
        {
          id: 'ten_correct',
          icon: 'badge-ten',
          nameKey: 'tenCorrect',
          descKey: 'tenCorrectDesc',
          target: 10,
          progress: 0,
          unlocked: false,
          unlockedDate: null,
        },
        {
          id: 'hundred_correct',
          icon: 'badge-hundred',
          nameKey: 'hundredCorrect',
          descKey: 'hundredCorrectDesc',
          target: 100,
          progress: 0,
          unlocked: false,
          unlockedDate: null,
        },
        {
          id: 'five_streak',
          icon: 'badge-fire',
          nameKey: 'fiveStreak',
          descKey: 'fiveStreakDesc',
          target: 5,
          progress: 0,
          unlocked: false,
          unlockedDate: null,
        },
        {
          id: 'ten_streak',
          icon: 'badge-blaze',
          nameKey: 'tenStreak',
          descKey: 'tenStreakDesc',
          target: 10,
          progress: 0,
          unlocked: false,
          unlockedDate: null,
        },
        {
          id: 'perfect_operator',
          icon: 'badge-perfect',
          nameKey: 'perfectOperator',
          descKey: 'perfectOperatorDesc',
          target: 100,
          progress: 0,
          unlocked: false,
          unlockedDate: null,
        },
        {
          id: 'hundred_stars',
          icon: 'badge-crown',
          nameKey: 'hundredStars',
          descKey: 'hundredStarsDesc',
          target: 100,
          progress: 0,
          unlocked: false,
          unlockedDate: null,
        },
      ],
    };
  },
  methods: {
    t(key) {
      return t(this.$root.$data.selectedLanguage || 'en', key);
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    },
    updateBadgeProgress() {
      // First Correct
      this.badges[0].progress = this.stats.correct > 0 ? 1 : 0;
      if (this.stats.correct >= 1 && !this.badges[0].unlocked) {
        this.badges[0].unlocked = true;
        this.badges[0].unlockedDate = Date.now();
      }

      // 10 Correct
      this.badges[1].progress = Math.min(this.stats.correct, 10);
      if (this.stats.correct >= 10 && !this.badges[1].unlocked) {
        this.badges[1].unlocked = true;
        this.badges[1].unlockedDate = Date.now();
      }

      // 100 Correct
      this.badges[2].progress = Math.min(this.stats.correct, 100);
      if (this.stats.correct >= 100 && !this.badges[2].unlocked) {
        this.badges[2].unlocked = true;
        this.badges[2].unlockedDate = Date.now();
      }

      // 5 Streak
      this.badges[3].progress = Math.min(this.stats.bestStreak || 0, 5);
      if ((this.stats.bestStreak || 0) >= 5 && !this.badges[3].unlocked) {
        this.badges[3].unlocked = true;
        this.badges[3].unlockedDate = Date.now();
      }

      // 10 Streak
      this.badges[4].progress = Math.min(this.stats.bestStreak || 0, 10);
      if ((this.stats.bestStreak || 0) >= 10 && !this.badges[4].unlocked) {
        this.badges[4].unlocked = true;
        this.badges[4].unlockedDate = Date.now();
      }

      // Perfect Operator (100% on 10+ attempts in any operator)
      const perfectOperator = this.stats.operatorStats?.some(
        (op) => op.accuracy === 100 && op.total >= 10
      );
      if (perfectOperator) {
        this.badges[5].progress = 100;
        if (!this.badges[5].unlocked) {
          this.badges[5].unlocked = true;
          this.badges[5].unlockedDate = Date.now();
        }
      }

      // 100 Stars
      this.badges[6].progress = Math.min(this.stats.stars || 0, 100);
      if ((this.stats.stars || 0) >= 100 && !this.badges[6].unlocked) {
        this.badges[6].unlocked = true;
        this.badges[6].unlockedDate = Date.now();
      }
    },
  },
  watch: {
    stats: {
      handler() {
        this.updateBadgeProgress();
      },
      deep: true,
    },
  },
  mounted() {
    this.updateBadgeProgress();
  },
};
</script>

<style scoped>
.achievements-container {
  margin: 20px 0;
  padding: 16px;
  background: #16213e;
  border-radius: 12px;
}

.achievements-title {
  font-size: 18px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 16px;
  text-align: center;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.badge-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #0f3460;
  border-radius: 10px;
  border: 2px solid #2d3748;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  opacity: 0.6;
  position: relative;
}

.badge-card.unlocked {
  opacity: 1;
  border-color: #fbbf24;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.3);
}

.badge-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 8px;
  position: relative;
}

.badge-icon.badge-star {
  background: linear-gradient(135deg, #fbbf24, #fcd34d);
}

.badge-icon.badge-ten {
  background: linear-gradient(135deg, #ec4899, #f472b6);
}

.badge-icon.badge-hundred {
  background: linear-gradient(135deg, #8b5cf6, #c4b5fd);
}

.badge-icon.badge-fire {
  background: linear-gradient(135deg, #f97316, #fb923c);
}

.badge-icon.badge-blaze {
  background: linear-gradient(135deg, #dc2626, #fca5a5);
}

.badge-icon.badge-perfect {
  background: linear-gradient(135deg, #06b6d4, #67e8f9);
}

.badge-icon.badge-crown {
  background: linear-gradient(135deg, #6366f1, #a5b4fc);
}

.lock-icon {
  color: rgba(255, 255, 255, 0.4);
  position: absolute;
}

.badge-info {
  text-align: center;
  width: 100%;
}

.badge-name {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 4px 0;
}

.badge-description {
  font-size: 10px;
  color: #a0aec0;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.badge-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #2d3748;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 9px;
  color: #a0aec0;
  font-weight: 500;
}

.badge-unlocked-date {
  font-size: 9px;
  color: #48bb78;
  font-weight: 600;
}

@media (max-width: 480px) {
  .badges-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .badge-card {
    padding: 10px;
  }

  .badge-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .badge-name {
    font-size: 11px;
  }

  .badge-description {
    font-size: 9px;
  }
}
</style>
