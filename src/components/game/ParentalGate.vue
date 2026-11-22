<template>
  <!-- Parental gate. Three numbers written as words: easy for an adult, not
       something a child who is still learning to read taps through. -->
  <transition name="sheet">
    <div class="gate-sheet" v-if="open" role="dialog" aria-labelledby="gate-title">
      <button class="sheet-close" @click="$emit('close')" :aria-label="t('closeMessage')">
        <ion-icon :icon="closeIcon" aria-hidden="true"></ion-icon>
      </button>
      <h2 id="gate-title">{{ t('grownUpsOnly') }}</h2>
      <p>{{ missed ? t('gateWrong') : t('gatePrompt') }}</p>
      <p class="gate-words" aria-live="polite">{{ words }}</p>
      <p class="gate-dots" aria-hidden="true">
        <i v-for="n in 3" :key="n" :class="{ on: entry.length >= n }"></i>
      </p>
      <div class="pad-keys">
        <button v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="n" class="pad-key" @click="press(n)">{{ n }}</button>
        <span></span>
        <button class="pad-key" @click="press(0)">0</button>
        <span></span>
      </div>
    </div>
  </transition>
</template>

<script>
import { IonIcon } from '@ionic/vue';
import { close } from 'ionicons/icons';
import { t } from '@/config/i18n';
import { getRandomInt } from '@/utils/helpers';

/**
 * The gate in front of Grown-ups and anything that leaves the app. It picks
 * its own numbers and says only whether they were entered: 'pass', or 'miss'
 * followed by a new set, so the way in cannot be found by trying.
 */
export default {
  name: 'ParentalGate',
  components: { IonIcon },
  props: {
    open: { type: Boolean, default: false },
    language: { type: String, required: true }
  },
  emits: ['pass', 'miss', 'close'],
  setup() {
    return { closeIcon: close };
  },
  data() {
    return { code: '', entry: '', missed: false };
  },
  computed: {
    /** The numbers as words in the chosen language: "seven, two, nine". */
    words() {
      const names = this.t('digitWords').split(',');
      return this.code.split('').map((d) => names[Number(d)]).join(', ');
    }
  },
  watch: {
    open(isOpen) {
      if (isOpen) {
        this.missed = false;
        this.newCode();
        window.addEventListener('keydown', this.onKeydown);
      } else {
        this.entry = '';
        window.removeEventListener('keydown', this.onKeydown);
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
  },
  methods: {
    t(key) {
      return t(this.language, key);
    },
    /** Three different digits, so the words never repeat. */
    newCode() {
      const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      let code = '';
      for (let i = 0; i < 3; i++) {
        code += digits.splice(getRandomInt(0, digits.length - 1), 1)[0];
      }
      this.code = code;
      this.entry = '';
    },
    press(digit) {
      if (this.entry.length >= 3) return;
      this.entry += String(digit);
      if (this.entry.length < 3) return;
      if (this.entry === this.code) {
        this.$emit('pass');
        return;
      }
      this.missed = true;
      this.$emit('miss');
      setTimeout(() => this.newCode(), 350);
    },
    onKeydown(e) {
      if (/^[0-9]$/.test(e.key)) this.press(Number(e.key));
      else if (e.key === 'Escape') this.$emit('close');
    }
  }
};
</script>
