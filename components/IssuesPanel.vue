<template>
  <div
    v-if="data.fields"
    class="fixed inset-y-0 right-0 w-[475px] overflow-y-auto border-slate-200 bg-white p-6 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
  >
    <!-- Header -->
    <div class="flex justify-between gap-4 justify-self-end">
      <a
        :href="`${jiraBaseUrl}/browse/${data.key}`"
        target="_blank"
        class="text-blue-400 transition-colors hover:text-blue-300"
      >
        <LinkIcon class="h-5 w-5" />
      </a>
      <button
        class="text-slate-700 transition-colors hover:text-slate-300 dark:text-slate-400"
        @click="$emit('close-panel')"
      >
        <XCircleIcon class="h-6 w-6" />
      </button>
    </div>

    <div class="space-y-6">
      <!-- Title -->
      <div class="flex justify-start justify-items-center space-x-4">
        <img :src="data.fields.issuetype.iconUrl" alt="" class="h-8 w-8" />
        <img
          v-if="data.fields.assignee"
          class="h-8 w-8 rounded-full"
          :src="data.fields.assignee.avatarUrls['48x48']"
          alt=""
        />
      </div>
      <div>
        <h3 class="text-xl font-semibold dark:text-slate-100">
          {{ data.fields.summary }}
        </h3>
      </div>

      <div class="space-y-4 border-b border-slate-700/50 pb-6">
        <div class="flex flex-wrap items-center gap-2">
          <div
            class="rounded-md bg-blue-400 px-2 py-1 text-sm text-white dark:bg-blue-500/20 dark:text-blue-200"
          >
            {{ data.fields.customfield_10028 ? data.fields.customfield_10028 : '-' }} points
          </div>

          <div
            class="rounded-md bg-blue-400 px-2 py-1 text-sm text-white dark:bg-blue-500/20 dark:text-blue-200"
          >
            {{ data.fields.status.name }}
          </div>

          <div
            v-if="data.fields.parent && data.fields.parent.fields"
            class="rounded-md bg-blue-400 px-2 py-1 text-sm text-white dark:bg-blue-500/20 dark:text-blue-200"
          >
            {{ data.fields.parent.fields.summary }}
          </div>
        </div>
      </div>

      <div v-for="attachment in data.fields.attachment" :key="attachment.id">
        <video
          v-if="isVideo(attachment.filename)"
          controls
          class="w-full rounded-lg border border-slate-700"
          preload="none"
          :src="`${jiraBaseUrl}/rest/api/3/attachment/content/${attachment.id}?atlassian-token=no-check`"
        />
      </div>

      <!-- Description -->
      <div
        id="jira-html"
        class="prose prose-invert prose-slate max-w-none overflow-x-auto break-words"
        v-html="processContent(data.renderedFields.description, data.renderedFields.attachment)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { XCircleIcon, LinkIcon } from '@heroicons/vue/24/solid'

const { jiraBaseUrl } = useRuntimeConfig().public

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

const isVideo = (filename: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg']
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

function processContent(text: string, attachments: any[]) {
  if (!text) return ''

  let updatedText = text

  attachments?.forEach(attachment => {
    if (isVideo(attachment.filename)) {
      const embedPattern = new RegExp(
        `<div class="embeddedObject">.*?${attachment.id}.*?</div>`,
        'gs',
      )
      updatedText = updatedText.replace(embedPattern, '')
    } else {
      const relativePattern = new RegExp(`/rest/api/3/attachment/content/${attachment.id}`, 'g')
      const fullPattern = new RegExp(
        `https://[^/]+/rest/api/3/attachment/content/${attachment.id}`,
        'g',
      )

      const contentUrl = `${jiraBaseUrl}/rest/api/3/attachment/content/${attachment.id}?atlassian-token=no-check`

      updatedText = updatedText
        .replace(relativePattern, contentUrl)
        .replace(fullPattern, contentUrl)
    }
  })

  // Add standard link styling
  updatedText = updatedText.replaceAll(
    /<a([^>]+)>/gi,
    '<a$1 class="text-blue-400 hover:text-blue-300 transition-colors">',
  )

  return updatedText
}
</script>

<style>
/* Base text styles */
#jira-html {
  color: rgb(51 65 85); /* slate-700 for light */
  font-size: 14px;
  line-height: 1.6;
}

.dark #jira-html {
  color: rgb(226 232 240);
}

#jira-html p {
  margin: 1em 0;
}

/* Links */
#jira-html a {
  color: rgb(37 99 235); /* blue-600 for light */
  text-decoration: none;
}

.dark #jira-html a {
  color: rgb(96 165 250);
}

#jira-html a:hover {
  color: rgb(59 130 246); /* blue-500 for light */
  text-decoration: underline;
}

.dark #jira-html a:hover {
  color: rgb(147 197 253);
}

/* Lists remain the same, no color changes needed */

