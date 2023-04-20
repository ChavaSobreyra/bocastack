<template>
  <div v-if="data.fields" class="side-panel bg-gray-100">
    <div class="flex justify-end">
      <button @click="$emit('close-panel')">
        <XCircleIcon class="h-6 w-6 text-slate-500" />
      </button>
    </div>

    <div class="mt-1.5 text-xl text-gray-900">
      <span v-if="data.fields.flagged" class="mr-2">🛑</span>
      <span v-if="data.fields.status.name === 'UAT'" class="mr-2">👀</span>
      <span class="font-semibold text-gray-600">{{ data.fields.summary }}</span>
    </div>
    <div class="flex items-center justify-self-start border-b-2 border-gray-200 p-6">
      <img
        v-if="data.fields.assignee"
        class="h-10 w-10 rounded-full"
        :src="data.fields.assignee.avatarUrls['48x48']"
        alt=""
      />
      <span class="pl-4 font-semibold text-gray-600">Points:</span>
      <div class="rounded-full bg-gray-100 px-1 text-center font-semibold text-gray-800">
        {{ data.fields.customfield_10028 ? data.fields.customfield_10028 : '-' }}
      </div>
      <span class="pl-2 pr-2 font-semibold text-gray-600">Epic:</span>
      <div
        class="rounded-full p-2 text-center text-sm font-semibold text-white"
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
      class="break-words"
      v-html="replaceAttachments(data.renderedFields.description, data.renderedFields.attachment)"
    ></div>
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
}

#jira-html p {
  margin-top: 1em;
}
</style>
