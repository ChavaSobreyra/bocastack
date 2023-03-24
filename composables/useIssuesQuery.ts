export function useIssuesQuery(sprintId) {
  const route = useRoute()
  const query = route.query

  const firstKey = Object.keys(query)?.[0]

  return useFetch(`/api/jira/rest/agile/1.0/sprint/${sprintId}/issue?maxResults=100?${firstKey}`)
}
