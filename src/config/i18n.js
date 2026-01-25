/**
 * Internationalization (i18n) configuration
 * Supports multiple languages for the math game
 */

export const LANGUAGES = {
  en: { name: 'English', flag: '\u{1F1EC}\u{1F1E7}' },
  es: { name: 'Español', flag: '\u{1F1EA}\u{1F1F8}' },
  fr: { name: 'Français', flag: '\u{1F1EB}\u{1F1F7}' },
  de: { name: 'Deutsch', flag: '\u{1F1E9}\u{1F1EA}' },
  pt: { name: 'Português', flag: '\u{1F1E7}\u{1F1F7}' },
};

export const translations = {
  en: {
    // Game UI
    title: 'Oliver Math',
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
    
    initialPrompt: 'Click play, listen to the question and respond back by talking your answer.',
    
    // Stats & Dashboard
    stats: 'Stats',
    dashboard: 'Dashboard',
    overview: 'Overview',
    detailedHistory: 'Detailed History',
    performanceByOperator: 'Performance by Operator',
    performanceByDifficulty: 'Performance by Difficulty',
    totalProblems: 'Total Problems',
    correctAnswers: 'Correct Answers',
    totalStars: 'Total Stars',
    currentStreak: 'Current Streak',
    longestStreak: 'Longest Streak',
    averageAccuracy: 'Average Accuracy',
    
    // Filter & Display
    filterByOperator: 'Filter by Operator',
    filterByDifficulty: 'Filter by Difficulty',
    filterByStatus: 'Filter by Status',
    allOperators: 'All Operators',
    allDifficulties: 'All Difficulties',
    correct: 'Correct',
    incorrect: 'Incorrect',
    all: 'All',
    
    // History Table
    date: 'Date',
    problem: 'Problem',
    yourAnswer: 'Your Answer',
    result: 'Result',
    points: 'Points',
    timeAgo: 'Time Ago',
    
    // Stats Labels
    operator: 'Operator',
    difficulty: 'Difficulty',
    accuracy: 'Accuracy',
    attempt: 'Attempt',
    attempts: 'Attempts',
    successRate: 'Success Rate',
    
    // Answer Details
    recentAnswers: 'Recent Answers',
    answer: 'Answer',
  },
  
  es: {
    // Game UI
    title: 'Oliver Math',
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
    recentAnswers: 'Respuestas Recientes',
    answer: 'Respuesta',
    
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
    whatIs: "Cuánto es",
    plus: "más",
    minus: "menos",
    times: "por",
    dividedBy: "entre",
    
    initialPrompt: 'Haz clic en jugar, escucha la pregunta y responde hablando.',
    
    // Stats & Dashboard
    stats: 'Estadísticas',
    dashboard: 'Panel de Control',
    overview: 'General',
    detailedHistory: 'Historial Detallado',
    performanceByOperator: 'Rendimiento por Operación',
    performanceByDifficulty: 'Rendimiento por Dificultad',
    totalProblems: 'Problemas Total',
    correctAnswers: 'Respuestas Correctas',
    totalStars: 'Estrellas Totales',
    currentStreak: 'Racha Actual',
    longestStreak: 'Mejor Racha',
    averageAccuracy: 'Precisión Promedio',
    
    // Filter & Display
    filterByOperator: 'Filtrar por Operación',
    filterByDifficulty: 'Filtrar por Dificultad',
    filterByStatus: 'Filtrar por Estado',
    allOperators: 'Todas las Operaciones',
    allDifficulties: 'Todas las Dificultades',
    correct: 'Correcto',
    incorrect: 'Incorrecto',
    all: 'Todo',
    
    // History Table
    date: 'Fecha',
    problem: 'Problema',
    yourAnswer: 'Tu Respuesta',
    result: 'Resultado',
    points: 'Puntos',
    timeAgo: 'Hace',
    
    // Stats Labels
    operator: 'Operación',
    difficulty: 'Dificultad',
    accuracy: 'Precisión',
    attempt: 'Intento',
    attempts: 'Intentos',
    successRate: 'Tasa de Éxito',
  },
  
  fr: {
    // Game UI
    title: 'Oliver Math',
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
    recentAnswers: 'Réponses Récentes',
    answer: 'Réponse',
    
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
    whatIs: "Combien font",
    plus: "plus",
    minus: "moins",
    times: "fois",
    dividedBy: "divisé par",
    
    initialPrompt: 'Cliquez sur jouer, écoutez la question et répondez en parlant.',
    
    // Stats & Dashboard
    stats: 'Statistiques',
    dashboard: 'Tableau de Bord',
    overview: 'Aperçu',
    detailedHistory: 'Historique Détaillé',
    performanceByOperator: 'Performance par Opération',
    performanceByDifficulty: 'Performance par Difficulté',
    totalProblems: 'Problèmes au Total',
    correctAnswers: 'Réponses Correctes',
    totalStars: 'Étoiles Totales',
    currentStreak: 'Série Actuelle',
    longestStreak: 'Meilleure Série',
    averageAccuracy: 'Précision Moyenne',
    
    // Filter & Display
    filterByOperator: 'Filtrer par Opération',
    filterByDifficulty: 'Filtrer par Difficulté',
    filterByStatus: 'Filtrer par Statut',
    allOperators: 'Toutes les Opérations',
    allDifficulties: 'Toutes les Difficultés',
    correct: 'Correct',
    incorrect: 'Incorrect',
    all: 'Tous',
    
    // History Table
    date: 'Date',
    problem: 'Problème',
    yourAnswer: 'Votre Réponse',
    result: 'Résultat',
    points: 'Points',
    timeAgo: 'Il y a',
    
    // Stats Labels
    operator: 'Opération',
    difficulty: 'Difficulté',
    accuracy: 'Précision',
    attempt: 'Tentative',
    attempts: 'Tentatives',
    successRate: 'Taux de Réussite',
  },
  
  de: {
    // Game UI
    title: 'Oliver Math',
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
    recentAnswers: 'Letzte Antworten',
    answer: 'Antwort',
    
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
    whatIs: "Wie viel ist",
    plus: "plus",
    minus: "minus",
    times: "mal",
    dividedBy: "geteilt durch",
    
    initialPrompt: 'Klicke auf "Spielen", höre die Frage und antworte, indem du sprichst.',
    
    // Stats & Dashboard
    stats: 'Statistiken',
    dashboard: 'Armaturenbrett',
    overview: 'Überblick',
    detailedHistory: 'Detaillierter Verlauf',
    performanceByOperator: 'Leistung nach Operator',
    performanceByDifficulty: 'Leistung nach Schwierigkeit',
    totalProblems: 'Gesamtaufgaben',
    correctAnswers: 'Korrekte Antworten',
    totalStars: 'Gesamtsterne',
    currentStreak: 'Aktuelle Serie',
    longestStreak: 'Beste Serie',
    averageAccuracy: 'Durchschnittliche Genauigkeit',
    
    // Filter & Display
    filterByOperator: 'Nach Operator filtern',
    filterByDifficulty: 'Nach Schwierigkeit filtern',
    filterByStatus: 'Nach Status filtern',
    allOperators: 'Alle Operatoren',
    allDifficulties: 'Alle Schwierigkeitsgrade',
    correct: 'Richtig',
    incorrect: 'Falsch',
    all: 'Alle',
    
    // History Table
    date: 'Datum',
    problem: 'Aufgabe',
    yourAnswer: 'Deine Antwort',
    result: 'Ergebnis',
    points: 'Punkte',
    timeAgo: 'vor',
    
    // Stats Labels
    operator: 'Operator',
    difficulty: 'Schwierigkeit',
    accuracy: 'Genauigkeit',
    attempt: 'Versuch',
    attempts: 'Versuche',
    successRate: 'Erfolgsquote',
  },
  
  pt: {
    // Game UI
    title: 'Oliver Math',
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
    recentAnswers: 'Respostas Recentes',
    answer: 'Resposta',
    
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
    
    initialPrompt: 'Clique em jogar, ouça a pergunta e responda falando.',
    
    // Stats & Dashboard
    stats: 'Estatísticas',
    dashboard: 'Painel de Controle',
    overview: 'Visão Geral',
    detailedHistory: 'Histórico Detalhado',
    performanceByOperator: 'Desempenho por Operador',
    performanceByDifficulty: 'Desempenho por Dificuldade',
    totalProblems: 'Total de Problemas',
    correctAnswers: 'Respostas Corretas',
    totalStars: 'Estrelas Totais',
    currentStreak: 'Sequência Atual',
    longestStreak: 'Melhor Sequência',
    averageAccuracy: 'Precisão Média',
    
    // Filter & Display
    filterByOperator: 'Filtrar por Operador',
    filterByDifficulty: 'Filtrar por Dificuldade',
    filterByStatus: 'Filtrar por Status',
    allOperators: 'Todos os Operadores',
    allDifficulties: 'Todas as Dificuldades',
    correct: 'Correto',
    incorrect: 'Incorreto',
    all: 'Todos',
    
    // History Table
    date: 'Data',
    problem: 'Problema',
    yourAnswer: 'Sua Resposta',
    result: 'Resultado',
    points: 'Pontos',
    timeAgo: 'há',
    
    // Stats Labels
    operator: 'Operador',
    difficulty: 'Dificuldade',
    accuracy: 'Precisão',
    attempt: 'Tentativa',
    attempts: 'Tentativas',
    successRate: 'Taxa de Sucesso',
  },
};

// Language-specific speech voices
export const SPEECH_VOICES = {
  en: 'en-GB',
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
