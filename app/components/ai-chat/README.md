# AI Chat Interface Components

A collection of React components for implementing an AI chat interface in the Drinkjoy application.

## Components

### AIChatWrapper
The main wrapper component that provides the complete chat experience.

```tsx
import { AIChatWrapper } from '@/app/components/ai-chat';

<AIChatWrapper />
```

### AIChatInterface
The main chat window component with message list and input.

```tsx
import { AIChatInterface } from '@/app/components/ai-chat';

<AIChatInterface 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
/>
```

### ChatToggle
Floating action button to open/close the chat.

```tsx
import { ChatToggle } from '@/app/components/ai-chat';

<ChatToggle 
  isOpen={isOpen} 
  onClick={() => setIsOpen(!isOpen)} 
/>
```

### MessageBubble
Individual message component for user and AI messages.

```tsx
import { MessageBubble, Message } from '@/app/components/ai-chat';

const message: Message = {
  id: '1',
  content: 'Hello!',
  role: 'user',
  timestamp: new Date()
};

<MessageBubble message={message} />
```

### QuickSuggestions
Preset prompts for common drink-related questions.

```tsx
import { QuickSuggestions } from '@/app/components/ai-chat';

<QuickSuggestions 
  onSelect={(suggestion) => console.log(suggestion)} 
/>
```

### TypingIndicator
Shows animated dots when AI is thinking.

```tsx
import { TypingIndicator } from '@/app/components/ai-chat';

<TypingIndicator />
```

## Features

- **Mobile-responsive design** with adaptive layouts
- **Dark mode support** with automatic theme switching
- **Smooth animations** powered by Framer Motion
- **Accessibility compliant** with proper ARIA labels and keyboard navigation
- **Modern aesthetic** matching Drinkjoy's brand colors (amber/orange gradients)
- **Engaging interactions** with hover effects and micro-animations

## Design Elements

- **Glass morphism effects** with backdrop blur
- **Gradient backgrounds** using brand colors
- **Rounded corners** (2xl radius) for modern look
- **Subtle shadows** for depth
- **Smooth transitions** (200ms duration)
- **Spring animations** for natural feel

## Integration

The easiest way to add the chat to your application is using the `AIChatWrapper` component:

```tsx
// Add to your main layout or page component
import { AIChatWrapper } from '@/app/components/ai-chat';

export function MyPage() {
  return (
    <div>
      {/* Your existing content */}
      <AIChatWrapper />
    </div>
  );
}
```

## Customization

All components accept a `className` prop for custom styling. The components use Tailwind CSS classes and can be easily customized to match your design requirements.

## Dependencies

- React 18+
- Framer Motion
- React Icons (FiMessageCircle, FiX, FiSend, FiUser, HiSparkles)
- Tailwind CSS
- clsx and tailwind-merge (via utils)

## Future Enhancements

- Real AI integration with OpenAI or similar API
- Message persistence with local storage
- Voice input/output capabilities
- Drink recommendation cards within chat
- Integration with existing wizard results