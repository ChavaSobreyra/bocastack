<template>
  <div>
    <ClientOnly>
      <div class="mb-4 flex justify-between">
        <div>
          <span class="mr-2 text-3xl font-semibold">👷🏼‍♀️ 🏗</span>
          <span class="text-2xl font-semibold">Work In Progress</span>
        </div>
      </div>

      <div class="flex justify-between">
        <div>Completed</div>
        <div class="ml-8 font-semibold uppercase">
          <div v-if="progress.donePoints > progress.expectedDonePoints" class="text-green-600">
            <span class="mr-2">🚀</span>
            Ahead of Schedule
          </div>
          <div v-else-if="progress.percentProgress === progress.expectedProgress">On Track</div>
          <div v-else class="text-red-600">
            <span class="mr-1">😰</span>
            Running Behind
          </div>
        </div>
      </div>
      <div v-if="progress.percentProgress" class="w-full bg-gray-200 dark:bg-gray-300">
        <div
          class="bg-indigo-600 py-1 px-4 text-right font-medium leading-none text-blue-100"
          :style="`width: ${progress.percentProgress}%`"
        >
          {{ progress.percentProgress }}%
        </div>
      </div>
      <div v-if="progress.expectedProgress" class="w-full bg-gray-200 dark:bg-gray-300">
        <div
          class="bg-blue-600 py-1 px-4 text-right font-medium leading-none text-blue-100"
          :style="`width: ${progress.expectedProgress}%`"
        >
          {{ progress.expectedProgress }}%
        </div>
      </div>
      Expected
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeSprintId: number
}>()

const { $dayjs } = useNuxtApp()

const { data } = useIssuesQuery(props.activeSprintId)

const progress = computed(() => {
  const issues = data.value?.issues

  if (!issues) return {}

  const totalPoints = issues
    .filter(i => i.fields.customfield_10028)
    .map(i => Number(i.fields.customfield_10028))
    .reduce((partialSum, a) => partialSum + a, 0)
  const donePoints = issues
    .filter(i => i.fields.customfield_10028 && i.fields.resolutiondate)
    .map(i => Number(i.fields.customfield_10028))
    .reduce((partialSum, a) => partialSum + a, 0)

  const startDate = $dayjs(issues[0].fields.sprint.startDate)
  const endDate = $dayjs(issues[0].fields.sprint.endDate)
  const daysRemaining = endDate.businessTimeDiff($dayjs(), 'days')
  const sprintLength = endDate.businessTimeDiff(startDate, 'days')
  const percentProgress = ((donePoints / totalPoints) * 100).toFixed(0)
  const expectedDonePoints = (
    ((sprintLength - daysRemaining) / sprintLength) *
    totalPoints
  ).toFixed(0)
  const expectedProgress = (((sprintLength - daysRemaining) / sprintLength) * 100).toFixed(0)

  // @ts-ignore
  return {
    daysRemaining,
    sprintLength,
    totalPoints,
    donePoints,
    expectedDonePoints,
    percentProgress,
    expectedProgress,
  }
})
</script>
