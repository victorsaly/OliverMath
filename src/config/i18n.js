/**
 * Internationalization (i18n) configuration
 * Supports multiple languages for the math game
 */

export const LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  pt: { name: 'Português', flag: '🇧🇷' },
};

export const translations = {
  en: {
    // Game UI
    title: 'OliverMath',
    play: 'Play',
    stop: 'Stop',
    listening: 'Listening...',
    thinking: 'Thinking...',
    speaking: 'Speaking...',
    ready: 'Ready to play!',
    
    // Settings
    settings: 'Settings',
    difficulty: 'Difficulty',
    level: 'Level',
    language: 'Language',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    
    // Operators
    operators: 'Operators',
    addition: 'Addition',
    subtraction: 'Subtraction',
    multiplication: 'Multiplication',
    division: 'Division',
    
    // Stats
    score: 'Score',
    streak: 'Streak',
    best: 'Best',
    accuracy: 'Accuracy',
    highScore: 'High Score',
    bestStreak: 'Best Streak',
    
    // Problem History
    history: 'History',
    problemHistory: 'Problem History',
    noHistory: 'No problems yet. Start playing!',
    clearHistory: 'Clear History',
    correct: 'Correct',
    incorrect: 'Incorrect',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    
    // Phrases - Correct
    correctPhrases: [
      "That's right!",
      "Excellent!",
      "You got it!",
      "Great job!",
      "Perfect!",
      "Amazing!",
      "Wonderful!",
      "Fantastic!",
      "Super!",
      "Brilliant!",
      "You're a math star!",
      "Outstanding!",
    ],
    
    // Phrases - Incorrect
    incorrectPhrases: [
      "Not quite, the answer is {answer}",
      "Close! It's {answer}",
      "Good try! The answer is {answer}",
      "Almost! It was {answer}",
      "Nice effort! It's {answer}",
    ],
    
    // Phrases - Streak
    streakPhrases: [
      "You're on fire! {count} in a row!",
      "Incredible streak of {count}!",
      "Unstoppable! {count} correct!",
      "{count} in a row! Keep going!",
    ],
    
    // Phrases - Hints
    hintPhrases: [
      "Take your time!",
      "You can do it!",
      "Think carefully!",
      "Almost there!",
    ],
    
    // Math question format
    whatIs: "What is",
    plus: "plus",
    minus: "minus",
    times: "times",
    dividedBy: "divided by",
  },
  
  es: {
    // Game UI
    title: 'OliverMath',
    play: 'Jugar',
    stop: 'Parar',
    listening: 'Escuchando...',
    thinking: 'Pensando...',
    speaking: 'Hablando...',
    ready: '¡Listo para jugar!',
    
    // Settings
    settings: 'Ajustes',
    difficulty: 'Dificultad',
    level: 'Nivel',
    language: 'Idioma',
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
    
    // Operators
    operators: 'Operadores',
    addition: 'Suma',
    subtraction: 'Resta',
    multiplication: 'Multiplicación',
    division: 'División',
    
    // Stats
    score: 'Puntos',
    streak: 'Racha',
    best: 'Mejor',
    accuracy: 'Precisión',
    highScore: 'Récord',
    bestStreak: 'Mejor Racha',
    
    // Problem History
    history: 'Historial',
    problemHistory: 'Historial de Problemas',
    noHistory: '¡Aún no hay problemas. Empieza a jugar!',
    clearHistory: 'Borrar Historial',
    correct: 'Correcto',
    incorrect: 'Incorrecto',
    yourAnswer: 'Tu respuesta',
    correctAnswer: 'Respuesta correcta',
    
    // Phrases - Correct
    correctPhrases: [
      "¡Correcto!",
      "¡Excelente!",
      "¡Lo lograste!",
      "¡Muy bien!",
      "¡Perfecto!",
      "¡Increíble!",
      "¡Maravilloso!",
      "¡Fantástico!",
      "¡Súper!",
      "¡Brillante!",
      "¡Eres una estrella de las matemáticas!",
      "¡Extraordinario!",
    ],
    
    // Phrases - Incorrect
    incorrectPhrases: [
      "Casi, la respuesta es {answer}",
      "¡Cerca! Es {answer}",
      "¡Buen intento! La respuesta es {answer}",
      "¡Casi! Era {answer}",
      "¡Buen esfuerzo! Es {answer}",
    ],
    
    // Phrases - Streak
    streakPhrases: [
      "¡Estás en racha! ¡{count} seguidas!",
      "¡Racha increíble de {count}!",
      "¡Imparable! ¡{count} correctas!",
      "¡{count} seguidas! ¡Sigue así!",
    ],
    
    // Phrases - Hints
    hintPhrases: [
      "¡Tómate tu tiempo!",
      "¡Tú puedes!",
      "¡Piensa bien!",
      "¡Ya casi!",
    ],
    
    // Math question format
    whatIs: "¿Cuánto es",
    plus: "más",
    minus: "menos",
    times: "por",
    dividedBy: "dividido entre",
  },
  
  fr: {
    // Game UI
    title: 'OliverMath',
    play: 'Jouer',
    stop: 'Arrêter',
    listening: 'Écoute...',
    thinking: 'Réflexion...',
    speaking: 'Parle...',
    ready: 'Prêt à jouer!',
    
    // Settings
    settings: 'Paramètres',
    difficulty: 'Difficulté',
    level: 'Niveau',
    language: 'Langue',
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
    
    // Operators
    operators: 'Opérateurs',
    addition: 'Addition',
    subtraction: 'Soustraction',
    multiplication: 'Multiplication',
    division: 'Division',
    
    // Stats
    score: 'Score',
    streak: 'Série',
    best: 'Meilleur',
    accuracy: 'Précision',
    highScore: 'Meilleur Score',
    bestStreak: 'Meilleure Série',
    
    // Problem History
    history: 'Historique',
    problemHistory: 'Historique des Problèmes',
    noHistory: 'Pas encore de problèmes. Commencez à jouer!',
    clearHistory: "Effacer l'Historique",
    correct: 'Correct',
    incorrect: 'Incorrect',
    yourAnswer: 'Votre réponse',
    correctAnswer: 'Bonne réponse',
    
    // Phrases - Correct
    correctPhrases: [
      "C'est exact!",
      "Excellent!",
      "Tu l'as!",
      "Très bien!",
      "Parfait!",
      "Incroyable!",
      "Merveilleux!",
      "Fantastique!",
      "Super!",
      "Brillant!",
      "Tu es une star des maths!",
      "Extraordinaire!",
    ],
    
    // Phrases - Incorrect
    incorrectPhrases: [
      "Pas tout à fait, la réponse est {answer}",
      "Presque! C'est {answer}",
      "Bon essai! La réponse est {answer}",
      "Presque! C'était {answer}",
      "Bel effort! C'est {answer}",
    ],
    
    // Phrases - Streak
    streakPhrases: [
      "Tu es en feu! {count} d'affilée!",
      "Série incroyable de {count}!",
      "Inarrêtable! {count} correctes!",
      "{count} d'affilée! Continue!",
    ],
    
    // Phrases - Hints
    hintPhrases: [
      "Prends ton temps!",
      "Tu peux le faire!",
      "Réfléchis bien!",
      "Presque!",
    ],
    
    // Math question format
    whatIs: "Combien fait",
    plus: "plus",
    minus: "moins",
    times: "fois",
    dividedBy: "divisé par",
  },
  
  de: {
    // Game UI
    title: 'OliverMath',
    play: 'Spielen',
    stop: 'Stoppen',
    listening: 'Höre zu...',
    thinking: 'Denke nach...',
    speaking: 'Spreche...',
    ready: 'Bereit zum Spielen!',
    
    // Settings
    settings: 'Einstellungen',
    difficulty: 'Schwierigkeit',
    level: 'Stufe',
    language: 'Sprache',
    easy: 'Leicht',
    medium: 'Mittel',
    hard: 'Schwer',
    
    // Operators
    operators: 'Operatoren',
    addition: 'Addition',
    subtraction: 'Subtraktion',
    multiplication: 'Multiplikation',
    division: 'Division',
    
    // Stats
    score: 'Punkte',
    streak: 'Serie',
    best: 'Beste',
    accuracy: 'Genauigkeit',
    highScore: 'Highscore',
    bestStreak: 'Beste Serie',
    
    // Problem History
    history: 'Verlauf',
    problemHistory: 'Problemverlauf',
    noHistory: 'Noch keine Aufgaben. Fang an zu spielen!',
    clearHistory: 'Verlauf löschen',
    correct: 'Richtig',
    incorrect: 'Falsch',
    yourAnswer: 'Deine Antwort',
    correctAnswer: 'Richtige Antwort',
    
    // Phrases - Correct
    correctPhrases: [
      "Das stimmt!",
      "Ausgezeichnet!",
      "Du hast es!",
      "Sehr gut!",
      "Perfekt!",
      "Erstaunlich!",
      "Wunderbar!",
      "Fantastisch!",
      "Super!",
      "Brilliant!",
      "Du bist ein Mathe-Star!",
      "Hervorragend!",
    ],
    
    // Phrases - Incorrect
    incorrectPhrases: [
      "Nicht ganz, die Antwort ist {answer}",
      "Fast! Es ist {answer}",
      "Guter Versuch! Die Antwort ist {answer}",
      "Beinahe! Es war {answer}",
      "Gute Bemühung! Es ist {answer}",
    ],
    
    // Phrases - Streak
    streakPhrases: [
      "Du bist on fire! {count} hintereinander!",
      "Unglaubliche Serie von {count}!",
      "Nicht zu stoppen! {count} richtig!",
      "{count} hintereinander! Weiter so!",
    ],
    
    // Phrases - Hints
    hintPhrases: [
      "Lass dir Zeit!",
      "Du schaffst das!",
      "Denk gut nach!",
      "Fast geschafft!",
    ],
    
    // Math question format
    whatIs: "Was ist",
    plus: "plus",
    minus: "minus",
    times: "mal",
    dividedBy: "geteilt durch",
  },
  
  pt: {
    // Game UI
    title: 'OliverMath',
    play: 'Jogar',
    stop: 'Parar',
    listening: 'Ouvindo...',
    thinking: 'Pensando...',
    speaking: 'Falando...',
    ready: 'Pronto para jogar!',
    
    // Settings
    settings: 'Configurações',
    difficulty: 'Dificuldade',
    level: 'Nível',
    language: 'Idioma',
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
    
    // Operators
    operators: 'Operadores',
    addition: 'Adição',
    subtraction: 'Subtração',
    multiplication: 'Multiplicação',
    division: 'Divisão',
    
    // Stats
    score: 'Pontos',
    streak: 'Sequência',
    best: 'Melhor',
    accuracy: 'Precisão',
    highScore: 'Recorde',
    bestStreak: 'Melhor Sequência',
    
    // Problem History
    history: 'Histórico',
    problemHistory: 'Histórico de Problemas',
    noHistory: 'Sem problemas ainda. Comece a jogar!',
    clearHistory: 'Limpar Histórico',
    correct: 'Correto',
    incorrect: 'Incorreto',
    yourAnswer: 'Sua resposta',
    correctAnswer: 'Resposta correta',
    
    // Phrases - Correct
    correctPhrases: [
      "Isso mesmo!",
      "Excelente!",
      "Você conseguiu!",
      "Muito bem!",
      "Perfeito!",
      "Incrível!",
      "Maravilhoso!",
      "Fantástico!",
      "Super!",
      "Brilhante!",
      "Você é uma estrela da matemática!",
      "Extraordinário!",
    ],
    
    // Phrases - Incorrect
    incorrectPhrases: [
      "Quase, a resposta é {answer}",
      "Perto! É {answer}",
      "Boa tentativa! A resposta é {answer}",
      "Quase! Era {answer}",
      "Bom esforço! É {answer}",
    ],
    
    // Phrases - Streak
    streakPhrases: [
      "Você está pegando fogo! {count} seguidas!",
      "Sequência incrível de {count}!",
      "Imparável! {count} corretas!",
      "{count} seguidas! Continue assim!",
    ],
    
    // Phrases - Hints
    hintPhrases: [
      "Não tenha pressa!",
      "Você consegue!",
      "Pense bem!",
      "Quase lá!",
    ],
    
    // Math question format
    whatIs: "Quanto é",
    plus: "mais",
    minus: "menos",
    times: "vezes",
    dividedBy: "dividido por",
  },
};

