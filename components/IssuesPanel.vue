<template>
  <div
    v-if="data.fields"
    class="fixed inset-y-0 right-0 w-[475px] overflow-y-auto border-slate-800 bg-slate-900 p-6 text-slate-100"
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
        class="text-slate-400 transition-colors hover:text-slate-300"
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
        <h3 class="text-xl font-semibold text-slate-100">
          {{ data.fields.summary }}
        </h3>
      </div>

      <div class="space-y-4 border-b border-slate-700/50 pb-6">
        <div class="flex flex-wrap items-center gap-2">
          <div class="rounded-md bg-blue-500/20 px-2 py-1 text-sm text-blue-200">
            {{ data.fields.customfield_10028 ? data.fields.customfield_10028 : '-' }} points
          </div>

          <div class="rounded-md bg-slate-500/20 px-2 py-1 text-sm text-slate-200">
            {{ data.fields.status.name }}
          </div>

          <div
            class="rounded-md px-2 py-1 text-sm"
            :class="{
              'bg-blue-500/20 text-blue-200': data.fields.parent.fields.summary !== 'Bug',
              'bg-red-500/20 text-red-200': data.fields.parent.fields.summary === 'Bug',
            }"
          >
            {{ data.fields.parent.fields.summary }}
          </div>
        </div>
      </div>

      <div
        id="jira-html"
        class="prose prose-invert prose-slate max-w-none overflow-x-auto break-words"
        v-html="replaceAttachments(data.renderedFields.description, data.renderedFields.attachment)"
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

function replaceAttachments(text: string, attachments: any[]) {
  if (!text) return ''

  let updatedText = text

  // Replace both relative and full URLs for attachments
  attachments?.forEach(attachment => {
    // Replace relative paths
    const relativePattern = new RegExp(`/rest/api/3/attachment/content/${attachment.id}`, 'g')

    // Replace full Jira URLs
    const fullPattern = new RegExp(
      `https://[^/]+/rest/api/3/attachment/content/${attachment.id}`,
      'g',
    )

    // Get the actual content URL from the attachment
    const contentUrl = `${jiraBaseUrl}/rest/api/3/attachment/content/${attachment.id}`

    updatedText = updatedText.replace(relativePattern, contentUrl).replace(fullPattern, contentUrl)
  })

  // Style links
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
  color: rgb(226 232 240);
  font-size: 14px;
  line-height: 1.6;
}

#jira-html p {
  margin: 1em 0;
}

/* Links */
#jira-html a {
  color: rgb(96 165 250);
  text-decoration: none;
}

#jira-html a:hover {
  color: rgb(147 197 253);
  text-decoration: underline;
}

/* Lists */
#jira-html ul,
#jira-html ol {
  margin: 1em 0;
  padding-left: 2em;
}

#jira-html ul {
  list-style-type: disc;
}

#jira-html ol {
  list-style-type: decimal;
}

#jira-html li {
  margin: 0.5em 0;
}

/* Nested lists */
#jira-html ul ul,
#jira-html ol ol,
#jira-html ul ol,
#jira-html ol ul {
  margin: 0.5em 0;
}

/* Code blocks and inline code */
#jira-html tt,
#jira-html code {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
}

/* Bold text */
#jira-html b,
#jira-html strong {
  color: rgb(241 245 249);
  font-weight: 600;
}

/* Images */
#jira-html img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1em 0;
  border: 1px solid rgb(51 65 85);
}

#jira-html .image-wrap {
  display: block;
  margin: 1em 0;
}

/* Error spans (often used in code) */
#jira-html .error {
  color: rgb(252 165 165);
  background: rgba(239, 68, 68, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

/* Headers within description */
#jira-html h1,
#jira-html h2,
#jira-html h3,
#jira-html h4,
#jira-html h5,
#jira-html h6 {
  color: rgb(241 245 249);
  font-weight: 600;
  margin: 1.5em 0 0.5em;
}

/* Tables */
#jira-html table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

#jira-html th,
#jira-html td {
  border: 1px solid rgb(51 65 85);
  padding: 0.5em;
}

#jira-html th {
  background: rgba(255, 255, 255, 0.05);
}

/* Blockquotes */
#jira-html blockquote {
  border-left: 3px solid rgb(71 85 105);
  margin: 1em 0;
  padding-left: 1em;
  color: rgb(148 163 184);
}

/* Horizontal rules */
#jira-html hr {
  border: none;
  border-top: 1px solid rgb(51 65 85);
  margin: 2em 0;
}

/* Special Jira panels */
#jira-html .panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1em;
  margin: 1em 0;
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
  background: rgba(255, 255, 255, 0.1);
  margin: 0 0.5em;
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

#jira-html tt,
#jira-html code {
  background: rgb(51 65 85); /* bg-slate-700 */
  border-radius: 0.25rem;
  padding: 0.2em 0.4em;
  font-family: ui-monospace, Monaco, 'Courier New', monospace;
  font-size: 0.875em;
  color: rgb(186 230 253); /* text-cyan-200 */
  border: 1px solid rgb(71 85 105); /* border-slate-600 */
}

/* For code blocks */
#jira-html pre {
  background: rgb(51 65 85); /* bg-slate-700 */
  border-radius: 0.5rem;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto;
  border: 1px solid rgb(71 85 105); /* border-slate-600 */
}

#jira-html pre code,
#jira-html pre tt {
  background: transparent;
  border: none;
  padding: 0;
  color: rgb(186 230 253); /* text-cyan-200 */
  font-size: 0.875em;
  line-height: 1.7;
}

/* For code that has error highlighting */
#jira-html tt .error,
#jira-html code .error {
  background: rgba(239, 68, 68, 0.2); /* bg-red-500/20 */
  color: rgb(252 165 165); /* text-red-300 */
  border-radius: 0.25rem;
  padding: 0.1em 0.3em;
}
</style>
