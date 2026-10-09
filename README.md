# NAFSI AI Companion

NAFSI AI is a premium Moroccan AI companion experience designed for mobile-first use with a dark black-and-gold theme, Darija/Arabic/French support, voice input, and local demo-mode replies.

## Features
- Premium Moroccan black-and-gold UI
- Authentic Moroccan Darija language interactions
- Browser speech recognition (free, no paid API)
- Browser speech synthesis (soft spoken replies)
- Conversation history saved locally
- Voice selection and adjustment controls
- Installable PWA with offline support
- Demo mode clearly labeled for scripted responses

## Files
- `index.html` — App structure and UI shell
- `styles.css` — Premium visual design and mobile styling
- `app.js` — Chat logic, speech, history, settings, PWA install support
- `manifest.json` — Progressive Web App metadata
- `sw.js` — Offline caching and installation support

## Run locally
Open `index.html` directly in a browser, or serve the folder with a simple local web server:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Notes
This version uses browser-native free APIs and local scripted responses. It is intentionally labeled as a demo mode and does not rely on paid AI services.
