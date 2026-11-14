<!-- app/components/wiki/CalloutBox.vue (example component — no editor registration needed) -->
<script setup lang="ts">
const props = withDefaults(
    defineProps<{
      title?: string
      variant?: 'info' | 'warning' | 'danger'
      dismissible?: boolean
    }>(),
    {
      title: 'Note',
      variant: 'info',
      dismissible: false,
    }
)

defineOptions({
  wikiMeta: {
    label: 'Callout Box',
    description: 'Highlighted notice block with customizable severity',
  },
})
</script>

<template>
  <aside class="rounded-lg border p-4 my-3" :data-variant="props.variant">
    <strong class="block mb-1">{{ props.title }}</strong>
    <div><slot /></div>
  </aside>
</template>