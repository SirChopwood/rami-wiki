<script setup lang="ts">
const demo = ["Category","Section","Page","Subpage"]
</script>

<template>
  <div id="breadcrumbs" class="w-full bg-neutral-700 h-6 border-b border-b-neutral-500">
    <div class="flex items-center justify-start gap-2 max-w-350 m-auto text-neutral-300 text-sm px-2">
      <template v-for="(item, index) of demo">
        <a href="#" class="cursor-pointer text-primary hover:text-neutral-200 hover:underline">{{ item }}</a>
        <span v-if="index < demo.length - 1" class="text-neutral-200"> > </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
</style>