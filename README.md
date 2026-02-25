# 🔬 Flutters — 5 Minutes of Medicine

> A daily 5-minute AI-powered biology fact app for anyone who wants to casually impress medical staff with real nursing knowledge.

**[→ Live Demo](https://YOUR-SITE.netlify.app)**

---

## What it does

Every session: **3 genuinely different facts** from nursing biology, each with:

- 🧠 **Memory hook** — mnemonic or analogy to make it stick
- 💬 **Conversation starter** — the "wait, really?" moment
- 📌 **Save button** — bookmark facts you love
- 🔥 **Streak tracker** — builds a daily habit
- ⏱ **5-minute countdown ring** — keeps the session focused

**7 topic categories:** Anatomy · Pharmacology · Microbiology · Physiology · Latest Research · Memory Tricks · Surprise Me

---

## Deploy to Netlify (free, ~5 minutes)

> **Why Netlify instead of GitHub Pages?**
> The Anthropic API blocks direct browser requests (CORS). Netlify runs a tiny serverless function that proxies the request server-side — your API key never touches the browser.

### Step 1 — Push this repo to GitHub

```bash
git init
git add .
git commit -m "Initial Flutters app"
# Create a new repo on github.com called "flutters", then:
git remote add origin https://github.com/YOUR-USERNAME/flutters.git
git push -u origin main
```

### Step 2 — Connect to Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**
2. Connect GitHub → select the `flutters` repo
3. Build settings are auto-detected from `netlify.toml` — click **Deploy site**

### Step 3 — Add your Anthropic API key

1. In Netlify: **Site configuration** → **Environment variables** → **Add a variable**
2. Key: `ANTHROPIC_API_KEY`  Value: `sk-ant-your-key-here`
3. Get a key at [console.anthropic.com](https://console.anthropic.com) — new accounts get free credits
4. Click **Save** → Netlify auto-redeploys

Done. The app works, the key is invisible.

---

## Add to phone (recommended)

**iPhone/iPad:** Safari → Share → "Add to Home Screen"  
**Android:** Chrome → Menu (⋮) → "Add to Home Screen"

Installs as a full-screen app — no browser chrome.

---

## Local development

```bash
npm install -g netlify-cli
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env
netlify dev
# Open http://localhost:8888
```

---

## Tech stack

| Layer | Detail |
|-------|--------|
| Frontend | Vanilla HTML/CSS/JS — zero build step |
| API proxy | Netlify Function (`netlify/functions/chat.js`) |
| AI | Anthropic `claude-sonnet-4-20250514` |
| Persistence | Browser `localStorage` (saves + streak) |
| Hosting | Netlify free tier |

---

## Privacy

- API key lives only in Netlify's environment variables — never in the browser
- No analytics, no tracking, no ads, no server-side storage
- Saved facts and streak stored in your own browser's localStorage only

---

## License

MIT
