<template>
  <div>
    <h3 class="mt-12 mb-2 font-bold text-gray-900"">Sprint Progress</h3>
    <IssuesProgress v-if="data.issues" :issues="data.issues " />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeSprintId: number
}>()


const { data } = useIssuesQuery(props.activeSprintId)

</script>
