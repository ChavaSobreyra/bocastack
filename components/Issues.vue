<template>
  <ul role="list" class="divide-y divide-gray-200">
    <li
      v-for="issue of issues"
      :key="issue.id"
      class="grid select-none grid-flow-col py-3 px-2 hover:rounded-md hover:bg-gray-100"
      :class="{
        'rounded-md bg-gray-100': props.selectedIssueId === issue.id,
        'bg-white-100': props.selectedIssueId !== issue.id,
      }"
      @click="emit('selected', issue.id)"
    >
      <p class="flex items-center text-gray-900">
        <span v-if="filter === 'in-progress'" class="inline-block w-10">
          <div class="w-4 text-center">
            <div class="text-[9px] leading-none">DAY</div>
            <div class="text-base leading-none">{{ daysInStatus(issue) }}</div>
          </div>
        </span>

        <img class="text-xs" :src="issue.fields.issuetype.iconUrl" alt="" />
        <span class="pl-2">{{ issue.fields.summary }}</span>

        <span v-if="issue.fields.flagged" class="ml-1 mr-2">🚩</span>
        <span v-if="['UAT', 'UX Review'].includes(issue.fields.status.name)" class="ml-1 mr-2">
          <span
            class="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-2 py-1 text-center text-xs font-semibold text-white"
          >
            UAT
          </span>
        </span>
      </p>
      <div class="flex items-center justify-self-end">
        <p
          class="rounded-md bg-gray-100 px-2 py-0.5 text-center text-sm font-semibold text-gray-800"
        >
          {{ issue.fields.customfield_10028 ? issue.fields.customfield_10028 : '-' }}
        </p>

        <img
          v-if="issue.fields.assignee"
          class="ml-5 h-8 w-8 rounded-full"
          :src="issue.fields.assignee.avatarUrls['48x48']"
          alt=""
        />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'
import shuffle from 'lodash/shuffle.js'
import sortBy from 'lodash/sortBy.js'

const { $dayjs } = useNuxtApp()

const props = defineProps<{
  activeSprintId: number
  filter: 'recently-completed' | 'in-progress' | 'next-up'
  selectedIssueId: number | null
}>()

const { data } = useIssuesQuery(props.activeSprintId)

const issues = ref([])

const emit = defineEmits(['selected'])

watch(data, setIssues, { immediate: true })

function daysInStatus(issue) {
  return Math.abs($dayjs().businessDaysDiff($dayjs(issue.fields.statuscategorychangedate))) + 1
}

function setIssues() {
  const issuesByFilter = {
    'in-progress': inProgressIssues,
    'recently-completed': recentlyCompletedIssues,
    'next-up': notStartedIssues,
  }

  issues.value = issuesByFilter[props.filter]()
}

function recentlyCompletedIssues() {
  if (!data.value) return

  const issues = data.value.issues.filter(
    issue =>
      wasCompletedOnPreviousWorkDay(issue.fields.resolutiondate) &&
      issue.fields?.resolution?.name === 'Done' &&
      issue.fields.status.name === 'Done',
  )

  return sortIssuesByAssignee(issues)
}

function inProgressIssues() {
  if (!data.value) return

  const issues = data.value.issues.filter(issue =>
    ['In Progress', 'UAT', 'UX Review'].includes(issue.fields?.status?.name),
  )

  const issuesGroupedByUser = groupBy(issues, 'fields.assignee.accountId')

  return orderBy(
    issuesGroupedByUser,
    group => Math.max(...group.map(i => daysInStatus(i))),
    'desc',
  ).flat()
}

function notStartedIssues() {
  if (!data.value) return

  const issues = data.value.issues.filter(issue => ['To Do'].includes(issue.fields?.status?.name))

  return sortIssuesByAssignee(issues)
}

function sortIssuesByAssignee(issues) {
  const shuffledAccountIds = shuffle([
    ...new Set(issues.filter(i => !!i.fields?.assignee).map(i => i.fields.assignee.accountId)),
  ])

  shuffledAccountIds.forEach(user => {
    const userIssues = issues.filter(i => i.fields?.assignee?.accountId === user)

    userIssues.forEach(issue => {
      issue.rank = shuffledAccountIds.indexOf(user)
    })
  })

  return sortBy(issues, ['rank'])
}

function wasCompletedOnPreviousWorkDay(date) {
  if (!date) return
  // @ts-ignore
  const lastBusinessDay = $dayjs().subtractBusinessTime(1, 'day').set('hour', 10).set('minute', 30)
  const resolutionDate = $dayjs(date)

  return lastBusinessDay.isBefore(resolutionDate)
}
</script>
