export function useIssuesQuery(sprintId: number) {
  return useFetch(`/api/jira/rest/agile/1.0/sprint/${sprintId}/issue?maxResults=100`)
}
