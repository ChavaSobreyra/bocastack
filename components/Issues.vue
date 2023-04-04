<template>
  <ul role="list" class="divide-y divide-gray-200">
    <li
      v-for="issue of issues"
      :key="issue.id"
      class="grid select-none grid-flow-col py-2 px-4 hover:bg-gray-100"
      :class="{
        'bg-gray-100': props.selectedIssueId === issue.id,
        'bg-white-100': props.selectedIssueId !== issue.id,
      }"
      @click="emit('selected', issue.id)"
    >
      <p class="mt-1.5 text-xl text-gray-900">
        <span v-if="issue.fields.flagged" class="mr-2">🛑</span>
        <span v-if="issue.fields.status.name === 'UAT'" class="mr-2">👀</span>
        {{ issue.fields.summary }}
      </p>
      <div class="flex items-center justify-self-end">
        <p class="rounded-full bg-gray-100 px-2.5 py-0.5 text-center font-semibold text-gray-800">
          {{ issue.fields.customfield_10028 ? issue.fields.customfield_10028 : '-' }}
        </p>

        <img
          v-if="issue.fields.assignee"
          class="ml-5 h-10 w-10 rounded-full"
          :src="issue.fields.assignee.avatarUrls['48x48']"
          alt=""
        />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
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
      issue.fields?.resolution?.name === 'Done',
  )

  return sortIssuesByAssignee(issues)
}

function inProgressIssues() {
  if (!data.value) return

  const issues = data.value.issues.filter(issue =>
    ['In Progress', 'UAT'].includes(issue.fields?.status?.name),
  )

  return sortIssuesByAssignee(issues)
}

function notStartedIssues() {
  if (!data.value) return

  const issues = data.value.issues.filter(issue => ['To Do'].includes(issue.fields?.status?.name))

  return sortIssuesByAssignee(issues).slice(0, 10)
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
