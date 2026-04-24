# 🌱 AgroSense — Smart Agriculture Platform

AI-powered crop scanning, weather intelligence, and soil monitoring for modern farmers.

## Features

| Feature | Description |
|---|---|
| 🔬 Crop Scanner | Upload a photo → AI diagnoses diseases, pests & deficiencies |
| 🌤 Weather | Live weather + farming advice for any city |
| 💧 Moisture | Soil sensor dashboard with irrigation alerts |
| 🧑‍🌾 Expert AI | Conversational farming assistant |

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Add your API key
Create a `.env.local` file in the root:
```
ANTHROPIC_API_KEY=your_key_here
```
Get your key at → https://console.anthropic.com/

### 3. Run the dev server
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel

### Option A — Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login

# Deploy from the project folder
vercel

# Follow the prompts, then add your env variable:
vercel env add ANTHROPIC_API_KEY
# Paste your key when prompted, select all environments

# Redeploy to apply the env variable
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push this project to a GitHub repository:
```bash
git init
git add .
git commit -m "Initial AgroSense commit"
git remote add origin https://github.com/YOUR_USERNAME/agrosense.git
git push -u origin main
```

2. Go to https://vercel.com/new
3. Click **"Import Git Repository"** → select your repo
4. In **"Environment Variables"** section, add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...your key...`
5. Click **Deploy** ✅

Every time you push to `main`, Vercel auto-deploys.

---

## Project Structure

```
agrosense/
├── app/
│   ├── layout.js          # Root layout + fonts
│   ├── globals.css        # Global styles + CSS variables
│   ├── page.js            # Home page
│   ├── dashboard/
│   │   └── page.js        # Dashboard
│   ├── scan/
│   │   └── page.js        # Crop scanner (client)
│   ├── weather/
│   │   └── page.js        # Weather page (client)
│   ├── moisture/
│   │   └── page.js        # Soil moisture page
│   ├── chat/
│   │   └── page.js        # AI chat (client)
│   └── api/
│       ├── scan/route.js  # POST /api/scan  — vision analysis
│       ├── weather/route.js # POST /api/weather — web search
│       └── chat/route.js  # POST /api/chat  — conversation
├── components/
│   └── Navbar.js          # Sticky navigation
├── .env.example           # Copy to .env.local
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Security Note

The API key is stored as a server-side environment variable and is **never exposed to the browser**. All Anthropic API calls go through `/api/` routes (Next.js Route Handlers).
