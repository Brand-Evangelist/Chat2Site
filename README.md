# Chat2Site — by Brand Evangelist

AI-powered website + product builder built on Claude. Users answer 5 questions and get a custom Lovable.dev site in minutes.

## Stack
- **Frontend:** Next.js (React)
- **AI:** Claude claude-sonnet-4-20250514 via Anthropic API (streaming)
- **Output:** Lovable Build URL
- **Hosting:** Vercel

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up your API key
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY from console.anthropic.com

# 3. Run locally
npm run dev
# Open http://localhost:3000
```

---

## Deploy to Vercel

### Option A: Vercel CLI
```bash
npm install -g vercel
vercel
# Follow prompts — it will auto-detect Next.js
```

### Option B: Vercel Dashboard
1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Add environment variable: `ANTHROPIC_API_KEY` = your key
4. Deploy

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |

---

## File Structure

```
chat2site/
├── pages/
│   ├── index.js          # Main chat UI
│   └── api/
│       └── chat.js       # Claude API route (streaming)
├── lib/
│   └── systemPrompt.js   # Chat2Site instructions for Claude
├── styles/
│   └── Home.module.css   # All styles
├── .env.example
└── package.json
```

---

## How It Works

1. User loads the page → Claude auto-greets them as Chat2Site
2. User answers 5 questions through conversation
3. Claude generates a Lovable-compatible prompt + encodes it as a URL
4. The UI detects the special ```lovable-url``` block and renders a CTA button
5. User clicks → lands in Lovable with their site ready to build

---

## Customization

- **System prompt:** Edit `lib/systemPrompt.js` to adjust Chat2Site's personality, questions, or output format
- **Branding:** Update colors in `styles/Home.module.css` (CSS variables at the top)
- **Model:** Change `claude-sonnet-4-20250514` in `pages/api/chat.js` if needed

---

Built with ❤️ by [Brand Evangelist](https://brandevangelist.io)
