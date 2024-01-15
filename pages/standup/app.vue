<template>
  <div class="bg-gray-50">
    <div>
      <div class="blob absolute top-0 left-4 rounded-full bg-blue-300 opacity-50 blur-sm" />

      <div
        class="blob animation-delay-2 absolute top-80 right-1 rounded-full bg-green-300 opacity-50 blur-sm"
      />

      <div
        class="blob animation-delay-4 absolute bottom-32 left-72 rounded-full bg-green-300 opacity-50 blur-sm"
      />

      <div class="blob a absolute -bottom-4 right-36 rounded-full bg-blue-300 opacity-50 blur-sm" />

      <div class="container mx-auto max-w-3xl pb-16">
        <Nav />
        <section class="pt-8">
          <div class="overflow-hidden rounded bg-white px-8 py-11">
            <div class="grid grid-cols-2 items-center px-1 pb-8 font-bold text-gray-900">
              <span class="justify-self-start text-lg">Recently completed</span>
              <span class="justify-self-end text-4xl">🎉 🥳</span>
            </div>
            <Issues
              v-if="activeSprintId"
              :active-sprint-id="activeSprintId"
              filter="recently-completed"
              :selected-issue-id="selectedIssueId"
              @selected="selectIssue"
            />
          </div>
        </section>

        <section class="pt-8">
          <SprintProgress v-if="activeSprintId" :active-sprint-id="activeSprintId" class="mb-8" />
          <div class="overflow-hidden rounded bg-white px-8 py-11">
            <div class="grid grid-cols-2 items-center px-1 pb-8 font-bold text-gray-900">
              <span class="justify-self-start text-lg">Work in progress</span>
              <span class="justify-self-end text-4xl">🚧</span>
            </div>
            <Issues
              v-if="activeSprintId"
              :active-sprint-id="activeSprintId"
              filter="in-progress"
              :selected-issue-id="selectedIssueId"
              @selected="selectIssue"
            />
          </div>
        </section>

        <section class="pt-8">
          <div class="overflow-hidden rounded bg-white px-8 py-11">
            <div class="grid grid-cols-2 items-center px-1 pb-8 font-bold text-gray-900">
              <span class="justify-self-start text-lg">Upcoming</span>
              <span class="justify-self-end text-4xl">⏰</span>
            </div>
            <Issues
              v-if="activeSprintId"
              :active-sprint-id="activeSprintId"
              filter="next-up"
              :selected-issue-id="selectedIssueId"
              @selected="selectIssue"
            />
          </div>
        </section>
        <EndStandupModal v-if="showModal" @close-modal="showModal = false" />
        <IssuesPanel
          v-if="selectedIssueId"
          :selected-issue-id="selectedIssueId"
          @close-panel="selectedIssueId = null"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Standup',
})

const route = useRoute()

const { data: sprint } = useSprintQuery(route.query?.boardId || 2)

const activeSprintId = computed(() => {
  return sprint.value?.values?.[0]?.id
})

const showModal = ref(false)
const selectedIssueId = ref<number | null>(null)

function selectIssue(issue: any) {
  return (selectedIssueId.value = issue)
}

onMounted(() =>
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') showModal.value = !showModal.value
  }),
)
</script>
<style>
@keyframes moveBlob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  50% {
    transform: translate(80px, 200px) scale(2.5);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.blob {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  animation: moveBlob 20s infinite;
}

.animation-delay-2 {
  animation-delay: 2s;
}
.animation-delay-4 {
  animation-delay: 4s;
}
</style>
