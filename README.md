# DC's Ideation Station

A personal infinite-canvas whiteboard app with GitHub-backed persistence.

## Features

- **Infinite canvas** — zoom, pan, and arrange freely
- **Sticky notes** — add, drag, resize, and style with rich text (bold, italic, font family, font size, text colour)
- **Arrows** — add, move, rotate, and resize directional arrows
- **Snap to grid** — toggle 20px grid snapping for notes (drag and resize)
- **Arrow angle snap** — hold Ctrl while rotating an arrow to snap in 10° increments
- **GitHub sync** — autosaves board state to a JSON file in a GitHub repo
- **PDF export** — exports the current viewport as a PDF

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Zustand (state management)
- Tiptap (rich text editor)
- react-rnd (note resizing)
- html-to-image + jsPDF (PDF export)
- @octokit/rest (GitHub sync)

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## GitHub Sync Setup

1. Create a GitHub repository to store your board data
2. Generate a Personal Access Token (PAT) with `repo` scope at GitHub → Settings → Developer Settings → Personal Access Tokens
3. Open the settings panel (gear icon), enter your PAT, username, repo name, and file path, then click **Save Settings**

Each device needs its own PAT pointing to the same repo. The board loads on startup and autosaves every 30 seconds.
