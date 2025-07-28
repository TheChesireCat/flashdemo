# Design Document

## Overview

The flashcard application follows a modern React architecture with Next.js, implementing a component-based design system using Radix UI primitives and Tailwind CSS. The application uses a custom hook pattern for state management and implements the SuperMemo spaced repetition algorithm for optimal learning efficiency.

## Architecture

### Application Structure
```
flashcard-app/
├── app/                    # Next.js app router
├── components/            # React components
│   ├── ui/               # Reusable UI components (Shadcn/ui)
│   └── [feature-components] # Feature-specific components
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Utility functions and algorithms
└── styles/               # Global styles and Tailwind config
```

### State Management Architecture
- **useFlashcards Hook**: Central state management for all flashcard operations
- **Local Storage Persistence**: Automatic data persistence with error handling
- **React State**: Component-level state for UI interactions

### Data Flow
1. User interactions trigger component events
2. Components call useFlashcards hook methods
3. Hook updates React state and triggers localStorage persistence
4. UI re-renders based on updated state

## Components and Interfaces

### Core Components

#### FlashcardApp (Main Container)
- **Purpose**: Root application component with layout and routing
- **Dependencies**: SidebarProvider, AppSidebar, Tabs components
- **State**: activeTab, showHtmlInManage, editingCardId
- **Key Features**: Responsive layout, tab navigation, sidebar integration

#### AppSidebar
- **Purpose**: Navigation and deck management
- **Props**: decks, selectedDeckId, onSelectDeck, onAddDeck, onDeleteDeck, getDeckStats
- **Features**: Collapsible design, deck creation form, deck statistics display

#### AddFlashcardForm
- **Purpose**: Create new flashcards with rich content
- **Dependencies**: CodeDisplay, Select, Textarea, Button components
- **Features**: HTML content support, syntax highlighting, language selection, preview mode

#### FlashcardReview
- **Purpose**: Spaced repetition review interface
- **Props**: card, onReview, onNext, cardNumber, totalCards, isCramMode?
- **Features**: Card flipping, SuperMemo grading (0-5), progress tracking, cram mode support

#### EditFlashcardForm
- **Purpose**: Modify existing flashcard content
- **Similar to**: AddFlashcardForm but with pre-populated data
- **Features**: Inline editing, cancel/save actions

#### StatsDashboard
- **Purpose**: Display learning progress metrics
- **Data**: totalCards, dueCards, reviewedToday, averageEfactor
- **Visualization**: Card-based layout with key metrics

#### ImportExportDialog
- **Purpose**: Data backup and sharing functionality
- **Features**: JSON export, file import with validation, conflict resolution

#### CodeDisplay
- **Purpose**: Syntax-highlighted code rendering
- **Dependencies**: CodeMirror, language extensions
- **Supported Languages**: JavaScript, Python, Java, C++, CSS, HTML, JSON, Markdown, PHP, Rust, SQL, XML, Go

### UI Component System

#### Design Tokens
- **Colors**: Tailwind CSS color palette with semantic naming
- **Typography**: Responsive text sizing (text-xs to text-xl)
- **Spacing**: Consistent padding and margin using Tailwind spacing scale
- **Shadows**: Subtle elevation with Tailwind shadow utilities

#### Component Variants
- **Buttons**: Primary, secondary, outline, destructive variants
- **Cards**: Standard cards with header/content sections
- **Badges**: Color-coded deck identification and language tags
- **Forms**: Consistent form styling with validation states

## Data Models

### Flashcard Interface
```typescript
interface Flashcard {
  id: string                 // Unique identifier
  deckId: string            // Reference to parent deck
  front: string             // Question content (HTML supported)
  back: string              // Answer content (HTML supported)
  frontLanguage?: string    // Programming language for syntax highlighting
  backLanguage?: string     // Programming language for syntax highlighting
  createdAt: Date          // Creation timestamp
  lastReviewed?: Date      // Last review timestamp
  nextReview: Date         // Next scheduled review
  interval: number         // Days until next review
  repetition: number       // Number of successful reviews
  efactor: number          // SuperMemo ease factor (1.3-2.5+)
}
```

### Deck Interface
```typescript
interface Deck {
  id: string              // Unique identifier
  name: string           // Display name
  description?: string   // Optional description
  color: string         // CSS class for visual identification
  createdAt: Date       // Creation timestamp
}
```

