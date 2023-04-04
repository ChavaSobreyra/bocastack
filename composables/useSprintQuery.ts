export function useSprintQuery(boardId: number) {
  return useFetch(`/api/jira/rest/agile/1.0/board/${boardId}/sprint?state=active`)
}
