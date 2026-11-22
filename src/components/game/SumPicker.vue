<template>
  <!-- The child's choice of sum: four big tiles, a symbol and a word each. -->
  <transition name="sheet">
    <div class="pick-sheet" v-if="open" role="dialog" aria-labelledby="pick-title">
      <button class="sheet-close" @click="$emit('close')" :aria-label="t('closeMessage')">
        <ion-icon :icon="closeIcon" aria-hidden="true"></ion-icon>
      </button>
      <h2 id="pick-title">{{ t('chooseSums') }}</h2>
      <div class="pick-grid">
        <button
          v-for="choice in choices"
          :key="choice.value"
          class="pick-tile"
          :class="{ active: selected === choice.value }"
          :aria-pressed="selected === choice.value"
          @click="$emit('choose', choice.value)"
        >
          <b aria-hidden="true">{{ choice.symbol }}</b>
          <span>{{ choice.word }}</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { IonIcon } from '@ionic/vue';
import { close } from 'ionicons/icons';
import { t } from '@/config/i18n';

export default {
  name: 'SumPicker',
  components: { IonIcon },
  props: {
    open: { type: Boolean, default: false },
    language: { type: String, required: true },
    // [{ value, symbol, word }]
    choices: { type: Array, required: true },
    selected: { type: String, default: '' }
  },
  emits: ['choose', 'close'],
  setup() {
    return { closeIcon: close };
  },
  watch: {
    open(isOpen) {
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
    onKeydown(e) {
      if (e.key === 'Escape') this.$emit('close');
    }
  }
};
</script>
