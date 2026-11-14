<!-- app/components/wiki/MarkdownRenderer.vue -->
<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { splitMarkdownSegments } from '~/utils/wikiMarkdown.ts'

const props = defineProps<{
  source: string
}>()

const md = new MarkdownIt({ html: false, linkify: true })
const { getComponent, coerceProps } = useWikiComponents()

const blocks = computed(() =>
    splitMarkdownSegments(props.source).map((seg) => {
      if (seg.type === 'markdown') {
        return {
          type: 'markdown' as const,
          html: md.render(seg.content),
        }
      }

      const name = seg.componentName!
      return {
        type: 'component' as const,
        name,
        definition: getComponent(name),
        boundProps: coerceProps(name, seg.rawAttrs ?? {}),
        innerSource: seg.content,
      }
    })
)
</script>

<template>
  <div class="wiki-rendered-content">
    <template v-for="(block, idx) in blocks" :key="idx">
      <div v-if="block.type === 'markdown'" v-html="block.html" class="page-content"/>

      <component
          :is="block.definition.component"
          v-else-if="block.definition"
          v-bind="block.boundProps"
      >
        <MarkdownRenderer v-if="block.innerSource.trim()" :source="block.innerSource" />
      </component>

      <div v-else class="my-2 rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
        Missing component: <code>{{ block.name }}</code>
      </div>
    </template>
  </div>
</template>