<script setup lang="ts">

</script>

<template>
  <div class="min-h-full h-fit flex flex-col">
    <header-main/>
    <main class="relative min-h-full h-fit grow bg-neutral-900 flex flex-col justify-start py-4">
      <slot/>
    </main>
    <footer-main/>
  </div>
</template>

<style scoped>

</style>