// Language-specific speech voices
export const SPEECH_VOICES = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
};

/**
 * Get the user's preferred language or default to English
 */
export function getPreferredLanguage() {
  const saved = localStorage.getItem('olivermath_language');
  if (saved && translations[saved]) {
    return saved;
  }
  // Try to detect from browser
  const browserLang = navigator.language.split('-')[0];
  if (translations[browserLang]) {
    return browserLang;
  }
  return 'en';
}

/**
 * Save language preference
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    localStorage.setItem('olivermath_language', lang);
    return true;
  }
  return false;
}

/**
 * Get translation for a key
 */
export function t(lang, key, params = {}) {
  const langTranslations = translations[lang] || translations.en;
  let text = langTranslations[key] || translations.en[key] || key;
  
  // Replace parameters like {answer} with actual values
  Object.keys(params).forEach((param) => {
    text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
  });
  
  return text;
}

/**
 * Get a random phrase from an array key
 */
export function getRandomPhrase(lang, key, params = {}) {
  const langTranslations = translations[lang] || translations.en;
  const phrases = langTranslations[key] || translations.en[key] || [];
  
  if (!Array.isArray(phrases) || phrases.length === 0) {
    return '';
  }
  
  let phrase = phrases[Math.floor(Math.random() * phrases.length)];
  
  // Replace parameters
  Object.keys(params).forEach((param) => {
    phrase = phrase.replace(new RegExp(`{${param}}`, 'g'), params[param]);
  });
  
  return phrase;
}
