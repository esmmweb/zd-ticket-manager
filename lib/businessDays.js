/**
 * Returns a Date that is `n` business days (Mon–Fri) from today.
 */
export function addBusinessDays(n) {
  let count = 0
  let offset = 0
  const now = new Date()

  while (count < n) {
    offset++
    const d = new Date(now)
    d.setDate(d.getDate() + offset)
    const dow = d.getDay() // 0 = Sun, 6 = Sat
    if (dow !== 0 && dow !== 6) count++
  }

  const result = new Date(now)
  result.setDate(result.getDate() + offset)
  return result
}

/**
 * Formats a Date as "Tue, Mar 17, '26" to match the shell script output.
 */
export function formatDate(date) {
  const days   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dow  = days[date.getDay()]
  const mon  = months[date.getMonth()]
  const day  = String(date.getDate()).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${dow}, ${mon} ${day}, '${year}`
}
