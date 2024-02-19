<template>
  <div>
    <select v-model="selectedTeam">
      <option :value="null">Please select one</option>
      <option v-for="team of teams" :key="team.id" :value="team.id">{{ team.name }}</option>
    </select>
    <select v-model="selectedUser">
      <option :value="null">Please select one</option>
      <option
        v-for="user of _.orderBy(users, 'displayName')"
        :key="user.accountId"
        :value="user.accountId"
      >
        {{ user.displayName }}
      </option>
    </select>
    <div v-if="isLoading" role="status">
      <svg
        aria-hidden="true"
        class="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span class="sr-only">Loading...</span>
    </div>
    <template v-if="!isLoading">
      <hr />
      <pre>{{ { meanDurationByPoints } }}</pre>
      Points Per Sprint (6 week avg): {{ pointsPerWeek }}
      <br />
      Total Done Points: {{ sumPoints }} points
      <br />
      Mean Story Size {{ meanPoints }} points
      <br />
      Mean Duration: {{ meanDuration }} days

      <hr />
      <div v-for="issue of filteredIssues" :key="issue.id">
        {{ issue.key }} points: {{ issue.fields.customfield_10028 }} duration:
        {{ getDuration(issue) }} days - days since done
        {{ getDaysSince(issue) }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash'

import { teams } from '~/config/teams.config'
import { users } from '~/config/users.config'

const { $dayjs } = useNuxtApp()

const selectedUser = ref(null)
const selectedTeam = ref(null)

const { data, isLoading } = useIssueQuery()


const filteredIssues = computed(()=> {
  if(!data.value?.issues?.length) return []

  let issues = []

  issues.push(...data.value.issues)

  if(selectedUser.value) {
    issues = issues.filter(i => i.fields.assignee?.accountId === selectedUser.value)
  }

  if(selectedTeam.value) {
    issues = issues.filter(i => i.fields.project?.key === selectedTeam.value)
  }

  return issues
})


const storyPointsArray = computed(() => {
  if (!data.value?.issues?.length) return []
  return data.value?.issues
    .filter(i => Number(i.fields.customfield_10028))
    .map(i => Number(i.fields.customfield_10028))
})

const sumPoints = computed(() => {
  if (!storyPointsArray.value) return
  return _.sum(storyPointsArray.value)
})

const meanPoints = computed(() => {
  if (!storyPointsArray.value) return
  return _.mean(storyPointsArray.value).toFixed(2)
})

const durations = computed(() => {
  if (!data.value?.issues?.length) return []
  return data.value.issues.map(i => ({
    duration: getDuration(i),
    points: i.fields.customfield_10028,
  }))
})

const meanDuration = computed(() => {
  if (!durations.value) return
  return _.mean(durations.value.map(d => Number(d.duration))).toFixed(2)
})

const meanDurationByPoints = computed(() => {
  if (!durations.value) return
  const result = _(durations.value)
    .groupBy('points')
    .mapValues(entries => _.meanBy(entries, 'duration'))
    .map((duration, points) => ({ duration, points }))

  return result
})

const pointsPerWeek = computed(() => {
  if (!data.value?.issues?.length) return
  return _.divide(
    _(data.value.issues)
      .map(getDuration)
      .sum(),
    12, // this is defined in the use issue query jql filter
  )
})

function getDuration(issue) {
  const endDate = issue.fields.statuscategorychangedate

  const startDate = issue.changelog.histories
    .map(h => ({
      date: h.created,
      items: h.items.filter(i => i.field === 'status' && i.toString === 'In Progress'),
    }))
    .filter(h => h.items.length)?.[0]?.date

  if (!startDate) return 0

  return Math.abs($dayjs(startDate).businessDaysDiff($dayjs(endDate)))
}

function getDaysSince(issue) {
  return $dayjs().diff($dayjs(issue.fields.statuscategorychangedate), 'day')
}
</script>
