<template>
  <div class="relative">
    <button @click="show = !show" @contextmenu.prevent @click.right="clear" ref="dropdown" type="button"
      class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 outline-none">
      <template v-if="typeof selection == 'string' && selection">{{ selection }}</template>
      <component v-else-if="selection" :is="selection" />
      <template v-else-if="typeof placeholder == 'string'"> {{ placeholder }} </template>
      <component v-else :is="placeholder!" />
      <DownArrow ref="icon" class="text-gray-900" />
    </button>
    <div v-if="show"
      class="absolute left-0 z-10 mt-1 w-fit origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-300"
      role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
      <div class="py-1" role="none">
        <a v-for="value of options" @click="select(value)" href="#" class="text-gray-700 block px-4 py-2 text-sm">
          <span v-if="typeof value == 'string'"> {{ value }} </span>
          <component v-else :is="value" />
        </a>
        <div v-if="options?.length == 0" class="text-gray-700 block px-4 py-2 text-sm">
          Nothing found
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'nuxt/dist/app/compat/capi';

export type DropdownType = string | ReturnType<typeof h>

export default defineComponent({
  props: { placeholder: {} as PropType<DropdownType>, options: Object as PropType<string[] | ReturnType<typeof h>[]> },
  emits: { select: (_: DropdownType) => true },
  mounted() {
    document.addEventListener("click", this.hide);
  },
  unmounted() {
    document.removeEventListener("click", this.hide);
  },
  data() {
    return {
      show: false,
      hidden: true,
      selection: '' as DropdownType,
    };
  },
  methods: {
    select(value: string) {
      this.$emit('select', value);
      this.selection = value;
    },
    hide(ev: MouseEvent) {
      if (!(this.$refs.dropdown as any).contains(ev.target)) this.show = false
    },
    clear() {
      this.selection = '';
      this.$emit('select', '')
    }
  },
});
</script>
