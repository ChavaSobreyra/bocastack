const { jiraAuth } = useRuntimeConfig()

export default defineEventHandler(event => {
  const url = event.node.req.url?.replace('/api/jira', '')

  const result = $fetch(`https://torticity.atlassian.net/${url}`, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(jiraAuth).toString('base64'),
    },
  })

  return result
})
