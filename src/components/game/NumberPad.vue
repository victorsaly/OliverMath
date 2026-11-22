<template>
  <!-- Number pad. The game used to be unplayable without a microphone; this is
       the other way to answer, and it scores exactly like a spoken one. -->
  <transition name="sheet">
    <div class="pad-sheet" v-if="open" role="dialog" :aria-label="t('numberPad')">
      <button class="sheet-close" @click="$emit('close')" :aria-label="t('closeMessage')">
        <ion-icon :icon="closeIcon" aria-hidden="true"></ion-icon>
      </button>
      <p class="pad-sum" aria-live="polite">
        <span>{{ equation }} =</span>
        <b :class="{ empty: !value }">{{ value || '?' }}</b>
      </p>
      <div class="pad-keys">
        <button v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="n" class="pad-key" @click="press(n)">{{ n }}</button>
        <button class="pad-key del" @click="remove" :aria-label="t('padDelete')">
          <ion-icon :icon="backspaceIcon" aria-hidden="true"></ion-icon>
        </button>
        <button class="pad-key" @click="press(0)">0</button>
        <button class="pad-key ok" @click="submit" :disabled="!value" :aria-label="t('padOk')">
          <ion-icon :icon="checkIcon" aria-hidden="true"></ion-icon>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { IonIcon } from '@ionic/vue';
import { close, backspaceOutline, checkmark } from 'ionicons/icons';
import { t } from '@/config/i18n';

/**
 * Holds the digits being typed and hands the finished answer back. Digits,
 * Backspace, Enter and Escape on a keyboard work while it is open.
 */
export default {
  name: 'NumberPad',
  components: { IonIcon },
  props: {
    open: { type: Boolean, default: false },
    language: { type: String, required: true },
    // The sum as figures: "3 × 11".
    equation: { type: String, default: '' }
  },
  emits: ['submit', 'close', 'key'],
  setup() {
    return { closeIcon: close, backspaceIcon: backspaceOutline, checkIcon: checkmark };
  },
  data() {
    return { value: '' };
  },
  watch: {
    open(isOpen) {
      this.value = '';
      if (isOpen) window.addEventListener('keydown', this.onKeydown);
      else window.removeEventListener('keydown', this.onKeydown);
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
  },
  methods: {
    t(key) {
      return t(this.language, key);
    },
    press(digit) {
      // The largest answer the game can ask for is 2000.
      if (this.value.length >= 4) return;
      if (this.value === '0') this.value = '';
      this.value += String(digit);
      this.$emit('key');
    },
    remove() {
      this.value = this.value.slice(0, -1);
    },
    submit() {
      if (!this.value) return;
      this.$emit('submit', this.value);
    },
    onKeydown(e) {
      if (/^[0-9]$/.test(e.key)) this.press(Number(e.key));
      else if (e.key === 'Backspace') this.remove();
      else if (e.key === 'Enter') this.submit();
      else if (e.key === 'Escape') this.$emit('close');
    }
  }
};
</script>
