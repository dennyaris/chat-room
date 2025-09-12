<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from "vue";
import dennyAvatar from "../assets/favicon/android-chrome-192x192.png";


type ChatMessage = {
  id: string;
  from: string;
  name: string;
  text: string;
  ts: number;
};

const props = defineProps<{
  userId: string;
  displayName: string;
  avatar: string;
}>();

// ---- State ----
const state = reactive({ messages: [] as ChatMessage[] });
const draft = ref("");
const listRef = ref<HTMLDivElement | null>(null);
const showEmoji = ref(false);

const emojis = ['😊', '😂', '🥰', '😎', '🤔', '👍', '❤️', '🎉'];

function addEmoji(emoji: string) {
  draft.value += emoji;
  showEmoji.value = false;
}

// ---- Channel ----
const CHANNEL = "test-chat";
let bc: BroadcastChannel | null = null;
const STORAGE_KEY = "test-chat-history";
const seen = new Set<string>();

function addMessage(msg: ChatMessage) {
  if (seen.has(msg.id)) return;
  seen.add(msg.id);
  state.messages.push(msg);
  state.messages.sort((a, b) => a.ts - b.ts);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
}

function send() {
  const text = draft.value.trim();
  if (!text) return;
  const msg: ChatMessage = {
    id: `${props.userId}-${crypto.randomUUID?.() ?? Date.now()}`,
    from: props.userId,
    name: props.displayName,
    text,
    ts: Date.now(),
  };
  addMessage(msg);
  if (bc) bc.postMessage(msg);
  localStorage.setItem("test-chat-last", JSON.stringify(msg));
  draft.value = "";
}

// ---- Lifecycle ----
onMounted(() => {
  // Load history
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr: ChatMessage[] = JSON.parse(raw);
      arr.forEach(addMessage);
    }
  } catch {}

  // BroadcastChannel
  if ("BroadcastChannel" in window) {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (e) => addMessage(e.data);
  }

  // localStorage fallback
  const onStorage = (e: StorageEvent) => {
    if (e.key === "test-chat-last" && e.newValue) {
      try {
        addMessage(JSON.parse(e.newValue));
      } catch {}
    }
  };
  window.addEventListener("storage", onStorage);

  onBeforeUnmount(() => {
    if (bc) bc.close();
    window.removeEventListener("storage", onStorage);
  });
});

// ---- Auto-scroll ----
watch(
  () => state.messages.length,
  () => {
    requestAnimationFrame(() => {
      if (listRef.value) {
        listRef.value.scrollTop = listRef.value.scrollHeight;
      }
    });
  }
);

const ordered = computed(() => [...state.messages]);
</script>

<template>
  <div class="chat-wrap">
    <!-- Header -->
    <header class="chat-header">
      <span class="channel"># general</span>
      <button class="members-btn">👥</button>
    </header>

    <!-- Messages -->
    <div class="chat-messages" ref="listRef">
      <transition-group name="msg" tag="div">
        <div
          v-for="m in ordered"
          :key="m.id"
          class="chat-msg"
          :class="{ mine: m.from === userId }"
        >
          <img
            class="avatar"
            :src="m.from === props.userId ? props.avatar : dennyAvatar"
            alt="avatar"
          />
          <div class="bubble">
            <div class="text">{{ m.text }}</div>
            <div class="time">{{ new Date(m.ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}</div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Input -->
    <form class="chat-input" @submit.prevent="send">
      <input v-model="draft" type="text" placeholder="Type a message…" />
      <div class="emoji-container">
        <button type="button" class="emoji-btn" @click="showEmoji = !showEmoji">😊</button>
        <div v-if="showEmoji" class="emoji-picker">
          <button
            v-for="emoji in emojis"
            :key="emoji"
            @click="addEmoji(emoji)"
            class="emoji-option"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
      <button type="submit" class="send-btn">➤</button>
    </form>
  </div>
</template>

<style scoped>
.chat-wrap {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  height: 600px;
  width: 700px;
  overflow: hidden;
}

/* Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
}
.channel {
  color: #374151;
}
.members-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

/* Messages */
.chat-messages {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: #d9e5f1;
}
.chat-msg {
  display: flex;
  align-items: flex-end;
  margin: 6px 0;
}
.chat-msg.mine {
  flex-direction: row-reverse;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0 8px;
}
.bubble {
  max-width: 60%;
  padding: 10px 14px;
  border-radius: 18px;
  background: #f1f5f9;
  font-size: 14px;
  color: #000;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.chat-msg.mine .bubble {
  background: #3b82f6;
  color: #fff;
}

.time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

/* Input */
.chat-input {
  display: flex;
  align-items: center;
  border-top: 1px solid #e5e7eb;
  padding: 6px;
}
.chat-input input {
  flex: 1;
  border: none;
  padding: 10px;
  border-radius: 20px;
  background: #f9fafb;
  outline: none;
  margin: 0 6px;
  color: #000;
}
.emoji-container {
  position: relative;
}
.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.emoji-option {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
}
.emoji-option:hover {
  background: #f3f4f6;
}
.emoji-btn,
.send-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 8px;
}
.send-btn {
  color: #3b82f6;
}

/* Animations */
.msg-enter-active,
.msg-leave-active {
  transition: all 0.2s ease;
}
.msg-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.msg-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.msg-move {
  transition: transform 0.2s ease;
}
</style>
