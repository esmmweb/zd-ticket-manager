/**
 * Looks up the primary domain for a Pantheon site's live environment
 * using the Pantheon machine token.
 *
 * Returns the primary domain string, or null if it cannot be determined.
 */
export async function getPrimaryDomain(siteName) {
  const token = process.env.PANTHEON_MACHINE_TOKEN
  if (!token) return null

  try {
    // Resolve site UUID first
    const siteRes = await fetch(
      `https://terminus.pantheon.io/sites/${siteName}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!siteRes.ok) return null
    const siteData = await siteRes.json()
    const siteId = siteData?.id
    if (!siteId) return null

    // Fetch domains for the live environment
    const domainRes = await fetch(
      `https://terminus.pantheon.io/sites/${siteId}/environments/live/domains`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!domainRes.ok) return null
    const domains = await domainRes.json()

    // Find the primary domain
    const entry = Object.entries(domains?.data ?? {}).find(
      ([, v]) => v?.primary === true
    )
    return entry ? entry[0] : null
  } catch {
    return null
  }
}
