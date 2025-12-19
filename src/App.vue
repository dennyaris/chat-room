<script setup lang="ts">
import { onMounted, ref } from "vue";
import ChatWindow from "./components/ChatWindow.vue";
import dennyAvatar from "./assets/favicon/android-chrome-192x192.png";
import putriAvatar from "./assets/putri-avatar.png";

const user = ref<{ id: string; name: string; avatar: string } | null>(null);

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const u = params.get("user");

  if (u === "denny") {
    user.value = {
      id: "denny",
      name: "Denny",
      avatar: dennyAvatar,
    };
  } else if (u === "putri") {
    user.value = {
      id: "putri",
      name: "Putri",
      avatar: putriAvatar,
    };
  } else {
    // no param → show hint
    user.value = null;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <ChatWindow
      v-if="user"
      :user-id="user.id"
      :display-name="user.name"
      :avatar="user.avatar"
    />
    <div v-else class="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full mx-4">
      <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
        👋
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Welcome</h2>
      <p class="text-gray-600 mb-6">Choose a user identity to start demoing the chat interface.</p>
      <div class="space-y-3">
        <a href="?user=denny" class="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30">
          Continue as Denny
        </a>
        <a href="?user=putri" class="block w-full py-3 px-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-all">
          Continue as Putri
        </a>
      </div>
    </div>
  </div>
</template>
