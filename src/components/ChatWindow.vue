<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { ArrowLeft, Image, Mic, Send, Plus, MoreVertical, X } from 'lucide-vue-next';
import dennyAvatar from "../assets/favicon/android-chrome-192x192.png";
import putriAvatar from "../assets/putri-avatar.png";

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
const showImageModal = ref(false);
const modalImageSrc = ref("");

// ---- Channel ----
const CHANNEL = "test-chat";
let bc: BroadcastChannel | null = null;
const STORAGE_KEY = "test-chat-history";
const seen = new Set<string>();

function addMessage(msg: ChatMessage) {
  // Defensive: validate message structure
  if (!msg || !msg.id || !msg.from || !msg.text || typeof msg.ts !== 'number') return;
  if (seen.has(msg.id)) return;
  seen.add(msg.id);
  state.messages.push(msg);
  state.messages.sort((a, b) => a.ts - b.ts);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
  } catch (e) {
    console.error('Failed to save messages:', e);
  }
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
  try {
    localStorage.setItem("test-chat-last", JSON.stringify(msg));
  } catch (e) {
    console.error('Failed to broadcast message:', e);
  }
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
  } catch (e) {
    console.error('Failed to load message history:', e);
  }

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
      } catch (e) {
        console.error('Failed to parse storage event:', e);
      }
    }
  };
  window.addEventListener("storage", onStorage);

  // Initial scroll to bottom
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight;
    }
  });

  onBeforeUnmount(() => {
    if (bc) bc.close();
    window.removeEventListener("storage", onStorage);
  });
});

// ---- Auto-scroll ----
watch(
  () => state.messages.length,
  () => {
    nextTick(() => {
      if (listRef.value) {
        listRef.value.scrollTop = listRef.value.scrollHeight;
      }
    });
  }
);

const ordered = computed(() => [...state.messages]);

const formatTime = (ts: number) => {
  if (!ts || typeof ts !== 'number') return '';
  try {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch (e) {
    return '';
  }
};

// Partner info
const partnerName = computed(() => {
  if (props.userId === 'denny') return 'Putri';
  if (props.userId === 'putri') return 'Denny';
  return 'Denny';
});

const partnerAvatar = computed(() => {
  if (props.userId === 'denny') return putriAvatar;
  if (props.userId === 'putri') return dennyAvatar;
  return dennyAvatar;
});

// Navigate to home
const goHome = () => {
  window.location.href = "/";
};

// Image zoom modal
const openImageModal = (imageSrc: string) => {
  modalImageSrc.value = imageSrc;
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  modalImageSrc.value = "";
};

// Get avatar by user ID
const getAvatarById = (userId: string) => {
  if (userId === 'denny') return dennyAvatar;
  if (userId === 'putri') return putriAvatar;
  return `https://i.pravatar.cc/150?u=${userId}`;
};
</script>

<template>
  <div class="chat-container">
    <!-- Clean Minimal Header -->
    <header class="chat-header">
      <div class="flex items-center gap-3 flex-1">
        <button class="icon-btn" @click="goHome">
          <ArrowLeft :size="22" />
        </button>
        <img 
          :src="partnerAvatar" 
          class="avatar-clean cursor-pointer hover:opacity-80 transition-opacity" 
          :alt="partnerName"
          @click="openImageModal(partnerAvatar)"
        />
        <div class="flex-1">
          <h1 class="header-title">{{ partnerName }}</h1>
          <p class="header-subtitle">Online</p>
        </div>
      </div>
      
      <button class="icon-btn">
        <MoreVertical :size="22" />
      </button>
    </header>

    <!-- Messages Area with Gradient Background -->
    <div class="messages-area" ref="listRef">
      <!-- Date Separator -->
      <div class="date-separator">
        <span class="date-badge">Today</span>
      </div>

      <div
        v-for="m in ordered"
        :key="m.id"
        class="message-row"
        :class="m.from === props.userId ? 'message-row-sent' : 'message-row-received'"
      >
        <!-- Avatar for received messages -->
        <img 
          v-if="m.from !== props.userId"
          :src="getAvatarById(m.from)"
          class="avatar-sm cursor-pointer hover:opacity-80 transition-opacity"
          :alt="m.name"
          @click="openImageModal(getAvatarById(m.from))"
        />

        <div 
          class="message-bubble"
          :class="m.from === props.userId ? 'message-sent' : 'message-received'"
        >
          <p class="message-text">{{ m.text }}</p>
          <span class="message-time">{{ formatTime(m.ts) }}</span>
        </div>
      </div>
    </div>

    <!-- Input Area with Floating Design -->
    <form @submit.prevent="send" class="input-area">
      <button type="button" class="input-icon-btn">
        <Plus :size="22" />
      </button>
      
      <div class="input-wrapper">
        <input 
          v-model="draft" 
          type="text" 
          placeholder="Type a message..." 
          class="message-input"
        />
        <button type="button" class="input-icon-btn-secondary">
          <Mic :size="18" />
        </button>
      </div>

      <button 
        v-if="draft.trim()"
        type="submit" 
        class="send-btn"
      >
        <Send :size="20" />
      </button>
      <button 
        v-else
        type="button" 
        class="input-icon-btn"
      >
        <Image :size="22" />
      </button>
    </form>

    <!-- Image Zoom Modal -->
    <Transition name="modal">
      <div 
        v-if="showImageModal" 
        class="image-modal-backdrop"
        @click="closeImageModal"
      >
        <div class="image-modal-content" @click.stop>
          <button class="modal-close-btn" @click="closeImageModal">
            <X :size="24" />
          </button>
          <img 
            :src="modalImageSrc" 
            class="modal-image"
            alt="Zoomed avatar"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Container */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile */
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  overflow: hidden;
  position: relative;
}

