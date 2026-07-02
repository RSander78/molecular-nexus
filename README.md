# Molecular Nexus – Chemie-Analyseplattform

Professionelle KI-gestützte Plattform für Molekularanalyse, Eigenschaftsvorhersage und chemische Berechnungen. Entwickelt für Unternehmenskunden der chemischen Industrie.

## Technologie-Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Datenbank:** PostgreSQL (Neon) + Prisma ORM
- **Authentifizierung:** NextAuth.js (E-Mail/Passwort)
- **KI-Modell:** Mistral AI
- **Hosting:** Vercel

## Module

| Modul | Beschreibung |
|-------|-------------|
| Chemie-Assistent | KI-Chat für chemische Fragen (Streaming) |
| Molekülsuche | PubChem-Datenbank (Name/SMILES/Formel) |
| ADMET-Vorhersage | Absorption, Toxizität, Bioverfügbarkeit |
| Reaktionsvorhersage | Produkte und Mechanismen |
| QSAR/QSPR | Struktur-Aktivitäts-Beziehungen |
| Berechnungen | Molmasse, pH, Stöchiometrie, Verdünnung |
| Quantenchemie | Orbitale, Energieniveaus, Spektroskopie |
| Analyse-Historie | Nutzerbezogene Speicherung |
| Team-Verwaltung | Mandantenfähig, Rollen, geteilte Analysen |

## Deployment auf Vercel

### 1. Neon-Datenbank erstellen (kostenlos)

1. Gehe auf [neon.tech](https://neon.tech) und erstelle ein kostenloses Konto
2. Erstelle ein neues Projekt (Region: Frankfurt empfohlen)
3. Kopiere die Connection-String (DATABASE_URL)

### 2. Projekt auf Vercel deployen

```bash
# Repository auf GitHub pushen
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DEIN-USER/molecular-nexus.git
git push -u origin main
```

1. Gehe auf [vercel.com](https://vercel.com) und importiere das Repository
2. Setze folgende **Environment Variables** in den Vercel-Projekteinstellungen:

| Variable | Wert |
|----------|------|
| `DATABASE_URL` | Deine Neon-Connection-String |
| `MISTRAL_API_KEY` | Dein Mistral API-Key |
| `NEXTAUTH_SECRET` | Ein zufälliger String (z.B. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Deine Vercel-URL (z.B. `https://molecular-nexus.vercel.app`) |

3. Klicke auf "Deploy"

### 3. Datenbank-Schema erstellen

Nach dem ersten Deploy:

```bash
npx prisma db push
```

Oder in der Vercel-Konsole unter "Functions" → "Run Command".

## Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# .env.local erstellen (siehe .env.example)
cp .env.example .env.local

# Datenbank-Schema pushen
npx prisma db push

# Entwicklungsserver starten
npm run dev
```

Die Anwendung läuft dann auf `http://localhost:3000`.

## EU-Konformität

- DSGVO-konforme Datenverarbeitung (Daten in EU-Region bei Neon Frankfurt)
- REACH/CLP-Kennzeichnungen bei Stoffdaten (GHS-Symbole, H/P-Sätze)
- Nutzerbezogene Datenspeicherung mit Löschmöglichkeit

## Lizenz

Proprietär – Alle Rechte vorbehalten.
