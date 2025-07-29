# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive flashcard application that implements spaced repetition learning using the SuperMemo algorithm. The application is built with Next.js 15, React 19, and TypeScript, utilizing modern UI components and libraries for an optimal user experience.

### Technology Stack

**Core Framework:**
- Next.js 15.2.4 with React 19 and TypeScript 5
- Tailwind CSS for styling with custom animations

**UI Components:**
- Radix UI primitives for accessible, unstyled components
- Shadcn/ui component library built on Radix UI
- Lucide React for consistent iconography
- Class Variance Authority (CVA) for component variants

**State Management & Data:**
- Zustand for client-side state management with devtools
- TanStack Query (React Query) for server state management and caching
- Supabase for backend database, authentication, and real-time features
- Local storage for offline persistence and data backup

**Key Libraries:**
- SuperMemo library for spaced repetition algorithm implementation
- CodeMirror for syntax-highlighted code editing and display
- React Hook Form with Zod validation for form management
- Recharts for statistics visualization
- Sonner for toast notifications
- Next Themes for dark/light mode support

**Component Architecture:**
- Modular component design with separation of concerns
- Zustand store for global state management
- Custom hooks for Supabase queries and mutations
- Responsive design with mobile-first approach
- Sidebar navigation using Radix UI Sidebar components

## Requirements

### Requirement 1

**User Story:** As a student, I want to create and organize flashcards in different decks, so that I can separate my study materials by subject or topic.

#### Acceptance Criteria

1. WHEN the user creates a new deck THEN the system SHALL allow them to specify a name and optional description
2. WHEN the user creates a deck THEN the system SHALL assign a random color for visual identification
3. WHEN the user views the sidebar THEN the system SHALL display all available decks with their names and colors
4. WHEN the user selects a deck THEN the system SHALL show only flashcards belonging to that deck
5. WHEN the user deletes a deck THEN the system SHALL remove the deck and all associated flashcards
6. WHEN no deck is selected THEN the system SHALL prompt the user to select a deck

### Requirement 2

**User Story:** As a student, I want to create flashcards with rich content including HTML and code, so that I can study complex materials with proper formatting.

#### Acceptance Criteria

1. WHEN the user creates a flashcard THEN the system SHALL allow HTML content in both front and back fields using Textarea components
2. WHEN the user selects a programming language THEN the system SHALL provide CodeMirror-based syntax highlighting for supported languages (JavaScript, Python, Java, C++, CSS, HTML, JSON, Markdown, PHP, Rust, SQL, XML, Go)
3. WHEN creating HTML content THEN the system SHALL provide quick-insert buttons for common HTML tags (bold, italic, underline, code, line break)
4. WHEN the user previews content THEN the system SHALL show rendered HTML using dangerouslySetInnerHTML or CodeDisplay component for syntax highlighting
5. WHEN the user switches between raw and rendered views THEN the system SHALL toggle using Eye icon button between HTML source and rendered output
6. WHEN the user saves a flashcard THEN the system SHALL store the content with associated language metadata using Select components for language selection

### Requirement 3

**User Story:** As a student, I want to review flashcards using spaced repetition, so that I can optimize my learning and retention.

#### Acceptance Criteria

1. WHEN flashcards are due for review THEN the system SHALL present them in the review interface
2. WHEN the user reviews a card THEN the system SHALL show the question first, then allow revealing the answer
3. WHEN the user grades their performance THEN the system SHALL accept grades from 0-5 following SuperMemo standards
4. WHEN a card is graded THEN the system SHALL calculate the next review date using the SuperMemo algorithm
5. WHEN no cards are due THEN the system SHALL display an appropriate message
6. WHEN the user completes a review session THEN the system SHALL update card statistics and intervals

### Requirement 4

**User Story:** As a student, I want to manage my existing flashcards, so that I can edit, delete, and organize my study materials.

#### Acceptance Criteria

1. WHEN the user views the manage tab THEN the system SHALL display all cards in a scrollable Card container with individual card items
2. WHEN the user clicks edit on a card THEN the system SHALL open EditFlashcardForm component with current content pre-populated
3. WHEN the user saves edits THEN the system SHALL update the card content using React Hook Form validation and close the edit form
4. WHEN the user deletes a card THEN the system SHALL show a destructive Button with Trash2 icon and remove it permanently
5. WHEN viewing cards in manage mode THEN the system SHALL show card statistics (e-factor, interval, repetitions) in small text below content
6. WHEN the user toggles HTML view THEN the system SHALL use Code icon button to switch between rendered content and raw HTML in pre tags

### Requirement 5

**User Story:** As a student, I want to see statistics about my study progress, so that I can track my learning performance.

#### Acceptance Criteria

1. WHEN the user views a deck THEN the system SHALL display StatsDashboard component showing total cards, due cards, and cards reviewed today in Card components
2. WHEN statistics are shown THEN the system SHALL calculate and display average e-factor for the deck using getDeckStats utility function
3. WHEN the user reviews cards THEN the system SHALL update the "reviewed today" count through the reviewCard function
4. WHEN cards become due THEN the system SHALL update the due cards count using getDueFlashcards utility
5. WHEN the user switches decks THEN the system SHALL show statistics specific to the selected deck with Badge components for visual identification

