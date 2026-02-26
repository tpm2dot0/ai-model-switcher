# AI Model Switcher

A Chrome extension that lets you quickly switch AI model modes on **ChatGPT**, **Claude**, and **Gemini** with popup buttons or keyboard shortcuts.

## Model Modes

| Mode | ChatGPT | Claude | Gemini |
|------|---------|--------|--------|
| **Normal** | Instant | Sonnet | Fast |
| **Pro** | Thinking | Opus | Pro |

## Keyboard Shortcuts

- `Alt+1` — Switch to Normal
- `Alt+2` — Switch to Pro

Customize shortcuts at `chrome://extensions/shortcuts`.

## Install

Download the latest `.zip` from [Releases](../../releases), then:

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the extracted folder

## Build from Source

```bash
npm install
npm run build       # Output: .output/chrome-mv3/
```

## Tech Stack

WXT, React, Tailwind CSS v4, TypeScript
