<template>
  <div v-if="data.fields" class="side-panel text-gray-900">
    <div class="flex justify-end">
      <button @click="$emit('close-panel')">
        <XCircleIcon class="h-6 w-6 text-slate-500" />
      </button>
    </div>

    <div class="pt-2">
      <img
        v-if="data.fields.assignee"
        class="h-10 w-10 rounded-full"
        :src="data.fields.assignee.avatarUrls['48x48']"
        alt=""
      />
    </div>

    <div class="flex py-6">
      <img :src="data.fields.issuetype.iconUrl" alt="" />
      <span class="pl-2 font-semibold">{{ data.fields.summary }}</span>
    </div>

    <div class="flex items-center justify-self-start border-b-2 border-gray-200 pb-6">
      <span class="pr-2 font-semibold">Points:</span>
      <div
        class="rounded-md bg-gray-100 px-2 py-0.5 text-center text-sm font-semibold text-gray-800"
      >
        {{ data.fields.customfield_10028 ? data.fields.customfield_10028 : '-' }}
      </div>
      <span class="pl-2 pr-2 font-semibold">Epic:</span>
      <div
        class="rounded-md px-2 py-0.5 text-center text-sm font-semibold text-white"
        :class="{
          'bg-blue-500': data.fields.parent.fields.summary !== 'Bug',
          'bg-red-500': data.fields.parent.fields.summary === 'Bug',
        }"
      >
        {{ data.fields.parent.fields.summary }}
      </div>
    </div>

    <div
      id="jira-html"
      class="break-words pt-4"
      v-html="replaceAttachments(data.renderedFields.description, data.renderedFields.attachment)"
    />
  </div>
</template>

<script setup lang="ts">
import { XCircleIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  selectedIssueId: number
}>()

const { data } = await useIssueRenderedFieldsQuery(props.selectedIssueId)

watch(
  () => props.selectedIssueId,
  async newVal => {
    const { data: newData } = await useIssueRenderedFieldsQuery(newVal)
    data.value = newData.value
  },
)

function replaceAttachments(text: string, attachments: any[]) {
  let updatedText = text

  for (const attachment of attachments) {
    const regex = new RegExp(`/secure/attachment/${attachment.id}/${attachment.id}_[^\\s"]+`, 'g')
    updatedText = updatedText.replace(regex, `${attachment.content}`)
  }
  updatedText = updatedText.replaceAll(/<a([^>]+)>/gi, '<a$1 style="color: blue;">')

  return updatedText
}
</script>

<style scoped>
.side-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 450px;
  border-left: 1px solid #ccc;
  padding: 20px;
  overflow-y: scroll;
  background-color: white;
}
</style>

<style>
#jira-html p {
  margin-top: 1em;
}
</style>
