<template>
  <div>
    <ClientOnly>
      <div class="text-bold flex items-center justify-between text-sm font-medium text-gray-500">
        <div class="mb-1">Burndown Chart</div>
      </div>

      <!-- Chart container with fixed height -->
      <div class="h-64 w-full">
        <svg class="h-full w-full" viewBox="0 0 800 300">
          <!-- Grid lines -->
          <g>
            <line
              v-for="(line, index) in gridLines"
              :key="`vline-${index}`"
              :x1="padding"
              :x2="chartWidth - padding"
              :y1="line"
              :y2="line"
              stroke="#e5e7eb"
              stroke-width="1"
            />
          </g>

          <!-- Dates on x-axis -->
          <g>
            <text
              v-for="(date, index) in chartData"
              :key="`date-${index}`"
              :x="getXPosition(index)"
              :y="chartHeight - padding + 20"
              text-anchor="middle"
              class="fill-gray-500 text-xs"
            >
              {{ $dayjs(date.date).format('MMM D') }}
            </text>
          </g>

          <!-- Points on y-axis -->
          <g>
            <text
              v-for="(value, index) in yAxisLabels"
              :key="`points-${index}`"
              :x="padding - 10"
              :y="getYPosition(value) + 5"
              text-anchor="end"
              class="fill-gray-500 text-xs"
            >
              {{ value }}
            </text>
          </g>

          <!-- Ideal burndown line -->
          <path
            :d="getIdealLine"
            stroke="#94a3b8"
            stroke-width="2"
            fill="none"
            stroke-dasharray="5,5"
          />

          <!-- Actual remaining line -->
          <path :d="getActualLine" stroke="#ef4444" stroke-width="2" fill="none" />

          <!-- Completed line -->
          <path :d="getCompletedLine" stroke="#22c55e" stroke-width="2" fill="none" />
        </svg>
      </div>

      <!-- Legend -->
      <div class="mt-4 flex justify-center space-x-6 text-sm">
        <div class="flex items-center">
          <div class="mr-2 h-3 w-3 bg-red-500"></div>
          <span>Remaining</span>
        </div>
        <div class="flex items-center">
          <div class="mr-2 h-3 w-3 bg-green-500"></div>
          <span>Completed</span>
        </div>
        <div class="flex items-center">
          <div class="mr-2 h-3 w-3 border border-gray-400 bg-white"></div>
          <span>Ideal</span>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { Dayjs } from 'dayjs'

const props = defineProps<{
  issues: any[]
}>()

const { $dayjs } = useNuxtApp()

// Chart dimensions
const padding = 40
const chartWidth = 800
const chartHeight = 300

// Calculate total points
const totalPoints = computed(() =>
  props.issues
    .filter(i => i.fields.customfield_10028)
    .reduce((sum, i) => sum + Number(i.fields.customfield_10028), 0),
)

// Get sprint dates
const startDate = computed(() => $dayjs(props.issues[0].fields.sprint.startDate))
const endDate = computed(() => $dayjs(props.issues[0].fields.sprint.endDate))
const today = computed(() => $dayjs())
const effectiveEndDate = computed(() =>
  today.value.isAfter(endDate.value) ? today.value : endDate.value,
)

// Generate dates array for the sprint
const getDatesInRange = () => {
  const dates = []
  let currentDate = startDate.value

  while (
    currentDate.isBefore(effectiveEndDate.value) ||
    currentDate.isSame(effectiveEndDate.value, 'day')
  ) {
    if (currentDate.isBusinessDay()) dates.push(currentDate.format('YYYY-MM-DD'))

    currentDate = currentDate.add(1, 'day')
  }
  return dates
}

// Calculate points completed by date
const getCompletedPointsByDate = (date: string | number | Dayjs | Date | null | undefined) => {
  return props.issues
    .filter(i => {
      const resolutionDate = i.fields.resolutiondate
      return resolutionDate && $dayjs(resolutionDate).isBefore($dayjs(date).endOf('day'))
    })
    .reduce((sum, i) => sum + Number(i.fields.customfield_10028 || 0), 0)
}

// Generate chart data
const chartData = computed(() => {
  const dates = getDatesInRange()
  return dates.map(date => {
    const completed = getCompletedPointsByDate(date)
    return {
      date,
      remaining: totalPoints.value - completed,
      completed,
      ideal: totalPoints.value - (totalPoints.value / (dates.length - 1)) * dates.indexOf(date),
    }
  })
})

// Calculate positions for chart elements
const getXPosition = (index: number) => {
  const width = chartWidth - padding * 2
  const step = width / (chartData.value.length - 1)
  return padding + step * index
}

const getYPosition = (value: number) => {
  const height = chartHeight - padding * 2
  const scale = height / totalPoints.value
  return padding + (height - value * scale)
}

// Generate line paths
const getIdealLine = computed(() => {
  return chartData.value
    .map((point, index) => {
      const x = getXPosition(index)
      const y = getYPosition(point.ideal)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
})

const getActualLine = computed(() => {
  return chartData.value
    .map((point, index) => {
      const x = getXPosition(index)
      const y = getYPosition(point.remaining)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
})

const getCompletedLine = computed(() => {
  return chartData.value
    .map((point, index) => {
      const x = getXPosition(index)
      const y = getYPosition(point.completed)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
})

// Calculate grid lines and axis labels
const gridLines = computed(() => {
  const lines = []
  const height = chartHeight - padding * 2
  const step = height / 4
  for (let i = 0; i <= 4; i++) lines.push(padding + step * i)

  return lines
})

const yAxisLabels = computed(() => {
  const labels = []
  const step = totalPoints.value / 4
  for (let i = 0; i <= 4; i++) labels.push(Math.round(totalPoints.value - step * i))

  return labels
})
</script>
