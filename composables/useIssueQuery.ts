export function useIssueQuery(projectId: Ref<string>, userId: Ref<string>) {
  console.log('useIssueQuery', {
    projectId,
    userId,
  })
  let query = `project = ${projectId.value} AND status = Done AND resolution = Done`

  if (userId.value) query += ` AND assignee in (${userId.value})`
  query += ' order by resolutiondate DESC'
  return useFetch(
    `/api/jira/rest/api/3/search?jql=${encodeURIComponent(
      query,
    )}&maxResults=100&expand=changelog&fields=statuscategorychangedate,customfield_10028`,
  )
}
