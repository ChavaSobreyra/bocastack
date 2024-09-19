const {
  jiraAuth,
  public: { jiraBaseUrl },
} = useRuntimeConfig()

export default defineEventHandler(event => {
  const url = event.node.req.url?.replace('/api/jira', '')

  const result = $fetch(`${jiraBaseUrl}/${url}`, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(jiraAuth).toString('base64'),
    },
  })

  return result
})
