<template>
  <div>
    <pre>{{ (users, teams, selectedUser, selectedTeam) }}</pre>
    <select v-model="selectedTeam">
      <option v-for="team of teams" :key="team.id" :value="team.id">{{ team.name }}</option>
    </select>
    <select v-model="selectedUser">
      <option disabled value="">Please select one</option>
      <option v-for="user of users" :key="user.accountId" :value="user.accountId">
        {{ user.displayName }}
      </option>
    </select>
    <hr />
    {{ storyPointsArray }}
    Total Done Points: {{ sumPoints }}
    <br />
    Avg Story Size {{ avgPoints }}

    <hr />
    <div v-for="issue of recentIssues" :key="issue.id">
      {{ issue.key }} duration: {{ getFirstInProgressEvent(issue) }} days - days since done
      {{ getDaysSince(issue) }}
      <pre>{{ { fields: issue } }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { teams } from '~/config/teams.config'
import { users } from '~/config/users.config'
import { sum, avg } from '~/utils/math.utils'

const { $dayjs } = useNuxtApp()

const selectedUser = ref()
const selectedTeam = ref(teams[0].id)

const { data } = useIssueQuery(selectedTeam, selectedUser)

const recentIssues = computed(() => {
  if (!data.value?.issues?.length) return []

  return data.value.issues.filter(
    i => $dayjs().diff($dayjs(i.fields.statuscategorychangedate), 'day') <= 100,
  )
})

const storyPointsArray = computed(() => {
  if (!data.value?.issues?.length) return []
  return data.value?.issues
    .filter(i => Number(i.fields.customfield_10028))
    .map(i => Number(i.fields.customfield_10028))
})

const sumPoints = computed(() => {
  return sum(...storyPointsArray.value)
})

const avgPoints = computed(() => {
  avg(...storyPointsArray.value)
})

function getFirstInProgressEvent(issue) {
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
