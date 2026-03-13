# 🌟 DailyRoutine

> A brutally honest, AI-powered habit tracker that doesn't let you lie to yourself.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)](https://clerk.com/)
[![Drizzle](https://img.shields.io/badge/ORM-Drizzle-C5F74F?logo=drizzle)](https://orm.drizzle.team/)

## 📖 Overview

DailyRoutine is not your typical habit tracker. It's a psychological warfare platform disguised as a productivity app. Built with Next.js 16, it combines habit tracking, journaling, and AI-powered accountability to keep you honest about your goals.

### 🎯 Core Features

- **📝 Smart Journaling** - Rich text editor with AI-powered sentiment analysis
- **✅ Habit Tracking** - Daily checklists with streak tracking
- **🔥 Streak Visualization** - Beautiful heatmaps and progress charts
- **🤖 The Ruthless Accountability Coach** - AI agents that shame you into productivity
- **😊 Mood Calendar** - Emoji-based emotional tracking with insights
- **⚠️ Schrödinger's Warning** - Guilt-trip AI that makes deleting habits painful
- **📊 Insights Dashboard** - AI-generated emotional analytics

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 16 App Router]
        B[React 19 Components]
        C[TailwindCSS 4]
        D[Radix UI Primitives]
    end
    
    subgraph "Authentication"
        E[Clerk Auth]
    end
    
    subgraph "Backend Layer"
        F[Server Actions]
        G[API Routes]
    end
    
    subgraph "AI Layer"
        H[Vercel AI SDK]
        I[Groq LLM]
        J[Agent A: Auditor]
        K[Agent B: Enforcer]
    end
    
    subgraph "Database Layer"
        L[(Neon Postgres)]
        M[Drizzle ORM]
    end
    
    A --> B
    B --> C
    B --> D
    A --> E
    A --> F
    A --> G
    F --> H
    G --> H
    H --> I
    I --> J
    I --> K
    F --> M
    M --> L
    
    style I fill:#ff6b6b
    style J fill:#ffd93d
    style K fill:#6bcf7f
```

## 🧠 AI Agent System

The app features a multi-agent AI system for accountability:

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant AgentA as Agent A (Auditor)
    participant DB as Database
    participant AgentB as Agent B (Enforcer)
    participant Groq as Groq LLM
    
    User->>UI: Breaks streak (2+ days)
    UI->>AgentA: Trigger audit scan
    AgentA->>DB: Query habits & completions
    DB-->>AgentA: Return violations
    AgentA->>AgentB: Send violation report
    AgentB->>DB: Fetch journal entries
    DB-->>AgentB: Return user's journal context
    AgentB->>Groq: Generate personalized message
    Groq-->>AgentB: Sarcastic accountability message
    AgentB->>DB: Save coach alert
    DB-->>UI: Display modal
    UI-->>User: Show devastating message
```

### Agent Roles

**Agent A (The Auditor)**
- Scans database for broken streaks
- Detects habits not completed for 2+ days
- Fires violation reports to Agent B

**Agent B (The Enforcer)**
- Receives violation alerts
- Queries user's journal entries for context
- Crafts personalized, psychologically devastating messages
- Uses user's own words against them


## 🗄️ Database Schema

```mermaid
erDiagram
    HABITS ||--o{ HABIT_COMPLETIONS : has
    HABITS ||--o{ COACH_ALERTS : triggers
    USERS ||--o{ HABITS : owns
    USERS ||--o{ JOURNAL_ENTRIES : writes
    USERS ||--o{ COACH_ALERTS : receives
    
    HABITS {
        text id PK
        text user_id FK
        text name
        text description
        text color
        text icon
        text habit_type
        json target_days
        timestamp created_at
        timestamp archived_at
    }
    
    HABIT_COMPLETIONS {
        text id PK
        text habit_id FK
        text user_id FK
        date completed_date
        text note
        timestamp created_at
    }
    
    JOURNAL_ENTRIES {
        text id PK
        text user_id FK
        text content
        enum mood
        date date
        text sentiment
        json themes
        text ai_summary
        timestamp created_at
    }
    
    COACH_ALERTS {
        text id PK
        text user_id FK
        text habit_id FK
        text habit_name
        text days_missed
        text message
        text alert_type
        text read
        timestamp created_at
    }
```

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - App Router with Server Components
- **React 19** - Latest React features
- **TypeScript 5** - Type safety
- **TailwindCSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **TipTap** - Rich text editor for journaling
- **Recharts** - Data visualization

### Backend
- **Next.js Server Actions** - Type-safe server mutations
- **Drizzle ORM** - TypeScript ORM
- **Neon Postgres** - Serverless Postgres database
- **Zod** - Runtime validation

### AI & Authentication
- **Vercel AI SDK** - AI integration framework
- **Groq** - Fast LLM inference (llama-4-scout-17b)
- **Clerk** - Authentication & user management


## 📁 Project Structure

```
dailyroutine/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Authenticated app routes
│   │   ├── habits/               # Habit management
│   │   ├── journal/              # Journaling interface
│   │   ├── streaks/              # Streak visualization
│   │   ├── insights/             # AI insights dashboard
│   │   └── history/              # Activity calendar
│   ├── (auth)/                   # Auth routes (Clerk)
│   ├── actions/                  # Server Actions
│   │   ├── coach.ts              # AI coach actions
│   │   ├── completions.ts        # Habit completion logic
│   │   ├── habits.ts             # Habit CRUD
│   │   ├── insights.ts           # AI analysis
│   │   ├── journal.ts            # Journal operations
│   │   └── schrodinger.ts        # Delete warning AI
│   └── api/                      # API routes
│       ├── ai/                   # AI streaming endpoints
│       ├── completions/          # Completion API
│       ├── habits/               # Habit API
│       └── journal/              # Journal API
├── components/                   # React components
│   ├── coach/                    # AI coach UI
│   ├── habits/                   # Habit components
│   ├── journal/                  # Journal editor
│   ├── insights/                 # Analytics UI
│   ├── streaks/                  # Streak visualizations
│   ├── history/                  # Calendar components
│   └── ui/                       # Radix UI components
├── lib/                          # Utilities & core logic
│   ├── ai/                       # AI agent implementations
│   │   ├── auditor.ts            # Agent A: Streak scanner
│   │   └── enforcer.ts           # Agent B: Message generator
│   ├── db/                       # Database
│   │   ├── index.ts              # Drizzle client
│   │   └── schema.ts             # Database schema
│   └── repositories/             # Data access layer
│       ├── habits.ts
│       ├── completions.ts
│       ├── journal.ts
│       └── insights.ts
└── scripts/                      # Utility scripts
    ├── seed-broken-streak.ts     # Test data generator
    └── test-coach.ts             # AI coach tester
```

## 🎨 Key Features Deep Dive

### 1. The Ruthless Accountability Coach

```mermaid
flowchart LR
    A[User breaks streak] --> B{Agent A scans}
    B -->|Violation found| C[Agent B activates]
    C --> D[Fetch journal context]
    D --> E[Generate message via Groq]
    E --> F[Save to coach_alerts]
    F --> G[Display modal]
    G --> H{User response}
    H -->|Dismiss| I[Mark as read]
    H -->|Multiple alerts| J[Show next]
```

**How it works:**
- Runs automatically on page load (24h cooldown)
- Manual trigger via "Summon The Coach" button
- Uses journal entries to personalize guilt trips
- Three severity levels: motivate, warning, shame


### 2. Schrödinger's Warning System

When you try to delete a habit, the AI generates a personalized warning:

```mermaid
stateDiagram-v2
    [*] --> ClickArchive
    ClickArchive --> GeneratingWarning: Fetch AI warning
    GeneratingWarning --> ShowModal: Display consequences
    ShowModal --> UserDecision
    UserDecision --> Cancelled: "Keep it"
    UserDecision --> Deleted: "Delete anyway"
    Cancelled --> [*]
    Deleted --> [*]
```

**Features:**
- Glitch aesthetic UI
- AI analyzes habit history
- Calculates "catastrophic consequences"
- Guilt-trips using your own data

### 3. Mood Calendar with Emoji Tracking

Visual mood tracking with consistent layout:
- Fixed cell structure (date top-left, emoji centered)
- 6 sentiment types with unique emojis
- Hover effects and today indicator
- Integrated with journal sentiment analysis


## 🛠️ Installation & Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon recommended)
- Clerk account
- Groq API key

### Environment Variables

Create a `.env` file:

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# AI
GROQ_API_KEY="gsk_..."
```

### Installation Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd dailyroutine

# 2. Install dependencies
npm install

# 3. Set up database
npm run db:push

# 4. Run development server
npm run dev
```

Visit `http://localhost:3000`

