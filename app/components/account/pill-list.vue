<script setup lang="ts">
const { loggedIn, clear } = useUserSession()
</script>

<template>
  <div class="flex flex-row items-center gap-2 justify-center items-center">
    <account-pill service="discord"/>
    <account-pill service="steam"/>
    <account-pill service="google"/>
    <button v-if="loggedIn" @click="clear" class="cursor-pointer text-white text-2xl"><NuxtIcon icon="mdiLogout"/></button>
  </div>
</template>

<style scoped>

</style>