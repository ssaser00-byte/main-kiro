# Quick Start Guide - Trading Accountability Platform

## 🚀 Snel aan de slag in 5 minuten

### Stap 1: Database Setup

Je hebt een PostgreSQL database nodig. Opties:

**Optie A: Lokale PostgreSQL**
```bash
# macOS (via Homebrew)
brew install postgresql
brew services start postgresql
createdb trading_accountability

# Linux
sudo apt-get install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb trading_accountability
```

**Optie B: Cloud Database (Aanbevolen voor beginners)**
1. Ga naar [Supabase.com](https://supabase.com) of [Neon.tech](https://neon.tech)
2. Maak gratis account en nieuwe database
3. Kopieer de connection string

### Stap 2: Environment Variables

Update `.env` file:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genereer-een-random-string-hier"
```

**Genereer NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Stap 3: Database Migratie

```bash
npm run setup
```

Dit doet:
- Prisma client genereren
- Database schema aanmaken
- Tabellen creëren

### Stap 4: Start de App

```bash
npm run dev
```

Open browser: `http://localhost:3000`

### Stap 5: Eerste Gebruik

1. **Registreer** → Maak account aan
2. **Trading Plan** → Vul je plan in (4 stappen)
3. **Add Trade** → Journal je eerste trade
4. **Dashboard** → Zie je metrics

## ✅ Checklist

- [ ] PostgreSQL database geïnstalleerd
- [ ] `.env` file geconfigureerd
- [ ] `npm install` gedaan
- [ ] `npm run setup` gedaan
- [ ] `npm run dev` draait
- [ ] Account aangemaakt
- [ ] Trading plan geactiveerd
- [ ] Eerste trade toegevoegd

## 🆘 Troubleshooting

### "Database connection failed"
- Check DATABASE_URL in `.env`
- Zorg dat PostgreSQL draait
- Test connectie: `npx prisma db pull`

### "NEXTAUTH_SECRET not found"
- Zorg dat `.env` bestaat
- Herstart development server

### "Module not found"
- Run: `npm install`
- Run: `npx prisma generate`

### Port 3000 already in use
- Stop andere app op port 3000
- Of gebruik andere port: `npm run dev -- -p 3001`

## 🎯 Volgende Stappen

Na de MVP:
1. Voeg meer trades toe
2. Bekijk Analytics
3. Check Accountability dashboard
4. Update je Trading Plan
5. Review je discipline score

## 📚 Meer Info

- Volledige docs: zie `README.md`
- Database schema: zie `prisma/schema.prisma`
- API docs: zie `app/api/` folders

---

Veel succes met je trading journey! 📈
