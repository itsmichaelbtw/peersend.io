<script>
import SessionHeader from "@/components/header/SessionHeader.vue";
</script>

<template>
  <SessionHeader />
  <main
    class="container mx-auto flex flex-col items-center justify-center gap-4 py-12 not-sm:py-6 md:py-24 lg:py-32"
  >
    <router-view />
  </main>
</template>
