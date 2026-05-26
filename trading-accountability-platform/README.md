# Trading Accountability Platform

Een professionele trading accountability tool die traders helpt om hun tradingplan te definiëren, trades te journalen, en discipline te verbeteren door plan compliance te meten.

## 🎯 Features

### ✅ Geïmplementeerd in MVP

1. **Trading Plan Builder**
   - 4-stappen wizard (Bias, POI, Entry, Exit)
   - Gedetailleerde plan definitie met guided questions
   - Plan versioning systeem
   - Plan review en activatie

2. **Trade Journaling**
   - Handmatige trade invoer met alle details
   - Automatische R-berekening
   - Session tracking (London, New York, Asian)
   - Setup type en entry model categorisatie
   - Trade notes en emotional tags

3. **Dashboard & Analytics**
   - Key metrics: Win rate, Avg R, Total trades, Discipline score
   - Recent trades overview
   - Recent violations alerts
   - Performance by symbol
   - Performance by session
   - Performance by day of week
   - Plan compliance impact analysis

4. **Accountability System**
   - Discipline score (0-100)
   - Automatic violation detection
   - Violation tracking by category
   - Recent violations history
   - Improvement suggestions

5. **Authentication**
   - Email/password login
   - User roles (Trader, Student, Coach)
   - Protected routes
   - Session management

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: Custom components (Button, Input, Card)

## 📦 Installation

1. **Clone het project**
```bash
cd /projects/sandbox/main-kiro/trading-accountability-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup database**

Je hebt een PostgreSQL database nodig. Update de `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. **Run database migrations**
```bash
npx prisma migrate dev --name init
```

5. **Generate Prisma Client**
```bash
npx prisma generate
```

6. **Start development server**
```bash
npm run dev
```

7. **Open browser**
```
http://localhost:3000
```

## 📖 Usage

### First Time Setup

1. **Register een account**
   - Ga naar `/auth/register`
   - Kies je role (Trader, Student, Coach)

2. **Create Trading Plan**
   - Na login word je gevraagd een trading plan te maken
   - Vul alle 4 secties in (Bias, POI, Entry, Exit)
   - Review en activeer je plan

3. **Add Trades**
   - Ga naar Journal → Add Trade
   - Vul trade details in
   - Markeer of je je plan hebt gevolgd

4. **View Analytics**
   - Dashboard: overview van je performance
   - Analytics: deep dive in je data
   - Accountability: discipline tracking

## 🗂️ Project Structure

```
trading-accountability-platform/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   └── register/
│   │   ├── trades/
│   │   └── trading-plan/
│   ├── auth/
│   │   ├── signin/
│   │   └── register/
│   ├── dashboard/
│   ├── plan/
│   │   ├── create/
│   │   └── page.tsx
│   ├── journal/
│   │   ├── add/
│   │   └── page.tsx
│   ├── analytics/
│   ├── accountability/
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   └── dashboard/
│       └── nav.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── plan-compliance.ts
├── prisma/
│   └── schema.prisma
└── README.md
```

## 🔮 Roadmap (Toekomstige Features)

### Phase 2: Automation
- [ ] MetaTrader 4/5 integratie via EA
- [ ] Automatische trade import
- [ ] Screenshot capture
- [ ] Real-time trade notifications

### Phase 3: Intelligence
- [ ] AI-powered plan parsing
- [ ] Advanced violation detection
- [ ] Pattern recognition
- [ ] Performance predictions
- [ ] Natural language insights

### Phase 4: Education
- [ ] Coach dashboard
- [ ] Student management
- [ ] Coach-student messaging
- [ ] Approval workflows
- [ ] Bulk exports

### Phase 5: Mobile
- [ ] React Native mobile app
- [ ] Pre-trade checklist
- [ ] Push notifications
- [ ] Quick trade logging

### Phase 6: Advanced
- [ ] White-label options
- [ ] API for integrations
- [ ] TradingView integration
- [ ] Backtesting features
- [ ] Community features (optioneel)

## 🎨 Design Principles

- **Minimalistisch**: Clean, Apple-achtige UI
- **Focus**: Alleen essentiële informatie
- **Whitespace**: 40-60% van scherm leeg
- **Colors**: Deep blue primary, emerald voor wins, soft red voor losses
- **Typography**: Inter font voor leesbaarheid

## 📊 Database Schema

Belangrijkste tabellen:
- **Users**: Traders, students, coaches
- **TradingPlans**: Versioned trading plans met 4 secties
- **Trades**: Alle trade data inclusief compliance
- **RuleViolations**: Gedetecteerde plan violations
- **AccountabilityEvents**: Warnings en consequenties
- **CoachRelationships**: Coach-student links

## 🔐 Security

- Passwords gehashed met bcrypt
- JWT sessions via NextAuth
- Protected API routes
- CSRF protection
- Input validation met Zod

## 🤝 Contributing

Dit is een MVP. Feedback en contributions zijn welkom!

## 📝 License

Private project - All rights reserved

## 📧 Contact

Voor vragen of feedback, neem contact op via je trading program.

---

**Built with ❤️ for serious traders who want to master discipline**
