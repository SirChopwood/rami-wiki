<!-- app/components/editor/WikiComponentView.vue -->
<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)
const { getComponent } = useWikiComponents()

const definition = computed(() =>
    getComponent(props.node.attrs.componentName)
)

const componentProps = computed<Record<string, unknown>>(
    () => props.node.attrs.props ?? {}
)

function updateProp(key: string, value: unknown) {
  props.updateAttributes({
    props: {
      ...componentProps.value,
      [key]: value,
    },
  })
}

function handleJsonInput(key: string, raw: string) {
  try {
    updateProp(key, JSON.parse(raw))
  } catch {
    // Wait until valid JSON is entered before updating live prop
  }
}
</script>

<template>
  <NodeViewWrapper
      class="wiki-node-wrapper my-4 rounded-lg border transition-colors"
      :class="selected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-neutral-300 dark:border-neutral-700'"
  >
    <!-- Dynamic Component Toolbar -->
    <div
        contenteditable="false"
        class="flex flex-wrap items-center justify-between gap-2 border-b bg-neutral-100/80 px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800/80"
    >
      <span class="font-mono font-semibold text-neutral-700 dark:text-neutral-200">
        &lt;{{ definition?.pascalName ?? node.attrs.componentName }} /&gt;
      </span>

      <div v-if="definition?.propSchema.length" class="flex flex-wrap items-center gap-3">
        <label
            v-for="field in definition.propSchema"
            :key="field.name"
            class="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300"
        >
          <span>{{ field.name }}:</span>

          <input
              v-if="field.type === 'boolean'"
              type="checkbox"
              :checked="Boolean(componentProps[field.name])"
              @change="updateProp(field.name, ($event.target as HTMLInputElement).checked)"
          />

          <input
              v-else-if="field.type === 'number'"
              type="number"
              class="w-20 rounded border bg-white px-1.5 py-0.5 dark:border-neutral-600 dark:bg-neutral-900"
              :value="Number(componentProps[field.name] ?? 0)"
              @input="updateProp(field.name, Number(($event.target as HTMLInputElement).value))"
          />

          <input
              v-else-if="field.type === 'json'"
              type="text"
              class="w-36 rounded border bg-white px-1.5 py-0.5 font-mono dark:border-neutral-600 dark:bg-neutral-900"
              :value="JSON.stringify(componentProps[field.name] ?? {})"
              @change="handleJsonInput(field.name, ($event.target as HTMLInputElement).value)"
          />

          <input
              v-else
              type="text"
              class="w-28 rounded border bg-white px-1.5 py-0.5 dark:border-neutral-600 dark:bg-neutral-900"
              :value="String(componentProps[field.name] ?? '')"
              @input="updateProp(field.name, ($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>

      <button
          type="button"
          class="rounded px-1.5 py-0.5 text-red-600 hover:bg-red-500/10"
          title="Remove component"
          @click="deleteNode()"
      >
        Remove
      </button>
    </div>

    <!-- Live Rendered Vue Component + Editable Slot -->
    <div class="p-3">
      <component
          :is="definition.component"
          v-if="definition"
          v-bind="componentProps"
      >
        <NodeViewContent class="wiki-node-slot min-h-[1.5rem]" />
      </component>

      <div v-else class="rounded bg-amber-500/10 p-2 text-sm text-amber-600">
        Unknown component: <code>{{ node.attrs.componentName }}</code>
      </div>
    </div>
  </NodeViewWrapper>
</template>