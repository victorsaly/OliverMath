<template>
  <!-- The day's free sums are used up. Written for the child: it is good
       news, come back tomorrow. The way to unlock is a second, quieter
       button, and it leads to the grown-ups gate, not to a price. -->
  <transition name="sheet">
    <div class="nomic-sheet" v-if="limitOpen" role="dialog" aria-labelledby="limit-title">
      <button class="sheet-close" @click="$emit('close-limit')" :aria-label="t('closeMessage')">
        <ion-icon :icon="closeIcon" aria-hidden="true"></ion-icon>
      </button>
      <h2 id="limit-title">{{ t('limitTitle') }}</h2>
      <p>{{ t('limitBody', { count }) }}</p>
      <button class="sheet-btn" @click="$emit('grown-ups')">
        <ion-icon :icon="lockIcon" aria-hidden="true"></ion-icon>{{ t('limitGrownUps') }}
      </button>
    </div>
  </transition>

  <!-- The full game, shown only after the gate. In the apps: the price from
       the store, one button to buy, one to restore. On the web: where the app
       is. -->
  <transition name="sheet">
    <div class="nomic-sheet" v-if="unlockOpen" role="dialog" aria-labelledby="unlock-title">
      <button class="sheet-close" @click="$emit('close-unlock')" :aria-label="t('closeMessage')">
        <ion-icon :icon="closeIcon" aria-hidden="true"></ion-icon>
      </button>
      <h2 id="unlock-title">{{ t('fullGame') }}</h2>

      <template v-if="canPurchase">
        <p>{{ t('fullGamePitch') }}</p>
        <button class="sheet-btn primary" @click="$emit('buy')" :disabled="busy || !price">
          <ion-spinner name="crescent" v-if="busy"></ion-spinner>
          <template v-else>{{ t('fullGameBuy') }}<span class="sheet-price" v-if="price">{{ price }}</span></template>
        </button>
        <button class="sheet-btn" @click="$emit('restore')" :disabled="busy">{{ t('fullGameRestore') }}</button>
      </template>

      <template v-else>
        <p>{{ t('fullGameInApp') }}</p>
        <a class="sheet-btn primary" v-if="storeLink" :href="storeLink" rel="noopener">{{ t('getTheApp') }}</a>
      </template>

      <p class="sheet-note" v-if="message" role="status">{{ message }}</p>
    </div>
  </transition>
</template>

<script>
import { IonIcon, IonSpinner } from '@ionic/vue';
import { close, lockClosed } from 'ionicons/icons';
import { t } from '@/config/i18n';

/**
 * The two cards of the free version: "that's all for today", and the full
 * game. Which one shows, and what buying does, is the game screen's business.
 */
export default {
  name: 'TrialCards',
  components: { IonIcon, IonSpinner },
  props: {
    language: { type: String, required: true },
    limitOpen: { type: Boolean, default: false },
    unlockOpen: { type: Boolean, default: false },
    // Free sums a day.
    count: { type: Number, required: true },
    // True inside the store apps.
    canPurchase: { type: Boolean, default: false },
    // As the store formats it; empty until the store has answered.
    price: { type: String, default: '' },
    busy: { type: Boolean, default: false },
    message: { type: String, default: '' },
    // On the web: where the app is.
    storeLink: { type: String, default: '' }
  },
  emits: ['grown-ups', 'close-limit', 'buy', 'restore', 'close-unlock'],
  setup() {
    return { closeIcon: close, lockIcon: lockClosed };
  },
  methods: {
    t(key, params) {
      return t(this.language, key, params);
    }
  }
};
</script>
