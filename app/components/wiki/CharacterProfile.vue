<!-- app/components/wiki/CalloutBox.vue (example component — no editor registration needed) -->
<script setup lang="ts">
const props = withDefaults(
    defineProps<{
      name: string,
      age?: string,
      image: string,
    }>(),
    {
      name: 'Character Name',
      age: '',
      image: '/placeholder.png'
    }
)

defineOptions({
  wikiMeta: {
    label: 'Character Profile',
    description: 'A profile sidebar that gives key details about a character.',
  },
})
</script>

<template>
  <table class="relative block-inline max-w-full mx-auto sm:m-0 sm:float-right w-full sm:max-w-60 lg:max-w-80 sm:border-2 border-(--page-accent) bg-(--page-bg) overflow-hidden rounded">
    <thead class="w-full">
      <tr>
        <th colspan="2" class="bg-(--page-accent) text-center font-bold text-(--page-header) text-xl lg:text-3xl px-2 py-1">
          {{props.name}}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b-neutral-600 border-b-2">
        <th colspan="2">
          <img class="h-full w-fit mx-auto sm:m-0 sm:w-full sm:h-auto max-h-60 sm:max-h-80 object-cover" :src="props.image" :alt="props.name"/>
        </th>
      </tr>
      <tr>
        <th>Name</th>
        <td>{{props.name}}</td>
      </tr>
      <tr>
        <th>Age</th>
        <td>{{props.age}}</td>
      </tr>
      <tr>
        <th>Age</th>
        <td>{{props.age}}</td>
      </tr>
      <tr>
        <th>Age</th>
        <td>{{props.age}}</td>
      </tr>
      <tr>
        <td colspan="2">
          <slot />
        </td>
      </tr>
    </tbody>
  </table>
</template>