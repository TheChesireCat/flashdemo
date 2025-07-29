# L337Deck - SuperMemo Flashcard App

A powerful spaced repetition flashcard application using the SuperMemo algorithm, built with Next.js 15, React 19, and Supabase for online sync.

## Features

- **Spaced Repetition**: Implements the SuperMemo algorithm for optimal learning intervals
- **Online Sync**: Seamless synchronization with Supabase database
- **Offline Support**: Works offline with localStorage fallback
- **Code Syntax Highlighting**: Support for programming languages with CodeMirror
- **Cram Mode**: Review all cards regardless of due dates
- **Import/Export**: Backup and restore your data
- **Dark Mode**: Beautiful dark and light themes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Custom hooks with localStorage
- **Code Highlighting**: CodeMirror

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account (free tier available)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flashcard-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Copy your project URL and anon key from Settings > API

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Set Up Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Decks table
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Flashcards table
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  front_language TEXT,
  back_language TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE NOT NULL,
  interval INTEGER NOT NULL DEFAULT 1,
  repetition INTEGER NOT NULL DEFAULT 0,
  efactor DECIMAL(3,2) NOT NULL DEFAULT 2.5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review sessions table (for analytics)
CREATE TABLE review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES decks(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('spaced_repetition', 'cram')),
  cards_reviewed INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;

-- Decks policies
CREATE POLICY "Users can view their own decks" ON decks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decks" ON decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" ON decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" ON decks
  FOR DELETE USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "Users can view their own flashcards" ON flashcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards" ON flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards" ON flashcards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards" ON flashcards
  FOR DELETE USING (auth.uid() = user_id);

-- Review sessions policies
CREATE POLICY "Users can view their own review sessions" ON review_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own review sessions" ON review_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 6. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000`)
3. Add redirect URLs for authentication:
   - `http://localhost:3000/auth`
   - `http://localhost:3000/auth/reset-password`

### 7. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Guest Mode
- Use the app without creating an account
- Data is stored locally in your browser
- Perfect for trying out the app

### Online Mode
1. Click "Sign In" in the user menu
2. Create an account or sign in with existing credentials
3. Switch to "Online Mode" in the user menu
4. Your data will sync across devices

### Creating Flashcards
1. Select a deck from the sidebar
2. Go to the "Add" tab
3. Enter the front and back content
4. Optionally select programming languages for syntax highlighting
5. Click "Add Card"

### Reviewing Cards
1. Go to the "Review" tab
2. Cards due for review will appear automatically
3. Rate your performance (1-5 stars)
4. The SuperMemo algorithm will schedule the next review

### Cram Mode
- Toggle "Cram Mode" to review all cards in a deck
- Useful for intensive study sessions
- Doesn't affect the spaced repetition schedule

## Architecture

### Data Flow
1. **Local Storage**: All data is cached locally for offline use
2. **Online Sync**: When authenticated, data syncs with Supabase
3. **Conflict Resolution**: Database wins on conflicts (simple strategy)
4. **Real-time Updates**: Changes sync across devices

### Key Components
- `useFlashcards`: Offline hook with localStorage
- `useFlashcardsOnline`: Online hook with Supabase sync
- `DatabaseService`: Service layer for database operations
- `AuthProvider`: Authentication context and session management

### Database Schema
- **decks**: User's flashcard decks
- **flashcards**: Individual cards with SuperMemo data
- **review_sessions**: Analytics and progress tracking

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- Set environment variables for Supabase
- Build with `npm run build`
- Serve the `out` directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Create an issue for bugs or feature requests
- Check the documentation for common questions
- Join our community discussions

## Roadmap

- [ ] Real-time collaboration
- [ ] Advanced analytics and insights
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations
- [ ] Advanced import formats (Anki, Quizlet)
- [ ] Spaced repetition algorithm customization 