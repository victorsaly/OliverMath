/**
 * Turn a spoken answer into a number, locally.
 *
 * The game asked the backend to do this ("fifty six" -> 56) via an LLM call on
 * every answer. That made a maths game depend on a network round trip, an API
 * key and a running Function App to decide whether a child said the right
 * number - and when any of those failed, the only fallback was
 * `String(word).match(/\d+/)`, which finds nothing in spoken words. A child
 * speaking the correct answer was told it was wrong, or asked to repeat
 * forever.
 *
 * Interpreting a spoken number is a solved problem that needs no model. This
 * covers every answer the game can produce - the largest is 2000, from expert
 * addition - in all five languages the app speaks.
 */

// Shared scale words. Kept apart from the units because they multiply rather
// than add.
const HUNDRED = 100;
const THOUSAND = 1000;

const LANGUAGES = {
  en: {
    ignore: ['and', 'a', 'the', 'is', 'it', 'answer'],
    words: {
      zero: 0, oh: 0, nought: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
      thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
      eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40,
      fourty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
      hundred: HUNDRED, thousand: THOUSAND
    }
  },

  es: {
    ignore: ['y', 'el', 'la', 'es', 'son'],
    words: {
      cero: 0, uno: 1, una: 1, un: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
      seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12,
      trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17,
      dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintiuna: 21,
      veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25,
      veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
      treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70,
      ochenta: 80, noventa: 90, cien: HUNDRED, ciento: HUNDRED,
      doscientos: 200, trescientos: 300, cuatrocientos: 400,
      quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800,
      novecientos: 900, mil: THOUSAND
    }
  },

  fr: {
    ignore: ['et', 'le', 'la', 'est', 'font'],
    // "quatre vingt" is 80, not 4 + 20, so it is collapsed before parsing.
    phrases: [[/quatre[\s-]vingts?/g, 'quatrevingt']],
    words: {
      zero: 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6,
      sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, treize: 13,
      quatorze: 14, quinze: 15, seize: 16, vingt: 20, vingts: 20,
      trente: 30, quarante: 40, cinquante: 50, soixante: 60,
      quatrevingt: 80, cent: HUNDRED, cents: HUNDRED, mille: THOUSAND
    }
  },

  de: {
    ignore: ['und', 'ist', 'das'],
    words: {
      null: 0, eins: 1, ein: 1, eine: 1, zwei: 2, drei: 3, vier: 4, funf: 5,
      sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, zwolf: 12,
      dreizehn: 13, vierzehn: 14, funfzehn: 15, sechzehn: 16, siebzehn: 17,
      achtzehn: 18, neunzehn: 19, zwanzig: 20, dreissig: 30, vierzig: 40,
      funfzig: 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90,
      hundert: HUNDRED, tausend: THOUSAND
    },
    // German writes numbers as one word - "sechsundfunfzig" is 56 - so the
    // compounds are broken apart before parsing.
    compound: true
  },

  pt: {
    ignore: ['e', 'o', 'a', 'sao'],
    words: {
      zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5,
      seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12,
      treze: 13, catorze: 14, quatorze: 14, quinze: 15, dezesseis: 16,
      dezasseis: 16, dezessete: 17, dezassete: 17, dezoito: 18,
      dezenove: 19, dezanove: 19, vinte: 20, trinta: 30, quarenta: 40,
      cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
      cem: HUNDRED, cento: HUNDRED, duzentos: 200, trezentos: 300,
      quatrocentos: 400, quinhentos: 500, seiscentos: 600, setecentos: 700,
      oitocentos: 800, novecentos: 900, mil: THOUSAND
    }
  }
};

/** Lowercase, strip accents and punctuation, normalise separators. */
function normalise(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split German compounds such as "zweihundertsechsundfunfzig". */
function splitCompound(token, words) {
  if (words[token] !== undefined) return [token];

  for (const scale of ['tausend', 'hundert', 'und']) {
    const at = token.indexOf(scale);
    if (at > 0 || (at === 0 && scale !== 'und')) {
      const before = token.slice(0, at);
      const after = token.slice(at + scale.length);
      return [
        ...(before ? splitCompound(before, words) : []),
        ...(scale === 'und' ? [] : [scale]),
        ...(after ? splitCompound(after, words) : [])
      ];
    }
  }
  return [token];
}

/**
 * @returns {number|null} the number the text represents, or null when it
 *   contains none.
 */
export function parseSpokenNumber(text, lang = 'en') {
  if (text === undefined || text === null) return null;

  const config = LANGUAGES[lang] || LANGUAGES.en;
  let cleaned = normalise(text);
  if (!cleaned) return null;

  (config.phrases || []).forEach(([pattern, replacement]) => {
    cleaned = cleaned.replace(pattern, replacement);
  });

  // Digits win outright: a recogniser that already produced "56" needs no
  // interpreting, and children sometimes answer with the numeral on screen.
  const digits = cleaned.match(/\d+/);
  if (digits) return parseInt(digits[0], 10);

  let tokens = cleaned.split(' ');
  if (config.compound) {
    tokens = tokens.flatMap((t) => splitCompound(t, config.words));
  }

  let total = 0;
  let current = 0;
  let seenAny = false;

  for (const token of tokens) {
    if (!token || config.ignore.includes(token)) continue;

    const value = config.words[token];
    if (value === undefined) continue;

    seenAny = true;

    if (value === THOUSAND) {
      total += (current || 1) * THOUSAND;
      current = 0;
    } else if (value === HUNDRED) {
      current = (current || 1) * HUNDRED;
    } else if (value > HUNDRED) {
      // Languages that have single words for 200-900.
      current += value;
    } else {
      current += value;
    }
  }

  if (!seenAny) return null;
  return total + current;
}

/**
 * Whether a spoken answer matches the expected number.
 *
 * @returns {{understood: boolean, number: number|null, correct: boolean}}
 */
export function checkSpokenAnswer(text, expected, lang = 'en') {
  const number = parseSpokenNumber(text, lang);
  return {
    understood: number !== null,
    number,
    correct: number !== null && number === expected
  };
}
