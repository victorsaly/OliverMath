import { describe, it, expect } from 'vitest';
import { parseSpokenNumber, checkSpokenAnswer } from '@/utils/numberWords';

describe('parseSpokenNumber - English', () => {
  it('reads plain words', () => {
    expect(parseSpokenNumber('zero')).toBe(0);
    expect(parseSpokenNumber('seven')).toBe(7);
    expect(parseSpokenNumber('twelve')).toBe(12);
    expect(parseSpokenNumber('nineteen')).toBe(19);
  });

  it('reads compound tens', () => {
    expect(parseSpokenNumber('fifty six')).toBe(56);
    expect(parseSpokenNumber('fifty-six')).toBe(56);
    expect(parseSpokenNumber('twenty one')).toBe(21);
    expect(parseSpokenNumber('ninety nine')).toBe(99);
  });

  it('reads hundreds and thousands', () => {
    expect(parseSpokenNumber('one hundred')).toBe(100);
    expect(parseSpokenNumber('one hundred and forty four')).toBe(144);
    expect(parseSpokenNumber('two hundred fifty six')).toBe(256);
    expect(parseSpokenNumber('one thousand')).toBe(1000);
    expect(parseSpokenNumber('two thousand')).toBe(2000);
    expect(parseSpokenNumber('one thousand five hundred')).toBe(1500);
  });

  it('accepts digits the recogniser already resolved', () => {
    expect(parseSpokenNumber('56')).toBe(56);
    expect(parseSpokenNumber('the answer is 144')).toBe(144);
  });

  it('tolerates the filler a child actually says', () => {
    expect(parseSpokenNumber('it is fifty six')).toBe(56);
    expect(parseSpokenNumber('  Fifty   Six!  ')).toBe(56);
    expect(parseSpokenNumber('fourty two')).toBe(42); // common misspelling
  });

  it('returns null when there is no number', () => {
    expect(parseSpokenNumber('')).toBeNull();
    expect(parseSpokenNumber('   ')).toBeNull();
    expect(parseSpokenNumber('I do not know')).toBeNull();
    expect(parseSpokenNumber(undefined)).toBeNull();
    expect(parseSpokenNumber(null)).toBeNull();
  });
});

describe('parseSpokenNumber - Spanish', () => {
  it('reads words and compounds', () => {
    expect(parseSpokenNumber('cinco', 'es')).toBe(5);
    expect(parseSpokenNumber('quince', 'es')).toBe(15);
    expect(parseSpokenNumber('veintiseis', 'es')).toBe(26);
    expect(parseSpokenNumber('veintiséis', 'es')).toBe(26); // accented
    expect(parseSpokenNumber('cincuenta y seis', 'es')).toBe(56);
    expect(parseSpokenNumber('ciento cuarenta y cuatro', 'es')).toBe(144);
    expect(parseSpokenNumber('doscientos', 'es')).toBe(200);
    expect(parseSpokenNumber('mil', 'es')).toBe(1000);
  });
});

describe('parseSpokenNumber - French', () => {
  it('reads words and compounds', () => {
    expect(parseSpokenNumber('cinq', 'fr')).toBe(5);
    expect(parseSpokenNumber('seize', 'fr')).toBe(16);
    expect(parseSpokenNumber('cinquante six', 'fr')).toBe(56);
    expect(parseSpokenNumber('soixante dix', 'fr')).toBe(70);
    expect(parseSpokenNumber('soixante quinze', 'fr')).toBe(75);
  });

  it('handles the quatre-vingt family, which is not 4 + 20', () => {
    expect(parseSpokenNumber('quatre-vingts', 'fr')).toBe(80);
    expect(parseSpokenNumber('quatre-vingt-dix', 'fr')).toBe(90);
    expect(parseSpokenNumber('quatre-vingt-dix-sept', 'fr')).toBe(97);
  });

  it('reads hundreds', () => {
    expect(parseSpokenNumber('cent quarante quatre', 'fr')).toBe(144);
    expect(parseSpokenNumber('deux cents', 'fr')).toBe(200);
  });
});

describe('parseSpokenNumber - German', () => {
  it('reads single words', () => {
    expect(parseSpokenNumber('null', 'de')).toBe(0);
    expect(parseSpokenNumber('sieben', 'de')).toBe(7);
    expect(parseSpokenNumber('zwanzig', 'de')).toBe(20);
  });

  it('splits the one-word compounds German actually writes', () => {
    expect(parseSpokenNumber('sechsundfunfzig', 'de')).toBe(56);
    expect(parseSpokenNumber('sechsundfünfzig', 'de')).toBe(56); // umlaut
    expect(parseSpokenNumber('einundzwanzig', 'de')).toBe(21);
    expect(parseSpokenNumber('zweihundert', 'de')).toBe(200);
    expect(parseSpokenNumber('zweihundertsechsundfunfzig', 'de')).toBe(256);
  });

  it('reads spaced forms too', () => {
    expect(parseSpokenNumber('sechs und funfzig', 'de')).toBe(56);
  });
});

describe('parseSpokenNumber - Portuguese', () => {
  it('reads words and compounds', () => {
    expect(parseSpokenNumber('cinco', 'pt')).toBe(5);
    expect(parseSpokenNumber('dezesseis', 'pt')).toBe(16);
    expect(parseSpokenNumber('cinquenta e seis', 'pt')).toBe(56);
    expect(parseSpokenNumber('cento e quarenta e quatro', 'pt')).toBe(144);
    expect(parseSpokenNumber('duzentos', 'pt')).toBe(200);
  });
});

describe('checkSpokenAnswer', () => {
  it('reports correct, wrong and not-understood separately', () => {
    expect(checkSpokenAnswer('fifty six', 56)).toEqual({
      understood: true, number: 56, correct: true
    });
    expect(checkSpokenAnswer('forty two', 56)).toEqual({
      understood: true, number: 42, correct: false
    });
    // Silence must be distinguishable from a wrong answer: scoring it as wrong
    // is what punished a child for a noisy room.
    expect(checkSpokenAnswer('', 56)).toEqual({
      understood: false, number: null, correct: false
    });
    expect(checkSpokenAnswer('erm', 56)).toEqual({
      understood: false, number: null, correct: false
    });
  });

  it('covers every answer the game can generate', () => {
    // Largest is expert addition: 1000 + 1000.
    expect(checkSpokenAnswer('two thousand', 2000).correct).toBe(true);
    // Largest multiplication: 20 x 20.
    expect(checkSpokenAnswer('four hundred', 400).correct).toBe(true);
  });
});