/* Code blocks and inline code */
#jira-html tt,
#jira-html code {
  background: rgb(241 245 249); /* slate-100 for light */
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
  border: 1px solid rgb(226 232 240); /* slate-200 for light */
  color: rgb(51 65 85); /* slate-700 for light */
}

.dark #jira-html tt,
.dark #jira-html code {
  background: rgb(51 65 85);
  color: rgb(186 230 253);
  border: 1px solid rgb(71 85 105);
}

/* Bold text */
#jira-html b,
#jira-html strong {
  color: rgb(15 23 42); /* slate-900 for light */
  font-weight: 600;
}

.dark #jira-html b,
.dark #jira-html strong {
  color: rgb(241 245 249);
}

/* Images */
#jira-html img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1em 0;
  border: 1px solid rgb(226 232 240); /* slate-200 for light */
}

.dark #jira-html img {
  border: 1px solid rgb(51 65 85);
}

/* Error spans */
#jira-html .error {
  color: rgb(220 38 38); /* red-600 for light */
  background: rgba(239, 68, 68, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

.dark #jira-html .error {
  color: rgb(252 165 165);
}

/* Headers */
#jira-html h1,
#jira-html h2,
#jira-html h3,
#jira-html h4,
#jira-html h5,
#jira-html h6 {
  color: rgb(15 23 42); /* slate-900 for light */
  font-weight: 600;
  margin: 1.5em 0 0.5em;
}

.dark #jira-html h1,
.dark #jira-html h2,
.dark #jira-html h3,
.dark #jira-html h4,
.dark #jira-html h5,
.dark #jira-html h6 {
  color: rgb(241 245 249);
}

/* Tables */
#jira-html table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

#jira-html th,
#jira-html td {
  border: 1px solid rgb(226 232 240); /* slate-200 for light */
  padding: 0.5em;
}

.dark #jira-html th,
.dark #jira-html td {
  border: 1px solid rgb(51 65 85);
}

#jira-html th {
  background: rgb(241 245 249); /* slate-100 for light */
}

.dark #jira-html th {
  background: rgba(255, 255, 255, 0.05);
}

/* Blockquotes */
#jira-html blockquote {
  border-left: 3px solid rgb(226 232 240); /* slate-200 for light */
  margin: 1em 0;
  padding-left: 1em;
  color: rgb(100 116 139); /* slate-500 for light */
}

.dark #jira-html blockquote {
  border-left: 3px solid rgb(71 85 105);
  color: rgb(148 163 184);
}

/* Horizontal rules */
#jira-html hr {
  border: none;
  border-top: 1px solid rgb(226 232 240); /* slate-200 for light */
  margin: 2em 0;
}

.dark #jira-html hr {
  border-top: 1px solid rgb(51 65 85);
}

/* Panels */
#jira-html .panel {
  background: rgb(241 245 249); /* slate-100 for light */
  border-radius: 0.5rem;
  padding: 1em;
  margin: 1em 0;
  border: 1px solid rgb(226 232 240); /* slate-200 for light */
}

.dark #jira-html .panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgb(51 65 85);
}

/* Status and priority badges */
#jira-html .status,
#jira-html .priority {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.25em 0.75em;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgb(241 245 249); /* slate-100 for light */
  margin: 0 0.5em;
}

.dark #jira-html .status,
.dark #jira-html .priority {
  background: rgba(255, 255, 255, 0.1);
}

/* Callouts and info panels */
#jira-html .info,
#jira-html .note,
#jira-html .warning {
  padding: 1em;
  margin: 1em 0;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

#jira-html .info {
  background: rgba(59, 130, 246, 0.1);
  border-left-color: rgb(59 130 246);
}

#jira-html .note {
  background: rgba(234, 179, 8, 0.1);
  border-left-color: rgb(234 179 8);
}

#jira-html .warning {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: rgb(239 68 68);
}

/* Pre blocks */
#jira-html pre {
  background: rgb(241 245 249); /* slate-100 for light */
  border-radius: 0.5rem;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto;
  border: 1px solid rgb(226 232 240); /* slate-200 for light */
}

.dark #jira-html pre {
  background: rgb(51 65 85);
  border: 1px solid rgb(71 85 105);
}

#jira-html pre code,
#jira-html pre tt {
  background: transparent;
  border: none;
  padding: 0;
  color: rgb(51 65 85); /* slate-700 for light */
  font-size: 0.875em;
  line-height: 1.7;
}

.dark #jira-html pre code,
.dark #jira-html pre tt {
  color: rgb(186 230 253);
}

/* Error highlighting in code */
#jira-html tt .error,
#jira-html code .error {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(220 38 38); /* red-600 for light */
  border-radius: 0.25rem;
  padding: 0.1em 0.3em;
}

.dark #jira-html tt .error,
.dark #jira-html code .error {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(252 165 165);
}
</style>
