import { teams } from '~/config/teams.config'

async function getIssues() {
  // TODO: get more issues by getting multiple pages in this fn
  let query = `resolved >= -12w AND status = Done AND resolution = Done AND project IN (${teams.map(t => t.id).join(',')})`

  // if (projectId.value) query += ` AND project = ${projectId.value}`
  // else query += ` AND project IN (${teams.map(t => t.id).join(',')})`


  // if (userId.value) query += ` AND assignee = ${userId.value}`

  query += ' order by resolutiondate DESC'

  const url = `/api/jira/rest/api/3/search?jql=${encodeURIComponent(
    query,
  )}&maxResults=100&expand=changelog&fields=statuscategorychangedate,customfield_10028,project,assignee`

  const issues = []
  const res = await $fetch(
    url
  )

  issues.push(...res.issues)

  while(issues.length < res.total){
    const result = await $fetch(
      `${url}&startAt=${issues.length}`
    )
    issues.push(...result.issues)
  }

  return issues
}

export function useIssueQuery() {
  return useQuery({
    queryKey: ['issues'],
    queryFn: () => getIssues(),
  })
}
