<script setup>
defineProps({
  service: {
    type: String,
    default: "discord"
  }
})
const { loggedIn, user } = useUserSession()
</script>

<template>
  <div class="px-1 py-0.5 min-w-24 border border-neutral-700 text-neutral-500 bg-neutral-900 rounded-full flex flex-row items-center w-fit"
    :class="{
      'border-purple-800 bg-purple-950 text-white': loggedIn && service === 'discord',
      'border-blue-800 bg-blue-950 text-blue-400': loggedIn && service === 'steam',
      'border-red-400 bg-white text-red-400': loggedIn && service === 'google',
    }">
      <img
          v-if="loggedIn && user[`${service}_id`]"
          class="rounded-full size-6"
          :src="user[`${service}_avatar`]"
          :alt="`${service} Avatar`"
      />
    <div v-if="loggedIn && user[`${service}_id`]" class="mx-2 relative h-8 flex items-end">
      <div class="text-xs absolute top-0 left-0"> {{service[0].toUpperCase() + service.substring(1)}} </div>
      <div class="text-md font-bold"> {{ user[`${service}_username`] }} </div>
    </div>
    <a v-else :href="`/auth/${service}`" class="mx-2 relative h-8 flex items-end">
      <div class="text-xs absolute top-0 left-0">{{service[0].toUpperCase() + service.substring(1)}}</div>
      <div class="text-md font-bold"> Login </div>
    </a>

  </div>
</template>