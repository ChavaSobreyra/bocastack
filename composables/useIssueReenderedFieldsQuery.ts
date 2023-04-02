export function useIssueRenderedFieldsQuery(issueKeyOrId: string | number) {
  return useFetch(`/api/jira/rest/api/3/issue/${issueKeyOrId}?expand=description,renderedFields`)
}
