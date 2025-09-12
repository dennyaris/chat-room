# Project: Real-time Chat (Vue 3 + TypeScript, No WebSockets)

## Goal
Build a real-time chat app where two users (Denny & Aris) can chat with each other by opening the app in two browser windows/tabs. The chat should update instantly in both windows **without using WebSockets**.

## Requirements
1. **Framework**: Vue 3 + TypeScript + Vite.
2. **Real-time sync**:  
   - Use `BroadcastChannel` API for cross-tab/window messaging.  
   - Add a `localStorage` fallback (`storage` event) for browsers without `BroadcastChannel`.
3. **UI Design**:
   - Slack/Discord-like chat interface.
   - Channel header (`# general`).
   - Messages aligned left/right depending on sender.
   - Avatars for each user.
   - Input bar with text field, emoji button, and send button.
4. **Animation**:
   - Use `<transition-group>` to animate messages.
   - When new messages appear, old ones **slide upward**.
5. **Single Window Mode**:
   - Only show **one chat window** per page.
   - Use URL param `?user=denny` or `?user=aris` to decide the user identity.
   - Example:  
     - `http://localhost:5173/?user=denny` → Alice’s chat window  
     - `http://localhost:5173/?user=aris` → Bob’s chat window
6. **Avatars**:
   - Generate avatars online (e.g., DiceBear or Pravatar) based on the `user` param so each user always has a consistent avatar.

## File Structure on chat-broadcast
src/
    components/
        ChatWindow.vue
    App.vue
    main.ts

## Core Logic
- **App.vue**: reads `?user` param and loads a single `ChatWindow` for that user.
- **ChatWindow.vue**: handles UI, sending/receiving messages, animation, and auto-scroll.
- **main.ts**: mounts the app.

## Example Avatar URLs
- Denny → `https://i.pravatar.cc/150?u=denny`
- Aris → `https://i.pravatar.cc/150?u=aris`

## Testing
1. Run `npm run dev`.
2. Open two tabs:
   - Tab 1 → `http://localhost:5173/?user=denny`
   - Tab 2 → `http://localhost:5173/?user=aris`
3. Type a message in one tab → it instantly appears in the other tab.
4. Watch older messages slide upward smoothly as new ones arrive.