### Statistics Interfaces
```typescript
interface FlashcardStats {
  totalCards: number      // Total cards in scope
  dueCards: number       // Cards due for review
  reviewedToday: number  // Cards reviewed today
  averageEfactor: number // Average ease factor
}

interface DeckStats extends FlashcardStats {
  deckId: string         // Deck identifier
  deckName: string       // Deck display name
}
```

## Error Handling

### Data Persistence Errors
- **localStorage Failures**: Try-catch blocks with console error logging
- **JSON Parsing Errors**: Graceful fallback to empty state
- **Data Corruption**: Validation and recovery mechanisms

### Import/Export Errors
- **File Format Validation**: Comprehensive schema validation
- **Missing Fields**: Detailed error messages with field identification
- **Conflict Resolution**: User-guided resolution strategies

### User Input Validation
- **Form Validation**: React Hook Form with Zod schemas
- **Content Validation**: HTML sanitization and length limits
- **File Upload**: MIME type and size validation

## Testing Strategy

### Unit Testing Approach
- **Utility Functions**: Test SuperMemo algorithm implementation
- **Data Transformations**: Test import/export functions
- **State Management**: Test useFlashcards hook behavior

### Component Testing
- **Rendering Tests**: Verify component output with various props
- **Interaction Tests**: Test user interactions and state changes
- **Accessibility Tests**: Ensure keyboard navigation and screen reader support

### Integration Testing
- **Data Flow**: Test complete user workflows
- **Persistence**: Test localStorage integration
- **Error Scenarios**: Test error handling and recovery

### Testing Tools
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking for integration tests

## Performance Considerations

### Optimization Strategies
- **Code Splitting**: Next.js automatic code splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large card lists (future enhancement)

### Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Dynamic Imports**: Load CodeMirror languages on demand
- **Image Optimization**: Next.js automatic image optimization

### Runtime Performance
- **State Updates**: Batched updates to prevent unnecessary re-renders
- **Local Storage**: Debounced writes to reduce I/O
- **Memory Management**: Proper cleanup of event listeners and timers

## Theme System Enhancement

### Dark/Light Mode Implementation

#### Theme Provider Architecture
- **next-themes Integration**: Utilize existing next-themes library for theme management
- **System Preference Detection**: Automatic detection of user's system theme preference
- **Theme Persistence**: Store user's theme choice in localStorage
- **SSR Compatibility**: Prevent hydration mismatches with proper theme initialization

#### Theme Toggle Component
```typescript
interface ThemeToggleProps {
  variant?: 'button' | 'switch'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}
```

#### Visual Design Updates
- **Color Scheme Variables**: CSS custom properties for theme-aware colors
- **Component Adaptations**: Update all components to support dark mode variants
- **Contrast Compliance**: Ensure WCAG AA compliance for both themes
- **Icon Integration**: Sun/Moon icons for theme toggle button

#### Implementation Strategy
1. **Theme Context**: Wrap application with ThemeProvider
2. **CSS Variables**: Define theme-specific color tokens
3. **Component Updates**: Add dark: prefixes to Tailwind classes
4. **Toggle Placement**: Add theme toggle to header/sidebar
5. **Animation**: Smooth transitions between theme changes

## Cram Mode Enhancement

### Cram Mode Architecture
- **Mode State**: Boolean flag to distinguish between regular and cram review modes
- **Card Selection**: Include all cards from selected deck regardless of due date
- **Review Tracking**: Separate session tracking without affecting SuperMemo intervals
- **Visual Indicators**: Clear UI distinction between modes

### Cram Mode Components

#### CramModeToggle
```typescript
interface CramModeToggleProps {
  isCramMode: boolean
  onToggle: (enabled: boolean) => void
  disabled?: boolean
}
```

#### Enhanced Review Interface
- **Mode Indicator**: Badge or header text showing current mode
- **Grading Behavior**: Track performance without updating card intervals
- **Progress Display**: Show cards completed vs total cards in deck
- **Session Statistics**: Track cram session performance separately

### Implementation Considerations
- **State Management**: Add cramMode state to useFlashcards hook
- **Card Filtering**: Modify card selection logic to include all cards when in cram mode
- **Review Logic**: Conditional SuperMemo updates based on mode
- **UI Updates**: Visual indicators and mode-specific messaging