### Requirement 6

**User Story:** As a student, I want to import and export my flashcard data, so that I can backup my study materials and share them with others.

#### Acceptance Criteria

1. WHEN the user exports data THEN the system SHALL use ImportExportDialog component to create a JSON file with all decks and flashcards via downloadJson utility
2. WHEN the user exports a specific deck THEN the system SHALL include only that deck and its cards using exportData function with selectedDeckId parameter
3. WHEN the user imports data THEN the system SHALL validate the file format using validateImportData function with detailed error checking
4. WHEN importing data with conflicts THEN the system SHALL use resolveConflicts function to provide options to skip, rename, or replace existing content
5. WHEN import validation fails THEN the system SHALL display specific error messages using toast notifications via Sonner
6. WHEN import succeeds THEN the system SHALL merge the imported data using processImportData function and update the application state

### Requirement 7

**User Story:** As a student, I want the application to work responsively on different devices, so that I can study on desktop, tablet, or mobile.

#### Acceptance Criteria

1. WHEN the user accesses the app on mobile THEN the system SHALL use Tailwind responsive classes (sm:, md:, lg:) to adapt layout with SidebarProvider and SidebarInset components
2. WHEN the user interacts with buttons on touch devices THEN the system SHALL provide touch-manipulation class and appropriate sizing (touch targets minimum 44px)
3. WHEN the sidebar is displayed on mobile THEN the system SHALL use SidebarTrigger component for collapsible AppSidebar navigation
4. WHEN content is displayed THEN the system SHALL use responsive text sizing (text-xs md:text-sm) and flexible grid layouts for readability
5. WHEN the user rotates their device THEN the system SHALL maintain functionality using Tailwind's responsive breakpoints and flexible containers

### Requirement 8

**User Story:** As a student, I want my flashcard data to persist between sessions and sync across devices, so that my study progress is maintained and accessible anywhere.

#### Acceptance Criteria

1. WHEN the user is authenticated THEN the system SHALL sync data with Supabase database using TanStack Query for caching and state management
2. WHEN the user is offline THEN the system SHALL use Zustand store with localStorage persistence to maintain functionality
3. WHEN the user comes back online THEN the system SHALL automatically sync local changes with the database using conflict resolution strategies
4. WHEN data conflicts occur THEN the system SHALL use database-wins strategy for merging with proper error handling and user notification
5. WHEN the user creates or modifies data THEN the system SHALL optimistically update the UI while syncing in the background using TanStack Query mutations
6. WHEN storage data is corrupted THEN the system SHALL handle errors gracefully with fallback to sample data and user notification via toast messages

### Requirement 9

**User Story:** As a student, I want a cram mode to review all cards regardless of their due date, so that I can intensively study before exams or refresh my knowledge.

#### Acceptance Criteria

1. WHEN the user activates cram mode THEN the system SHALL display all cards in the selected deck regardless of their review schedule
2. WHEN reviewing cards in cram mode THEN the system SHALL present cards in the same interface as regular review but without updating SuperMemo intervals
3. WHEN the user grades a card in cram mode THEN the system SHALL track the session performance but not modify the card's next review date
4. WHEN cram mode is active THEN the system SHALL display a visual indicator distinguishing it from regular review mode
5. WHEN the user exits cram mode THEN the system SHALL return to the normal spaced repetition review interface
6. WHEN no cards exist in the selected deck THEN the system SHALL display an appropriate message in cram mode

### Requirement 10

**User Story:** As a student, I want to create an account and sign in, so that my flashcard data is securely stored and accessible across devices.

#### Acceptance Criteria

1. WHEN the user visits the application THEN the system SHALL provide authentication options using Supabase Auth
2. WHEN the user signs up THEN the system SHALL create a secure account with email verification
3. WHEN the user signs in THEN the system SHALL authenticate them and load their personal flashcard data
4. WHEN the user is authenticated THEN the system SHALL display user information and sign-out option in the header
5. WHEN the user signs out THEN the system SHALL clear their session and redirect to the authentication page
6. WHEN the user is not authenticated THEN the system SHALL work in offline mode with local storage only

### Requirement 11

**User Story:** As a student, I want to toggle between dark and light themes, so that I can study comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHEN the user clicks the theme toggle THEN the system SHALL switch between light and dark themes using next-themes
2. WHEN the application loads THEN the system SHALL detect and apply the user's system theme preference by default
3. WHEN the user changes themes THEN the system SHALL persist the preference in localStorage for future sessions
4. WHEN in dark mode THEN the system SHALL apply dark variants to all components using Tailwind dark: classes
5. WHEN switching themes THEN the system SHALL provide smooth transitions between color schemes
6. WHEN the theme toggle is displayed THEN the system SHALL show appropriate icons (sun/moon) and be accessible via keyboard navigation