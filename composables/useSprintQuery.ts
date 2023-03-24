export function useSprintQuery(boardId) {
  const route = useRoute()
  const query = route.query

  const firstKey = Object.keys(query)?.[0]
  return useFetch(`/api/jira/rest/agile/1.0/board/${boardId}/sprint?state=active?${firstKey}`)
}
