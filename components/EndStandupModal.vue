<template>
  <div v-if="!loading" class="container mx-auto">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none"
    >
      <div class="relative my-6 mx-auto max-w-3xl">
        <div
          class="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none"
        >
          <div class="flex justify-center border-b border-solid border-slate-200 p-5">
            <img src="../assets/img/theEnd.gif" class="h-48 w-96 object-cover" />
          </div>
          <div class="relative flex-auto p-6">
            <p class="my-4 text-lg leading-relaxed text-slate-500">
              {{ joke.setup }}
            </p>
            <p v-if="showPunchline" class="my-4 text-lg leading-relaxed text-slate-500">
              {{ joke.delivery }}
            </p>
          </div>

          <div
            class="flex items-center justify-end rounded-b border-t border-solid border-slate-200 p-6"
          >
            <button
              class="mr-1 mb-1 rounded border border-solid border-blue-500 bg-transparent px-6 py-3 text-sm font-bold uppercase text-blue-500 outline-none transition-all duration-150 ease-linear hover:bg-blue-500 hover:text-white focus:outline-none active:bg-blue-600"
              type="button"
              @click="revealPunchline()"
            >
              Reveal Punchline 🥊
            </button>
            <button
              class="mr-1 mb-1 rounded border border-solid border-red-500 bg-transparent px-6 py-3 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear hover:bg-red-500 hover:text-white focus:outline-none active:bg-red-600"
              type="button"
              @click.prevent="close()"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed inset-0 z-40 bg-black opacity-25"></div>
  </div>
  <div v-else>Loading the funnies...</div>
</template>

<script setup lang="ts">
const showPunchline = ref(false)
const joke = ref(null)
const loading = ref(true)
const emit = defineEmits(['closeModal'])

async function getJoke() {
  try {
    const response = await fetch(
      'https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Pun?blacklistFlags=nsfw,religious,political,racist,sexist,explicit',
    )
    joke.value = await response.json()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function revealPunchline() {
  showPunchline.value = !showPunchline.value
}

function close() {
  joke.value = null
  showPunchline.value = false
  emit('closeModal')
}

getJoke()
</script>
