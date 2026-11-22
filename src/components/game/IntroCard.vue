<template>
  <!-- The help card, opened from the "?" button. It used to appear by itself
       on a first visit; the game's first screen does that job now. -->
  <div class="intro-backdrop" role="dialog" aria-modal="true" aria-labelledby="intro-title">
    <div class="intro-card" ref="card">
      <p class="intro-brand" id="intro-title">
        <span class="wordmark-oliver">Oliver</span><span class="wordmark-math">Math</span>
      </p>
      <p class="intro-tagline">{{ t('tagline') }}</p>

      <ol class="intro-steps">
        <li><span class="intro-num">1</span>{{ t('step1') }}</li>
        <li><span class="intro-num">2</span>{{ t('step2') }}</li>
        <li><span class="intro-num">3</span>{{ t('step3') }}</li>
      </ol>

      <!-- Spoken explanation. The written steps above are no use to a child
           who cannot read yet, and tapping this is also the user gesture the
           browser needs before any audio can play. -->
      <button class="intro-hear" @click="$emit('hear')" :disabled="talking">
        <ion-icon :icon="volumeIcon" aria-hidden="true"></ion-icon>
        {{ t('hearIt') }}
      </button>

      <button class="intro-go" @click="$emit('close')">{{ t('gotIt') }}</button>
    </div>
  </div>
</template>

<script>
import { IonIcon } from '@ionic/vue';
import { volumeHigh } from 'ionicons/icons';
import { t } from '@/config/i18n';

export default {
  name: 'IntroCard',
  components: { IonIcon },
  props: {
    language: { type: String, required: true },
    talking: { type: Boolean, default: false }
  },
  emits: ['hear', 'close'],
  setup() {
    return { volumeIcon: volumeHigh };
  },
  // aria-modal only tells assistive tech that the rest of the page is inert; it
  // does not make it so. Focus is moved into the card, kept there, and put
  // back where it was when the card closes.
  mounted() {
    this.returnFocus = document.activeElement;
    const first = this.$refs.card?.querySelector('button');
    if (first) first.focus();
    document.addEventListener('keydown', this.onKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeydown);
    if (this.returnFocus && this.returnFocus.focus) this.returnFocus.focus();
  },
  methods: {
    t(key) {
      return t(this.language, key);
    },
    /** Escape closes the card; Tab cycles within it. */
    onKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.$emit('close');
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = this.$refs.card?.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (!focusable || !focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
};
</script>

<style scoped>
.wordmark-oliver {
  color: #ffffff;
}
.wordmark-math {
  color: #ffd700;
}
.intro-brand .wordmark-oliver,
.intro-brand .wordmark-math {
  font-size: inherit;
}

/* Intro card --------------------------------------------------------------- */

.intro-backdrop {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(6, 10, 20, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.intro-card {
  width: min(360px, 100%);
  padding: 26px 24px;
  border-radius: 26px;
  background: linear-gradient(160deg, #1d2a4d, #141d36);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  text-align: center;
  color: #ffffff;
}

.intro-brand {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.intro-tagline {
  margin: 6px 0 20px;
  font-size: 14px;
  line-height: 1.4;
  color: #cbd6e8;
}

.intro-steps {
  margin: 0 0 22px;
  padding: 0;
  list-style: none;
  text-align: left;
}

.intro-steps li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
}

.intro-num {
  flex: 0 0 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #2a74ea;
  font-size: 15px;
  font-weight: 800;
}

.intro-hear {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 16px;
  background: rgba(255, 215, 0, 0.12);
  color: #ffd700;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.intro-hear ion-icon {
  font-size: 20px;
}

.intro-hear[disabled] {
  opacity: 0.55;
  cursor: default;
}

.intro-hear:focus-visible {
  outline: 3px solid #ffd700;
  outline-offset: 3px;
}

.intro-go {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(145deg, #2a74ea, #1b57bc);
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
}

.intro-go:focus-visible {
  outline: 3px solid #ffd700;
  outline-offset: 3px;
}
</style>
