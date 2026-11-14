<script setup lang="ts">
const { loggedIn, clear } = useUserSession()
</script>

<template>
  <div class="flex flex-row items-center gap-2 justify-center items-center">
    <account-pill service="discord"/>
    <account-pill service="steam"/>
    <button v-if="loggedIn" @click="clear" class="pl-1.5 border border-neutral-700 text-neutral-500 bg-neutral-900 rounded-full flex flex-row items-center h-8 aspect-square hover:border-neutral-200 hover:text-neutral-200 transition-colors duration-200 cursor-pointer">
      <NuxtIcon icon="mdiLogout"/>
    </button>
  </div>
</template>

<style scoped>

</style>