<script setup lang="ts">
const links = [
  {
    label: "GitHub",
    value: "https://github.com/SirChopwood/rami-wiki"
  },
  {
    label: "Nuxt",
    value: "https://nuxt.com/"
  }
]
</script>

<template>
  <footer id="footer" class="w-full bg-neutral-700 h-6 border-t border-t-neutral-500">
    <div class="flex items-center justify-between gap-2 page-centered text-neutral-300 text-sm px-2">
      <div class="flex items-center justify-start gap-4">
        <span>Made by <a class="cursor-pointer text-primary hover:text-neutral-200 hover:underline" href="https://github.com/SirChopwood">Ramiris</a></span>
      </div>
      <div class="flex items-center justify-end gap-4">
          <a v-for="(item, index) of links"
             :href="item.value"
             class="cursor-pointer text-primary hover:text-neutral-200 hover:underline">
            {{ item.label }}
          </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>

</style>