<template>
  <ul role="list" class="space-y-2">
    <li
      v-for="issue of issues"
      :key="issue.id"
      class="group grid cursor-pointer select-none grid-flow-col rounded-lg border p-4 transition-all duration-200 hover:scale-105 hover:bg-slate-300/80 dark:border-none dark:bg-slate-700/30 dark:hover:bg-slate-700/80"
      :class="{
        'scale-105 bg-slate-300/80 dark:bg-slate-700/80': props.selectedIssueId === issue.id,
        'bg-transparent': props.selectedIssueId !== issue.id,
      }"
      @click="emit('selected', issue.id)"
    >
      <div class="items-center space-y-2 text-slate-900 dark:text-slate-100">
        <div class="flex space-x-2">
          <img class="h-6 w-6" :src="issue.fields.issuetype.iconUrl" alt="" />
          <Badge class="rounded-md bg-slate-200 py-1 px-2 text-sm dark:bg-slate-900">
            {{ issue.fields.customfield_10028 ? issue.fields.customfield_10028 : '-' }} points
          </Badge>
          <div v-if="filter === 'in-progress'" class="pt-1 text-sm">
            Open for {{ daysInStatus(issue) }} {{ daysInStatus(issue) > 1 ? 'days' : 'day' }}
          </div>
        </div>
        <div class="leading-tight">
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ issue.fields.summary }}</span>
            <span v-if="issue.fields.flagged" class="text-red-400">🚩</span>
            <span
              v-if="['UAT', 'UX Review'].includes(issue.fields.status.name)"
              class="rounded-full bg-blue-400 px-2 py-0.5 text-xs font-medium text-white dark:bg-blue-500/20 dark:text-blue-200"
            >
              UAT
            </span>
          </div>
          <span class="text-xs text-slate-800 dark:text-slate-400">
            {{ issue.fields.epic?.summary }}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-self-end">
        <img
          v-if="issue.fields.assignee"
          class="h-10 w-10 rounded-full"
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
import Badge from 'primevue/badge'

const { $dayjs } = useNuxtApp()

const props = defineProps<{
  activeSprintId: number
  filter: 'recently-completed' | 'in-progress' | 'next-up'
  selectedIssueId: number | null
}>()

const { data } = useIssuesQuery(props.activeSprintId)

type Issue = {
  id: number
  key: string
  fields: {
    flagged: boolean
    summary: string
    issuetype: {
      iconUrl: string
    }
    status: {
      name: string
    }
    assignee: {
      accountId: string
      avatarUrls: {
        '48x48': string
      }
    }
    epic: {
      summary: string
    }
    resolution: {
      name: string
    }
    resolutiondate: string
    customfield_10028: string
    statuscategorychangedate: string
  }
  rank: number
}

const issues = ref<Issue[]>([])

const emit = defineEmits(['selected'])

watch(data, setIssues, { immediate: true })

function daysInStatus(issue: Issue) {
  const changeDate = $dayjs(issue.fields.statuscategorychangedate)
  const now = $dayjs()

  // If the status changed today, return 1
  if (changeDate.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) return 1

  // If it changed yesterday but less than 24 hours ago, return 1
  const isYesterday =
    now.subtract(1, 'day').format('YYYY-MM-DD') === changeDate.format('YYYY-MM-DD')
  if (isYesterday && now.diff(changeDate, 'hours') < 24) return 1

  // Calculate business days between changeDate and now
  return Math.abs($dayjs(issue.fields.statuscategorychangedate).businessDaysDiff(now))
}

function setIssues() {
  const issuesByFilter = {
    'in-progress': inProgressIssues,
    'recently-completed': recentlyCompletedIssues,
    'next-up': notStartedIssues,
  }

  issues.value = issuesByFilter[props.filter]() || []
}

function recentlyCompletedIssues() {
  if (!data.value) return []

  const issues = data.value.issues.filter(
    (issue: Issue) =>
      wasCompletedSincePreviousWorkDay(issue.fields.resolutiondate) &&
      issue.fields?.resolution?.name === 'Done' &&
      issue.fields.status.name === 'Done',
  )

  return sortIssuesByAssignee(issues)
}

function inProgressIssues() {
  if (!data.value) return

  const issues = data.value.issues.filter((issue: Issue) =>
    ['In Progress', 'UAT', 'UX Review'].includes(issue.fields?.status?.name),
  )

  const issuesGroupedByUser = groupBy(issues, 'fields.assignee.accountId')

  return orderBy(
    issuesGroupedByUser,
    [group => Math.max(...group.map(i => daysInStatus(i))), 'desc'],
    // @ts-expect-error
    ['fields.assignee.accountId', 'asc'],
  ).flat()
}

function notStartedIssues() {
  if (!data.value) return

  const issues = data.value.issues.filter((issue: Issue) =>
    ['To Do'].includes(issue.fields?.status?.name),
  )

  return sortIssuesByAssignee(issues)
}

function sortIssuesByAssignee(issues: Issue[]) {
  const shuffledAccountIds = shuffle([
    ...new Set(issues.filter(i => !!i.fields?.assignee).map(i => i.fields.assignee.accountId)),
  ])

  shuffledAccountIds.forEach(user => {
    const userIssues = issues.filter(i => i.fields?.assignee?.accountId === user)

    userIssues.forEach((issue: Issue) => {
      issue.rank = shuffledAccountIds.indexOf(user)
    })
  })

  return sortBy(issues, ['rank'])
}

function wasCompletedSincePreviousWorkDay(date: string) {
  if (!date) return false

  const resolutionDate = $dayjs(date)
  const lastBusinessDay = $dayjs().subtractBusinessTime(1, 'day').startOf('day')

  return resolutionDate.isAfter(lastBusinessDay)
}
</script>
