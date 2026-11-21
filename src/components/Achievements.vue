<template>
  <div class="achievements-container">
    <!-- The next thing to earn, with a bar that fills. A new player used to
         meet a wall of grey padlocks. -->
    <section class="badge-block" v-if="nextBadge">
      <h3 class="block-title">{{ t('nextBadge') }}</h3>
      <div class="badge-row">
        <div class="badge-icon next" :class="nextBadge.icon"><ion-icon :icon="starIcon" aria-hidden="true"></ion-icon></div>
        <div class="badge-info">
          <h4 class="badge-name">{{ t(nextBadge.nameKey) }}</h4>
          <p class="badge-description">{{ t(nextBadge.descKey) }}</p>
        </div>
        <span class="progress-text">{{ nextBadge.progress }}/{{ nextBadge.target }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (nextBadge.progress / nextBadge.target) * 100 + '%' }"></div>
      </div>
    </section>

    <section class="badge-block" v-if="earned.length">
      <h3 class="block-title">{{ t('earnedBadges') }}</h3>
      <div class="badge-row" v-for="badge in earned" :key="badge.id">
        <div class="badge-icon" :class="badge.icon"><ion-icon :icon="starIcon" aria-hidden="true"></ion-icon></div>
        <div class="badge-info">
          <h4 class="badge-name">{{ t(badge.nameKey) }}</h4>
          <p class="badge-description">{{ t(badge.descKey) }}</p>
        </div>
      </div>
    </section>

    <!-- Everything else is one line until someone asks to see it. -->
    <section class="badge-block" v-if="later.length">
      <button class="more-toggle" @click="showAll = !showAll" :aria-expanded="showAll">
        <span>{{ t('moreToEarn').replace('{count}', later.length) }}</span>
        <span class="more-action">{{ showAll ? '−' : t('showAll') }}</span>
      </button>
      <template v-if="showAll">
        <div class="badge-row locked" v-for="badge in later" :key="badge.id">
          <div class="badge-icon next" :class="badge.icon"><ion-icon :icon="lockClosedIcon" aria-hidden="true"></ion-icon></div>
          <div class="badge-info">
            <h4 class="badge-name">{{ t(badge.nameKey) }}</h4>
            <p class="badge-description">{{ t(badge.descKey) }}</p>
          </div>
          <span class="progress-text">{{ badge.progress }}/{{ badge.target }}</span>
        </div>
      </template>
    </section>
  </div>
</template>

<script>
import { IonIcon } from '@ionic/vue';
import { lockClosed, star } from 'ionicons/icons';
import { t, getPreferredLanguage } from '@/config/i18n';

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
      starIcon: star,
      showAll: false,
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
  computed: {
    earned() {
      return this.badges.filter((badge) => badge.unlocked);
    },
    /** The locked badge the player is closest to. */
    nextBadge() {
      const locked = this.badges.filter((badge) => !badge.unlocked);
      if (!locked.length) return null;
      return locked.reduce((best, badge) =>
        badge.progress / badge.target > best.progress / best.target ? badge : best
      );
    },
    later() {
      return this.badges.filter((badge) => !badge.unlocked && badge !== this.nextBadge);
    },
  },
  methods: {
    t(key) {
      return t(getPreferredLanguage(), key);
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    },
    loadPersistedBadges() {
      // Load persisted badge unlock states from localStorage
      try {
        const saved = localStorage.getItem('achievementBadges');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.badges.forEach((badge) => {
            if (parsed[badge.id]) {
              badge.unlocked = parsed[badge.id].unlocked;
              badge.unlockedDate = parsed[badge.id].unlockedDate;
            }
          });
        }
      } catch (e) {
        console.warn('Failed to load badges:', e);
      }
    },
    saveBadges() {
      // Persist badge unlock states to localStorage
      try {
        const toSave = {};
        this.badges.forEach(badge => {
          if (badge.unlocked) {
            toSave[badge.id] = {
              unlocked: badge.unlocked,
              unlockedDate: badge.unlockedDate
            };
          }
        });
        localStorage.setItem('achievementBadges', JSON.stringify(toSave));
      } catch (e) {
        console.warn('Failed to save badges:', e);
      }
    },
    unlockBadge(index) {
      if (!this.badges[index].unlocked) {
        this.badges[index].unlocked = true;
        this.badges[index].unlockedDate = Date.now();
        this.saveBadges();
      }
    },
    updateBadgeProgress() {
      // First Correct
      this.badges[0].progress = this.stats.correct > 0 ? 1 : 0;
      if (this.stats.correct >= 1) {
        this.unlockBadge(0);
      }

      // 10 Correct
      this.badges[1].progress = Math.min(this.stats.correct, 10);
      if (this.stats.correct >= 10) {
        this.unlockBadge(1);
      }

      // 100 Correct
      this.badges[2].progress = Math.min(this.stats.correct, 100);
      if (this.stats.correct >= 100) {
        this.unlockBadge(2);
      }

      // 5 Streak
      this.badges[3].progress = Math.min(this.stats.bestStreak || 0, 5);
      if ((this.stats.bestStreak || 0) >= 5) {
        this.unlockBadge(3);
      }

      // 10 Streak
      this.badges[4].progress = Math.min(this.stats.bestStreak || 0, 10);
      if ((this.stats.bestStreak || 0) >= 10) {
        this.unlockBadge(4);
      }

      // Perfect Operator (100% on 10+ attempts in any operator)
      const perfectOperator = this.stats.operatorStats?.some(
        (op) => op.accuracy === 100 && op.total >= 10
      );
      if (perfectOperator) {
        this.badges[5].progress = 100;
        this.unlockBadge(5);
      }

      // 100 Stars
      this.badges[6].progress = Math.min(this.stats.stars || 0, 100);
      if ((this.stats.stars || 0) >= 100) {
        this.unlockBadge(6);
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
    this.loadPersistedBadges();
    this.updateBadgeProgress();
  },
};
</script>

<style scoped>
.achievements-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}
.badge-block {
  padding: 16px;
  border-radius: 18px;
  background: #1a2a57;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.block-title {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #b9c6ea;
}
.badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.badge-icon {
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ffffff;
}
.badge-icon.badge-star { background: #d9a400; }
.badge-icon.badge-ten { background: #d6408f; }
.badge-icon.badge-hundred { background: #7a5cd6; }
.badge-icon.badge-fire { background: #e0661f; }
.badge-icon.badge-blaze { background: #d83a3a; }
.badge-icon.badge-perfect { background: #1f9f9a; }
.badge-icon.badge-crown { background: #2f7bff; }
/* Not earned yet: the shape without the colour. */
.badge-icon.next {
  background: #26397a;
  color: #b9c6ea;
}
.badge-info {
  flex: 1;
  min-width: 0;
}
.badge-name {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #ffffff;
}
.badge-description {
  margin: 2px 0 0;
  font-size: 14px;
  line-height: 1.3;
  color: #b9c6ea;
}
.progress-text {
  flex: none;
  font-size: 15px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #ffc62e;
}
.badge-row.locked .progress-text {
  color: #b9c6ea;
}
.progress-bar {
  height: 12px;
  border-radius: 6px;
  background: #26397a;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  min-width: 6px;
  border-radius: 6px;
  background: #ffc62e;
  transition: width 0.4s ease;
}
.more-toggle {
  width: 100%;
  min-height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}
.more-action {
  color: #b9c6ea;
  font-size: 15px;
  font-weight: 700;
}
.more-toggle:focus-visible {
  outline: 3px solid #ffc62e;
  outline-offset: 4px;
  border-radius: 8px;
}
@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    transition: none;
  }
}
</style>
