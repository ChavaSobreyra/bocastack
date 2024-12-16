<template>
  <div>
    <span class="light:text-slate-900 mb-2 text-xl font-bold dark:text-slate-100">
      Sprint Progress
    </span>
    <IssuesProgress v-if="data.issues" :issues="data.issues" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeSprintId: number
}>()

const { data } = useIssuesQuery(props.activeSprintId)
</script>
