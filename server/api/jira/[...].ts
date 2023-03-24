const { jiraAuth } = useRuntimeConfig()

export default defineEventHandler(event => {
  if (!event.node.req.url?.includes('?passwordistaco')) return
  const url = event.node.req.url?.replace('?passwordistaco', '')?.replace('/api/jira', '')

  const result = $fetch(`https://torticity.atlassian.net/${url}`, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(jiraAuth).toString('base64'),
    },
  })

  return result
})
