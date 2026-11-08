<script setup lang="ts">
const { loggedIn, clear } = useUserSession()
</script>

<template>
  <div class="flex flex-row items-center gap-2 justify-center items-center">
    <account-pill service="discord"/>
    <account-pill service="steam"/>
    <button v-if="loggedIn" @click="clear" class="cursor-pointer text-neutral-200 text-2xl hover:text-white"><NuxtIcon icon="mdiLogout"/></button>
  </div>
</template>

<style scoped>

</style>