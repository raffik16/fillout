import { WizardQuestion } from '@/app/types/wizard';

export const wizardQuestions: WizardQuestion[] = [
  {
    id: 'category',
    title: "What are we drinking?",
    subtitle: "Choose your preferred drink category",
    options: [
      { value: 'cocktail', label: 'Cocktails', emoji: '🍸' },
      { value: 'beer', label: 'Beer/Cider', emoji: '🍺' },
      { value: 'wine', label: 'Wine', emoji: '🍷' },
      { value: 'spirit', label: 'Spirits', emoji: '🥃' },
      { value: 'non-alcoholic', label: 'Non-Alcoholic', emoji: '🌿' },
      { value: 'any', label: 'Surprise Me!', emoji: '🎲' }
    ]
  },
  {
    id: 'flavor',
    title: "What's your vibe?",
    subtitle: "Pick your flavor personality",
    options: [
      { value: 'sweet', label: 'Sweet Tooth', emoji: '🍬' },
      { value: 'bitter', label: 'Bitter is Better', emoji: '🌿' },
      { value: 'sour', label: 'Sour Power', emoji: '🍋' },
      { value: 'smooth', label: 'Smooth Operator', emoji: '🥃' }
    ]
  },
  {
    id: 'temperature',
    title: "Whats your chill level?",
    subtitle: "Your ideal serving temperature",
    options: [
      { value: 'cold', label: 'Ice Cold', emoji: '❄️' },
      { value: 'cool', label: 'Cool & Refreshing', emoji: '🌊' },
      { value: 'room', label: 'Room Temp', emoji: '🌡️' },
      { value: 'warm', label: 'Warm & Cozy', emoji: '☕' }
    ]
  },
  {
    id: 'adventure',
    title: "Pick your adventure style",
    subtitle: "How bold are you feeling?",
    options: [
      { value: 'classic', label: 'Classic & Timeless', emoji: '🎩' },
      { value: 'bold', label: 'Bold & Experimental', emoji: '🚀' },
      { value: 'fruity', label: 'Fruity & Fun', emoji: '🌴' },
      { value: 'simple', label: 'Simple & Clean', emoji: '💎' }
    ]
  },
  {
    id: 'strength',
    title: "What's your power level?",
    subtitle: "Choose your strength",
    options: [
      { value: 'light', label: 'Easy Going', emoji: '🌸' },
      { value: 'medium', label: 'Balanced', emoji: '⚖️' },
      { value: 'strong', label: 'Bring the Power', emoji: '🔥' },
      { value: 'non-alcoholic', label: 'Zero Proof', emoji: '🙅' }
    ]
  },
  {
    id: 'occasion',
    title: "What's the occasion?",
    subtitle: "What's got you thristy?",
    options: [
      { value: 'casual', label: 'Happy Hour', emoji: '🎉' },
      { value: 'celebration', label: 'Celebrating', emoji: '🥂' },
      { value: 'business', label: 'Business Meeting', emoji: '💼' },
      { value: 'romantic', label: 'Romantic Dinner', emoji: '🌹' },
      { value: 'sports', label: 'Game Day', emoji: '🏈' },
      { value: 'exploring', label: 'Exploring The Bar', emoji: '🍸' }
    ]
  }
];