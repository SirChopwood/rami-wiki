<!-- app/pages/[...slug].vue -->
<script setup lang="ts">
import PageContentEditor from "~/components/editor/PageContentEditor.vue";
import MarkdownRenderer from "~/components/editor/MarkdownRenderer.vue";
const {
    page,
    status,
    isEditing,
    draftTitle,
    draftContent,
    isSaving,
    saveError,
    startEditing,
    cancelEditing,
    savePage,
    createPage,
    slug
} = useWikiPage()

console.log(page.value)

const colours = computed(() => {
  return page.value ? [
    `--page-bg: ${page.value.colours.background}`,
    `--page-accent: ${page.value.colours.accent}`,
    `--page-header: ${page.value.colours.header}`,
    `--page-text: ${page.value.colours.text}`
  ].join("; ") : ""
})
</script>

<template>
  <div class="absolute inset-0 bg-(--page-bg)" :style="colours"/>
  <div v-if="page" class="page page-centered p-2 z-10 text-(--page-text)" :style="colours">
      <PageContentEditor v-if="isEditing" v-model="draftContent" />
      <MarkdownRenderer v-else :source="page.content" />
  </div>
  <template v-else>
    <!--    <button @click="createNewPage" class="page page-centered p-2 hover:bg-primary text-white hover:text-black transition duration-200 rounded-lg border border-primary text-black text-2xl cursor-pointer">Click to create a new page!</button>-->
  </template>
</template>