<script setup lang="ts">
import { onMounted, ref } from "vue";
import ChatWindow from "./components/ChatWindow.vue";
import dennyAvatar from "./assets/favicon/android-chrome-192x192.png";
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
  } else if (u === "aris") {
    user.value = {
      id: "aris",
      name: "Aris",
      avatar: "https://i.pravatar.cc/150?u=aris",
    };
  } else {
    // no param → show hint
    user.value = null;
  }
});
</script>

<template>
  <div class="app">
    <ChatWindow
      v-if="user"
      :user-id="user.id"
      :display-name="user.name"
      :avatar="user.avatar"
    />
    <div v-else class="hint">
      <h2>Choose a user</h2>
      <p>Open this page with <code>?user=denny</code> or <code>?user=aris</code></p>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #1f2937;
}
.hint {
  background: white;
  padding: 20px;
  border-radius: 8px;
  font-family: sans-serif;
  text-align: center;
  color: #1f2937;
}
code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
