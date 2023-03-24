import { appendHeader, createError, getHeader } from 'h3'

function mapCredentialsToBasicAuthHeaders(multipleCredentials: string): string[] {
  return multipleCredentials.split('\n').map(credentials => `Basic ${btoa(credentials)}`)
}

export default defineEventHandler(event => {
  const { basicAuth } = useRuntimeConfig()

  if (!basicAuth) return

  const validAuthHeaders = mapCredentialsToBasicAuthHeaders(basicAuth)
  const authHeader = getHeader(event, 'authorization')

  if (authHeader && validAuthHeaders.includes(authHeader)) return

  appendHeader(event, 'www-authenticate', 'Basic realm="Identification"')
  throw createError({ statusCode: 401, statusMessage: 'Not authorized' })
})
