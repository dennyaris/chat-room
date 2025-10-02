# Chat Room - Real-time Chat Application

A simple real-time chat application built with Vue 3, TypeScript, and Vite. This application allows two users (Denny & Aris) to communicate in real-time through two browser windows without using WebSockets.

## Technologies Used

- Vue 3 + TypeScript + Vite
- BroadcastChannel API for cross-tab/window messaging
- localStorage as fallback for browsers that don't support BroadcastChannel

## Features

- Slack/Discord-like chat interface
- Channel header (`# general`)
- Messages aligned left/right depending on sender
- Avatars for each user
- Input bar with text field, emoji button, and send button
- Message animations using `<transition-group>`
- Single window mode with URL parameter for user identity

## How to Run the Application

1. Clone this repository:
   ```bash
   git clone https://github.com/dennyaris/chat-room.git
   cd chat-room
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open two browser tabs:
   - Tab 1: `http://localhost:5173/?user=denny`
   - Tab 2: `http://localhost:5173/?user=aris`

5. Send a message in one tab and see it appear instantly in the other tab.

## How to Contribute

1. Fork this repository
2. Create a new feature branch:
   ```bash
   git checkout -b feature/feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: add new feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/feature-name
   ```
5. Create a Pull Request

## Project Structure

```
src/
  ├── components/
  │   └── ChatWindow.vue  # Main chat component
  ├── App.vue             # Root application component
  └── main.ts             # Application entry point
```

## Build for Production

```bash
npm run build
# or
pnpm build
```

## Preview Production Build

```bash
npm run preview
# or
pnpm preview
```

---

Created by [Denny Aris](https://dennyarissetiawan.com)
