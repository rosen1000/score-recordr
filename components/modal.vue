<template>
  <div @click.self="$emit('close')" class="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-70 z-40">
    <div class="absolute top-0 bottom-0 left-0 right-0 bg-white rounded-2xl p-4 h-fit w-fit m-auto">
      <h2 class="text-xl font-bold mr-8"> {{ title }} </h2>
      <cross class="w-8 p-2 absolute top-3 right-3 cursor-pointer" @click.self="$emit('close')" />
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  props: { title: String },
  emits: ['close'],
});
</script>
