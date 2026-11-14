<script setup lang="ts">
const demo = ["Category","Section","Page","Subpage"]

const route = useRoute()
const slug = computed(() =>
    Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]
)

const { page, isEditing, isSaving, startEditing, savePage, cancelEditing } = useWikiPage()
</script>

<template>
  <div id="breadcrumbs" class="w-full bg-neutral-700 h-6 border-b border-b-neutral-500">
    <div class="flex items-center justify-between gap-2 max-w-350 m-auto text-neutral-300 text-sm px-2">
      <div class="flex items-center justify-start gap-2">
        <template v-for="(item, index) of slug">
          <a href="#" class="cursor-pointer text-primary hover:text-neutral-200 hover:underline">{{ item }}</a>
          <span v-if="index < slug.length - 1" class="text-neutral-200"> > </span>
        </template>
      </div>

      <div class="flex items-center justify-end gap-8">
        <template v-if="isEditing">
          <button type="button" @click="savePage()" class="text-primary hover:underline cursor-pointer">
            {{isSaving ? "Saving..." : "Save"}}
          </button>
          <button type="button" @click="cancelEditing()" :disabled="isSaving" class="text-primary disabled:text-neutral-400 hover:underline cursor-pointer">
            Cancel
          </button>
        </template>
        <button v-else type="button" @click="startEditing()" class="text-primary hover:underline cursor-pointer">Edit Page</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>