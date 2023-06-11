<template>
  <div class="sticky flex flex-col sm:flex-row top-4 m-4 p-4 rounded-lg bg-blue-400">
    <dropdown placeholder="Game filter" :options="filterOptions.game" @select="applyGameFilter" />
    <dropdown placeholder="Player filter" :options="filterOptions.player" @select="applyPlayerFilter" class="ml-2" />
  </div>

  <div>
    <div v-for="(entry) of entries" :key="entry.id" class="bg-blue-300 m-4 p-4 rounded-lg">
      <div class="sm:flex justify-between">
        <h2 class="text-lg font-bold">{{ entry.game.name }}</h2>
        <div class="text-gray-700">{{ format(entry.timeCreated) }}</div>
      </div>
      <div class="grid  md:grid-cols-4 sm:grid-cols-2 justify-between">
        <div v-for="(score, i) of entry.scores" :key="score.id" class="flex">
          <div class="w-4 h-4 my-auto mx-1 rounded" :class="`bg-${score.color}-500`"> </div>
          <div><b>{{ score.player.name }} <template
                v-if="(i == 0 && entry.scores.length > 1) || score.won">👑</template></b>: {{ score.score }} {{
                  entry.game.pointsName }} </div>
        </div>
      </div>
    </div>
  </div>

  <div @click="showModal = true" class="fixed bottom-4 right-4 p-4 w-fit rounded-lg bg-blue-400 text-2xl cursor-pointer">
    <plus class="w-4" />
  </div>
  <modal v-if="showModal" title="Create new record" @close="closeModal">
    <dropdown class="my-2 w-full" placeholder="Select game" :options="filterOptions.game" @select="selectGame" />
    <div v-if="modal.game && modal.players.length < modal.game.maxPlayers" @click="addPlayer"
      class="cursor-pointer w-fit">
      <span>Add player</span>
      <plus class="inline w-4 mb-[2px]" />
    </div>
    <div v-for="(player, i) of modal.players" :key="1" class="sm:flex my-2">
      <input type="text" v-model="player.name" :placeholder="`Player ${i + 1}`"
        class="sm:mb-0 mb-2 border border-gray-300 rounded h-[36px] px-2 w-48">
      <input type="number" v-model="player.score" :placeholder="modal.game.pointsName"
        class="sm:mb-0 mb-2 border border-gray-300 rounded h-[36px] w-24 px-2 ml-2">
      <div class=" flex">
        <dropdown placeholder="color" :options="generateColorOptions(modal.game)" @select="selectColor($event, i)"
          class="w-fill sm:mb-0 ml-0 sm:ml-2 mb-2 w-full sm:w-[70px]" />
        <div @click="modal.players.splice(i, 1)"
          class="inline-block sm:mb-0 mb-2 ml-2 p-[11px] cursor-pointer rounded border border-gray-300">
          <minus class="w-3" />
        </div>
      </div>
    </div>
    <div v-if="modal.game.minPlayers == 1 && modal.players.length == 1 && modal.players[0].name">
      <input v-model="modal.won" type="checkbox" id="won"> <label for="won">Did you win?</label>
    </div>
    <div class="relative">
      <input type="button" value="Create" @click="createEntry"
        :class="{ 'text-gray-400': !modal.ready, 'cursor-auto': !modal.ready }"
        class="block cursor-pointer border border-gray-300 rounded h-[36px] ml-auto px-2 w-[114px]">
      <spinner v-if="modal.loading" class="absolute top-0 bottom-0 my-auto -right-1" />
    </div>
  </modal>
</template>

<script lang="ts">
import { GameEntry, Game, Score, Player } from '@prisma/client';
import dayjs from 'dayjs';
import { DropdownType } from '~~/components/dropdown.vue';

export default defineComponent({
  mounted() {
    this.fetch()
  },
  data() {
    return {
      filter: {
        game: '',
        player: '',
      },
      filterOptions: {
        game: [] as string[],
        player: [] as string[]
      },
      showModal: false,
      entries: [] as (GameEntry & {
        game: Game;
        scores: (Score & {
          player: Player;
        })[];
      })[],
      modal: {
        game: {} as Game,
        players: [] as { name: string, score: number, color: string }[],
        ready: false,
        loading: false,
        won: false,
      },
      games: [] as Game[]
    }
  },
  methods: {
    async fetch() {
      let games = await $fetch('/api/games', { method: 'POST', body: { filter: this.filter } })
      if (games) {
        this.filterOptions.game = games.map((game) => game.name)
        this.games = games;
      }
      let entries = await $fetch('/api/entries', { method: 'POST', body: { filter: this.filter } })
      if (entries) {
        entries.forEach(v => v.scores.sort((a, b) => b.score - a.score))
        this.entries = entries as any
      }
      let players = await $fetch<string[]>('/api/players', { method: 'POST' })
      if (players) this.filterOptions.player = players
    },
    closeModal() {
      this.showModal = false;
      this.modal.players = [];
      this.modal.game = {} as any;
      this.modal.loading = false;
      this.modal.ready = false;
      this.modal.won = false;
    },
    format(date: Date) {
      return dayjs(date).locale('bg').format('HH:mm DD/MM/YYYY')
    },
    addPlayer() {
      this.modal.players.push({ name: '', score: 0, color: '' })
    },
    generateColorOptions(game: Game) {
      let output = [];
      for (let color of game.playerColors.split(',')) {
        output.push(h('div', { id: color, class: `w-4 h-4 my-auto mx-1 rounded bg-${color}-500` }))
      }
      return output;
    },
    selectColor(value: DropdownType, i: number) {
      if (typeof value != 'string') this.modal.players[i].color = value.props?.id
    },
    selectGame(value: DropdownType) {
      if (typeof value == 'string') {
        let found = this.games.find(g => g.name == value)
        console.log(this.games[0], value);
        if (found) this.modal.game = found
      }
    },
    async createEntry() {
      this.modal.loading = true;
      let data = await $fetch('/api/create-entry', { method: 'POST', body: this.modal })
      console.log(data);
      if (data.error) { this.modal.loading = false; return alert('Error creating entry') }
      this.fetch()
      this.closeModal();
    },
    applyGameFilter(value: DropdownType) {
      if (typeof value != 'string') return;
      this.filter.game = value;
      this.fetch()
    },
    applyPlayerFilter(value: DropdownType) {
      if (typeof value != 'string') return;
      this.filter.player = value;
      this.fetch()
    }
  },
  watch: {
    'modal': {
      handler(newModal: {
        game: Game,
        players: { name: string, score: number, color: string }[],
        ready: boolean,
        loading: boolean,
        won: boolean,
      }) {
        let check = (p: { name: string, score: number, color: string }) =>
          (p.name.length >= 2 && p.score > 0 && p.color);
        do {
          if (!newModal) break
          if (!newModal.game) break;
          if (newModal.game.minPlayers > newModal.players.length) break;
          if (newModal.game.maxPlayers < newModal.players.length) break;
          if (newModal.players.filter(check).length != newModal.players.length) break;
          return newModal.ready = true;
        } while (false);
        newModal.ready = false
      },
      deep: true,
    }
  }
});
</script>

<style lang='css'>
* {
  font-family: 'Play', sans-serif;
}
</style>
