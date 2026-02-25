# 🔬 Flutters — 5 Minutes of Medicine

> A daily 5-minute AI-powered biology fact app for anyone who wants to casually impress medical staff with real nursing knowledge.

**[→ Live Demo](https://YOUR-USERNAME.github.io/flutters)**

![Flutters screenshot](https://via.placeholder.com/800x450/0a0f1a/00e5c3?text=Flutters+App)

---

## What it does

Every session you get **3 genuinely different facts** from nursing biology — each with:

- 🧠 **Memory hook** — mnemonic or analogy to make it stick
- 💬 **Conversation starter** — the "wait, really?" moment
- 📌 **Save button** — bookmark facts you love
- 🔥 **Streak tracker** — builds a daily habit
- ⏱ **5-minute countdown ring** — keeps the session focused

**7 topic categories:** Anatomy · Pharmacology · Microbiology · Physiology · Latest Research · Memory Tricks · Surprise Me

---

## Setup

### 1. Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up (new accounts get free credits)
3. Create an API key under **API Keys**

### 2. Deploy to GitHub Pages

```bash
# Clone this repo
git clone https://github.com/YOUR-USERNAME/flutters.git
cd flutters

# Push to GitHub, then enable Pages:
# Settings → Pages → Source: Deploy from branch → main → / (root)
```

Your site will be live at `https://YOUR-USERNAME.github.io/flutters`

### 3. First use

Open the site → enter your API key when prompted → hit **Start Session**.

Your key is stored only in your **browser's localStorage** — it never goes anywhere except directly to Anthropic's API.

---

## Add to your phone (recommended)

**iPhone/iPad:** Safari → Share button → "Add to Home Screen"  
**Android:** Chrome → Menu (⋮) → "Add to Home Screen"

It installs as a full-screen app — no browser UI.

---

## How the variety works

The app maintains a **subcategory queue** shuffled per session. 16 distinct subject pools cover:

- Nervous System, Cardiovascular, Respiratory, Renal
- Endocrine, Immunology, Hematology, GI
- Pharmacodynamics, Pharmacokinetics
- Microbiology, Cell Biology, Genetics, Musculoskeletal
- Latest Research (2023–2025), Nursing Mnemonics

Each fact is generated with a full history of **what was already shown this session** passed as context, so the AI can't repeat topics.

---

## Tech stack

| Layer | Detail |
|-------|--------|
| Frontend | Vanilla HTML/CSS/JS — zero build step |
| AI | Anthropic `claude-sonnet-4-20250514` via API |
| Storage | Browser `localStorage` (key + saves + streak) |
| Hosting | GitHub Pages (static) |

---

## Local development

No build step needed. Just open `index.html` in a browser — or use a local server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## Privacy

- Your API key is stored only in your browser's localStorage
- No analytics, no tracking, no ads
- No server — everything runs client-side

---

## License

MIT — use it, fork it, improve it.
