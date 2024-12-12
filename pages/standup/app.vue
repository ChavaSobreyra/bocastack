<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-gray-50"
  >
    <div class="mx-auto max-w-3xl space-y-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-100">Standup Dashboard</h1>
        <p class="text-slate-300">Good morning team! ☀️</p>
      </div>

      <!-- Recently Completed Section -->
      <div
        class="space-y-2 rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur"
      >
        <span class="text-xl font-bold text-slate-100">Recently completed</span>
        <Issues
          v-if="activeSprintId"
          :active-sprint-id="activeSprintId"
          filter="recently-completed"
          :selected-issue-id="selectedIssueId"
          @selected="selectIssue"
        />
      </div>

      <!-- Sprint Progress -->
      <SprintProgress
        v-if="activeSprintId"
        :active-sprint-id="activeSprintId"
        class="rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur"
      />

      <!-- In Progress Section -->
      <div>
        <div
          class="space-y-2 rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur"
        >
          <span class="text-xl font-bold text-slate-100">Work in progress</span>
          <Issues
            v-if="activeSprintId"
            :active-sprint-id="activeSprintId"
            filter="in-progress"
            :selected-issue-id="selectedIssueId"
            @selected="selectIssue"
          />
        </div>
      </div>

      <!-- Upcoming Section -->
      <div
        class="space-y-2 rounded-lg border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur"
      >
        <span class="text-xl font-bold text-slate-100">Upcoming</span>
        <Issues
          v-if="activeSprintId"
          :active-sprint-id="activeSprintId"
          filter="next-up"
          :selected-issue-id="selectedIssueId"
          @selected="selectIssue"
        />
      </div>
    </div>
    <!-- Modals and Panels -->
    <EndStandupModal v-if="showModal" @close-modal="showModal = false" />
    <IssuesPanel
      v-if="selectedIssueId"
      :selected-issue-id="selectedIssueId"
      @close-panel="selectedIssueId = null"
    />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Standup',
})

const route = useRoute()
const boardId = computed(() => Number(route.query.boardId) || 2)

const { data: sprint } = useSprintQuery(boardId.value)

const activeSprintId = computed(() => sprint.value?.values?.[0]?.id)

const showModal = ref(false)
const selectedIssueId = ref<number | null>(null)

function selectIssue(issue: any) {
  selectedIssueId.value = issue
}

onMounted(() =>
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') showModal.value = !showModal.value
  }),
)
</script>
