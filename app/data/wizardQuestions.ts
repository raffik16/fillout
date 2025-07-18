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
      { value: 'any', label: 'Surprise Me!', emoji: '🎲' },
      { value: 'featured', label: 'Featured Drinks', emoji: '⭐' }
    ]
  },
  {
    id: 'flavor',
    title: "What's your vibe?",
    subtitle: "Pick your flavor personality",
    options: [
      { value: 'crisp', label: 'Crisp', emoji: '❄️' },
      { value: 'smokey', label: 'Smokey', emoji: '🔥' },
      { value: 'sweet', label: 'Sweet Tooth', emoji: '🍬' },
      { value: 'bitter', label: 'Bitter is Better', emoji: '🌿' },
      { value: 'sour', label: 'Sour Power', emoji: '🍋' },
      { value: 'smooth', label: 'Smooth Operator', emoji: '✨' }
    ]
  },
  {
    id: 'strength',
    title: "What's your style?",
    subtitle: "Choose your strength",
    options: [
      { value: 'medium', label: 'Balanced', emoji: '⚖️' },
      { value: 'light', label: 'Easy Going', emoji: '🌸' },
      { value: 'strong', label: 'Bring the Power', emoji: '💪' }
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
      { value: 'exploring', label: 'Exploring The Bar', emoji: '🍸' },
      { value: 'newly21', label: 'Newly 21!', emoji: '🎂' },
      { value: 'birthday', label: 'It\'s My Birthday!', emoji: '🎈' }
    ]
  },
  {
    id: 'allergies',
    title: "Any allergies we should know about?",
    subtitle: "Help us keep you safe and find drinks you can enjoy",
    options: [
      { value: 'none', label: 'No Allergies', emoji: '✅' },
      { value: 'gluten', label: 'Gluten', emoji: '🌾' },
      { value: 'dairy', label: 'Dairy', emoji: '🥛' },
      { value: 'nuts', label: 'Nuts', emoji: '🥜' },
      { value: 'eggs', label: 'Eggs', emoji: '🥚' },
      { value: 'soy', label: 'Soy', emoji: '🫘' }
    ]
  }
];