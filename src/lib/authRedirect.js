const DEFAULT_RETURN_TO = '/dashboard'

export function getSafeAuthReturnTo(destination) {
  const rawValue = typeof destination === 'string'
    ? destination
    : destination?.pathname
      ? `${destination.pathname}${destination.search || ''}${destination.hash || ''}`
      : DEFAULT_RETURN_TO

  try {
    const url = new URL(rawValue, window.location.origin)
    if (url.origin !== window.location.origin || !/^\/dashboard(?:\/|$)/.test(url.pathname)) {
      return DEFAULT_RETURN_TO
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return DEFAULT_RETURN_TO
  }
}

export function getAuthReturnLocation(destination) {
  const url = new URL(getSafeAuthReturnTo(destination), window.location.origin)
  return { pathname: url.pathname, search: url.search, hash: url.hash }
}

export function getAuthCallbackUrl(destination) {
  const url = new URL('/auth/callback', window.location.origin)
  url.searchParams.set('next', getSafeAuthReturnTo(destination))
  return url.toString()
}
