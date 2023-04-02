export function useIssueRenderedFieldsQuery(issueKeyOrId: string | number) {
  const route = useRoute()
  const query = route.query

  const firstKey = Object.keys(query)?.[0]

  return useFetch(
    `/api/jira/rest/api/3/issue/${issueKeyOrId}?expand=description?${firstKey},renderedFields`,
  )
}
