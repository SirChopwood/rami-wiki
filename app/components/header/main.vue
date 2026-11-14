<script setup lang="ts">
const header = useTemplateRef("header")

onMounted(() => {
  window.onscroll = function() {
    if (document.body.scrollTop > 75 || document.documentElement.scrollTop > 75) {
      header.value!.setAttribute("data-scrolled", "true")
    } else {
      header.value!.removeAttribute("data-scrolled")
    }}
})
</script>

<template>
  <header id="header" ref="header" class="sticky top-0 z-10 w-full group flex flex-col transition-all duration-200 bg-neutral-800">
    <div class="border-b border-b-neutral-500 w-full">
      <div class="page-centered flex flex-col md:flex-row gap-2 items-center justify-between h-full p-2 h-20 group-data-scrolled:h-12">
        <div class="flex gap-2 min-w-64">
          <img class="h-18 min-w-18 group-data-scrolled:h-10 group-data-scrolled:min-w-10">
          <div class="flex flex-col justify-center">
            <h1 class="text-3xl group-data-scrolled:text-xl text-primary">Rami Wiki</h1>
            <div class="text-md group-data-scrolled:hidden text-neutral-200">Enter a Subtitle here!</div>
          </div>
        </div>
        <header-searchbar/>
        <account-pill-list/>
      </div>
    </div>
    <header-breadcrumbs/>
  </header>

</template>

<style scoped>

</style>