export function useUserQuery() {
  return useFetch(`/api/jira/rest/api/3/users/search?maxResults=1000`)
}
