<template>
  <div>
    <ClientOnly>
      <div class="text-bold flex items-center justify-between text-sm font-medium text-gray-500">
        <div class="mb-1">Done & in progress</div>
        <div class="ml-8 text-sm font-semibold">
          <div v-if="donePoints >= expectedDonePoints" class="flex items-center text-emerald-600">
            <span class="mr-1 text-2xl">🚀</span>
            On track
          </div>
          <div v-else class="flex items-center text-red-600">
            <span class="mr-1 text-2xl">😰</span>
            Running behind
          </div>
        </div>
      </div>
      <div v-if="percentDone" class="w-full bg-gray-200 dark:bg-gray-300">
        <div
          class="inline-block bg-blue-600 py-1 px-4 text-right font-medium leading-none text-white"
          :style="`width: ${percentDone}%`"
        >
          &nbsp;
        </div>
        <div
          v-if="Number(percentDone) < 100"
          class="inline-block bg-blue-500 py-1 px-4 text-right font-medium leading-none text-white"
          :style="`width: ${percentInProgress}%`"
        >
          {{ Number(percentDone) + Number(percentInProgress) }}%
        </div>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-300">
        <div
          class="bg-teal-300 py-1 px-4 text-right font-medium leading-none text-white"
          :style="`width: ${expectedProgress}%`"
        >
          {{ expectedProgress }}%
        </div>
      </div>
      <span class="text-bold mt-1 flex justify-between text-sm font-medium text-gray-500">
        Expected
      </span>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  issues: any[]
}>()

const { $dayjs } = useNuxtApp()

const totalPoints = props.issues
  .filter(i => i.fields.customfield_10028)
  .map(i => Number(i.fields.customfield_10028))
  .reduce((partialSum, a) => partialSum + a, 0)

const donePoints = props.issues
  .filter(i => i.fields.customfield_10028 && i.fields.resolutiondate)
  .map(i => Number(i.fields.customfield_10028))
  .reduce((partialSum, a) => partialSum + a, 0)

const inProgressPoints = props.issues
  .filter(issue => ['In Progress', 'UAT'].includes(issue.fields?.status?.name))
  .map(i => Number(i.fields.customfield_10028))
  .reduce((partialSum, a) => partialSum + a, 0)

const startDate = $dayjs(props.issues[0].fields.sprint.startDate)
const endDate = $dayjs(props.issues[0].fields.sprint.endDate)
const today = $dayjs()
const effectiveEndDate = today.isAfter(endDate) ? today : endDate
const daysRemaining = Math.max(0, effectiveEndDate.businessTimeDiff(today, 'days') * -1)
const sprintLength = Math.abs(endDate.businessTimeDiff(startDate, 'days'))
const percentDone = ((donePoints / totalPoints) * 100).toFixed(0)
const percentInProgress = ((inProgressPoints / totalPoints) * 100).toFixed(0)
const expectedDonePoints = Math.min(
  totalPoints,
  Number((((sprintLength - daysRemaining) / sprintLength) * totalPoints).toFixed(0)),
)
const expectedProgress = Math.min(
  100,
  Number((((sprintLength - daysRemaining) / sprintLength) * 100).toFixed(0)),
)
</script>