@media (min-width: 640px) {
  .chat-container {
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05);
    height: 800px;
  }
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: 0;
}

.header-subtitle {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 400;
  margin: 0;
  line-height: 1.2;
}

/* Avatars */
.avatar-clean {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-sm {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  object-fit: cover;
  align-self: flex-end;
  margin-bottom: 0.25rem;
  margin-right: 0.5rem;
  border: 1.5px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}



/* Buttons */
.icon-btn {
  padding: 0.5rem;
  color: #1e293b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-btn:hover {
  color: #0f172a;
}

/* Messages Area */
.messages-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem 1rem;
  padding-bottom: 6rem; /* Space for fixed input on mobile */
  background: linear-gradient(to bottom, #fafbfc 0%, #f8fafc 50%, #f1f5f9 100%);
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

@media (min-width: 640px) {
  .messages-area {
    padding-bottom: 1.5rem;
  }
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Date Separator */
.date-separator {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.date-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #fff;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Message Rows */
.message-row {
  display: flex;
  width: 100%;
  margin-bottom: 0.875rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-row-sent {
  justify-content: flex-end;
}

.message-row-received {
  justify-content: flex-start;
}

/* Message Bubbles */
.message-bubble {
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  position: relative;
  font-size: 0.9375rem;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.message-sent {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-received {
  background: white;
  color: #1e293b;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-text {
  margin: 0;
  font-weight: 400;
}

.message-time {
  display: block;
  font-size: 0.6875rem;
  margin-top: 0.375rem;
  text-align: right;
  opacity: 0.7;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* Input Area */
.input-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  z-index: 20;
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .input-area {
    position: relative;
    bottom: auto;
    left: auto;
    right: auto;
    padding: 1rem;
    gap: 0.75rem;
  }
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 20px;
  padding: 0.5rem 0.875rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  min-height: 2.5rem;
}

.input-wrapper:focus-within {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #0f172a;
  font-weight: 400;
}

.message-input::placeholder {
  color: #94a3b8;
}

.input-icon-btn {
  padding: 0.4rem;
  color: #3b82f6;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.input-icon-btn:hover {
  background: #eff6ff;
  color: #2563eb;
}

.input-icon-btn-secondary {
  padding: 0.3rem;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.input-icon-btn-secondary:hover {
  color: #3b82f6;
}

.send-btn {
  padding: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.send-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.send-btn:active {
  transform: scale(0.95);
}

/* Image Modal */
.image-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: modalZoom 0.3s ease;
}

@keyframes modalZoom {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-image {
  width: auto;
  height: auto;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  object-fit: contain;
}

.modal-close-btn {
  position: absolute;
  top: -3rem;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  border: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.cursor-pointer {
  cursor: pointer;
}
</style>

