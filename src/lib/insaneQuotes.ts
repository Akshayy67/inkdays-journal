// 50 Unique daily wisdom quotes for the Insane State journey
export const INSANE_QUOTES: { day: number; quote: string; author?: string }[] = [
  { day: 1, quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { day: 2, quote: "Small disciplines repeated with consistency lead to great achievements gained slowly over time.", author: "John C. Maxwell" },
  { day: 3, quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { day: 4, quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { day: 5, quote: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { day: 6, quote: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { day: 7, quote: "One week of consistency has planted seeds of transformation." },
  { day: 8, quote: "Progress is impossible without change, and those who cannot change their minds cannot change anything.", author: "George Bernard Shaw" },
  { day: 9, quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { day: 10, quote: "Ten days. You've proven that intention can become action. Your first unlock awaits." },
  { day: 11, quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Rohn" },
  { day: 12, quote: "Champions keep playing until they get it right.", author: "Billie Jean King" },
  { day: 13, quote: "The pain of discipline is nothing like the pain of disappointment.", author: "Justin Langer" },
  { day: 14, quote: "Two weeks. The neural pathways are forming. This is becoming who you are." },
  { day: 15, quote: "Excellence is not a destination but a continuous journey that never ends.", author: "Brian Tracy" },
  { day: 16, quote: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { day: 17, quote: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { day: 18, quote: "Persistence guarantees that results are inevitable.", author: "Paramahansa Yogananda" },
  { day: 19, quote: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { day: 20, quote: "Twenty days of devotion. The universe is beginning to respond. Watch for the particles of change." },
  { day: 21, quote: "Twenty-one days. Science says this is when habits begin to form. You're becoming unstoppable." },
  { day: 22, quote: "The difference between who you are and who you want to be is what you do.", author: "Charles Duhigg" },
  { day: 23, quote: "Your habits will determine your future.", author: "Jack Canfield" },
  { day: 24, quote: "Consistency is the true foundation of trust.", author: "Roy T. Bennett" },
  { day: 25, quote: "Halfway there. Look back at who you were on Day 1. See the transformation." },
  { day: 26, quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { day: 27, quote: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { day: 28, quote: "Four weeks of unwavering commitment. You are building something extraordinary." },
  { day: 29, quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { day: 30, quote: "Thirty days. You've earned the sounds of serenity. Let them accompany your journey." },
  { day: 31, quote: "Mastery is not a function of genius or talent. It is a function of time and intense focus.", author: "Robert Greene" },
  { day: 32, quote: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { day: 33, quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { day: 34, quote: "Success is not how high you have climbed, but how you make a positive difference to the world.", author: "Roy T. Bennett" },
  { day: 35, quote: "Thirty-five days. Five weeks of dedication. You're in the top 1% of people who start a habit." },
  { day: 36, quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { day: 37, quote: "What seems impossible today will one day become your warm-up.", author: "Unknown" },
  { day: 38, quote: "Your dedication has become your identity. You are no longer just doing—you are being." },
  { day: 39, quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { day: 40, quote: "Forty days of mastery. A title befitting a legend. You've earned it." },
  { day: 41, quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { day: 42, quote: "Six weeks. Forty-two days. This is no longer a challenge—it's your way of life." },
  { day: 43, quote: "Act as if what you do makes a difference. It does.", author: "William James" },
  { day: 44, quote: "The harder the conflict, the greater the triumph.", author: "George Washington" },
  { day: 45, quote: "Forty-five days. You can almost see it now—the destination glowing before you." },
  { day: 46, quote: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { day: 47, quote: "Three more days. The anticipation builds. The transformation is nearly complete." },
  { day: 48, quote: "You've walked a path that most only dream of. Two days remain." },
  { day: 49, quote: "Tomorrow, you arrive. Tonight, reflect on who you've become." },
  { day: 50, quote: "Welcome to the Insane State. You've transcended ordinary. This space is yours forever." },
];

export const getQuoteForDay = (day: number): { quote: string; author?: string } | null => {
  const quote = INSANE_QUOTES.find(q => q.day === day);
  return quote || null;
};

export const getMilestoneMessage = (day: number): string | null => {
  switch (day) {
    case 10: return "🎨 Theme Unlocked! Choose a custom color theme for your app.";
    case 20: return "✨ Particles Unlocked! Special effects now accompany your completions.";
    case 30: return "🎵 Sounds Unlocked! Choose ambient sounds for your journey.";
    case 40: return "👑 Title Unlocked! Create your personal title of mastery.";
    case 50: return "🏆 The Insane Crown is yours! Welcome to the Zen Garden.";
    default: return null;
  }
};
