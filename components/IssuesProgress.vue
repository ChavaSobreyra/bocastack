<template>
  <div v-if="props.issues.length > 0" class="space-y-4">
    <ClientOnly>
      <!-- Main progress card -->
      <div class="mb-4 flex items-center justify-between">
        <div class="space-y-1 pt-2">
          <h3 class="text-sm font-bold text-gray-300">{{ sprintName }}</h3>
          <p class="text-xs text-gray-200">
            {{ $dayjs(startDate).format('MMM D') }} - {{ $dayjs(endDate).format('MMM D') }}
          </p>
        </div>
        <div class="text-right">
          <div v-if="donePoints >= expectedDonePoints" class="flex items-center text-emerald-600">
            <span class="mr-1 text-xs">🚀</span>
            <span class="text-sm font-medium">On Track</span>
          </div>
          <div v-else class="flex items-center text-rose-500">
            <span class="mr-1 text-xs">⚠️</span>
            <span class="text-sm font-medium">Behind Schedule</span>
          </div>
        </div>
      </div>

      <!-- Progress bars -->
      <div class="space-y-2">
        <!-- Actual progress -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-gray-300">
            <span>Current Progress</span>
            <span>{{ Number(percentDone) + Number(percentInProgress) }}%</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div class="flex h-full">
              <div
                class="bg-emerald-500 transition-all duration-500"
                :style="`width: ${percentDone}%`"
              />
              <div
                class="bg-blue-400 transition-all duration-500"
                :style="`width: ${percentInProgress}%`"
              />
            </div>
          </div>
        </div>

        <!-- Expected progress -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-gray-300">
            <span>Expected Progress</span>
            <span>{{ expectedProgress }}%</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              class="h-full bg-orange-300 transition-all duration-500"
              :style="`width: ${expectedProgress}%`"
            />
          </div>
        </div>
      </div>

      <!-- Key metrics -->
      <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-lg border border-slate-700/50 bg-slate-700/30 p-3">
          <div class="text-xs">Story Points{{ totalPoints }}</div>

          <div class="mt-1 text-lg font-semibold">{{ totalPoints }}</div>
        </div>

        <div class="rounded-lg border border-slate-700/50 bg-slate-700/30 p-3">
          <div class="text-xs font-bold">Completed</div>
          <div class="mt-1 text-lg font-semibold text-emerald-600">
            {{ donePoints }}
            <span class="text-xs text-gray-300">({{ percentDone }}%)</span>
          </div>
        </div>

        <div class="rounded-lg border border-slate-700/50 bg-slate-700/30 p-3">
          <div class="text-xs font-bold">In Progress</div>
          <div class="mt-1 text-lg font-semibold text-blue-600">
            {{ inProgressPoints }}
            <span class="text-xs text-gray-300">({{ percentInProgress }}%)</span>
          </div>
        </div>

        <div class="rounded-lg border border-slate-700/50 bg-slate-700/30 p-3">
          <div class="text-xs font-bold">Days Remaining</div>
          <div class="mt-1 text-lg font-semibold">{{ daysRemaining }}</div>
        </div>
      </div>

      <!-- Velocity indicator -->
      <div
        class="mt-4 flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-700/30 p-3"
      >
        <div class="space-y-1">
          <div class="text-xs font-bold">Required Velocity</div>
          <div class="text-sm">
            {{ ((totalPoints - donePoints) / Math.max(daysRemaining, 1)).toFixed(1) }} points/day
          </div>
        </div>
        <div
          class="text-xs"
          :class="{
            'text-emerald-600': donePoints >= expectedDonePoints,
            'font-semibold text-rose-500': donePoints < expectedDonePoints,
          }"
        >
          {{ donePoints >= expectedDonePoints ? 'Sustainable pace' : 'Increased velocity needed' }}
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  issues: any[]
}>()

const { $dayjs } = useNuxtApp()
const sprintName = computed(() => props.issues[0]?.fields?.sprint?.name || 'Current Sprint')

const totalPoints = computed(() =>
  props.issues
    .filter(i => i.fields?.customfield_10028 != null)
    .map(i => {
      const points = Number(i.fields.customfield_10028)
      return isNaN(points) ? 0 : points
    })
    .reduce((sum, points) => sum + points, 0),
)

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
const percentDone = computed(() =>
  totalPoints.value > 0 ? ((donePoints / totalPoints.value) * 100).toFixed(0) : '0',
)

const percentInProgress = computed(() =>
  totalPoints.value > 0 ? ((inProgressPoints / totalPoints.value) * 100).toFixed(0) : '0',
)
const expectedDonePoints = Math.min(
  totalPoints.value,
  Number((((sprintLength - daysRemaining) / sprintLength) * totalPoints.value).toFixed(0)),
)
const expectedProgress = Math.min(
  100,
  Number((((sprintLength - daysRemaining) / sprintLength) * 100).toFixed(0)),
)
</script>
