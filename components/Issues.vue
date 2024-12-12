<template>
  <ul role="list" class="space-y-2 divide-y divide-slate-700/30">
    <li
      v-for="issue of issues"
      :key="issue.id"
      class="group grid cursor-pointer select-none grid-flow-col rounded-lg bg-slate-700/30 p-4 transition-all duration-200 hover:scale-105 hover:bg-slate-700/80"
      :class="{
        'scale-105 bg-slate-700/80': props.selectedIssueId === issue.id,
        'bg-transparent': props.selectedIssueId !== issue.id,
      }"
      @click="emit('selected', issue.id)"
    >
      <div class="items-center space-y-2 text-slate-100">
        <div class="flex space-x-2">
          <img class="h-6 w-6" :src="issue.fields.issuetype.iconUrl" alt="" />
          <Badge class="rounded-md bg-slate-900 py-1 px-2 text-sm">
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
              class="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-200"
            >
              UAT
            </span>
          </div>
          <span class="text-xs text-slate-400">
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
  return Math.abs($dayjs().businessDaysDiff($dayjs(issue.fields.statuscategorychangedate))) + 1
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
      wasCompletedOnPreviousWorkDay(issue.fields.resolutiondate) &&
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

function wasCompletedOnPreviousWorkDay(date: string) {
  if (!date) return
  const lastBusinessDay = $dayjs().subtractBusinessTime(1, 'day').set('hour', 10).set('minute', 30)
  const resolutionDate = $dayjs(date)

  return lastBusinessDay.isBefore(resolutionDate)
}
</script>
