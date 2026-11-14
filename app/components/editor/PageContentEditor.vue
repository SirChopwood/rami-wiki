<!-- app/components/editor/PageContentEditor.vue -->
<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { WikiComponentNode } from './extensions/WikiComponentNode'
import { markdownToTipTapHtml, tipTapDocToMarkdown } from '~/utils/wikiMarkdown'

const modelValue = defineModel<string>({ default: '' })
const { components } = useWikiComponents()
const selectedComponentToInsert = ref('')

const editor = useEditor({
  content: markdownToTipTapHtml(modelValue.value),
  extensions: [StarterKit, WikiComponentNode],
  onUpdate: ({ editor: instance }) => {
    modelValue.value = tipTapDocToMarkdown(instance.state.doc)
  },
})

watch(modelValue, (nextMd) => {
  if (!editor.value) return
  const currentMd = tipTapDocToMarkdown(editor.value.state.doc)
  if (nextMd !== currentMd) {
    editor.value.commands.setContent(markdownToTipTapHtml(nextMd), false)
  }
})

function insertSelectedComponent() {
  const def = components.value.find((c) => c.kebabName === selectedComponentToInsert.value)
  if (!def || !editor.value) return

  editor.value
      .chain()
      .focus()
      .insertWikiComponent({
        componentName: def.kebabName,
        props: { ...def.defaultProps },
      })
      .run()

  selectedComponentToInsert.value = ''
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div v-if="editor" class="rounded-xl border border-neutral-300 dark:border-neutral-700">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2 border-b p-2 dark:border-neutral-700">
      <button
          type="button"
          class="rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          :class="{ 'bg-neutral-200 dark:bg-neutral-700': editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()"
      >
        Bold
      </button>
      <button
          type="button"
          class="rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          :class="{ 'bg-neutral-200 dark:bg-neutral-700': editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()"
      >
        Italic
      </button>
      <button
          type="button"
          class="rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          :class="{ 'bg-neutral-200 dark:bg-neutral-700': editor.isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>

      <!-- Auto-populated Component Picker -->
      <div class="ml-auto flex items-center gap-1.5">
        <select
            v-model="selectedComponentToInsert"
            class="rounded border bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-900"
            @change="insertSelectedComponent"
        >
          <option value="" disabled>Insert component...</option>
          <option
              v-for="comp in components"
              :key="comp.kebabName"
              :value="comp.kebabName"
          >
            {{ comp.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- TipTap Canvas -->
    <EditorContent :editor="editor" class="prose dark:prose-invert max-w-none p-4" />
  </div>
</template>