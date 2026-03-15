import { NextResponse } from 'next/server'
import { addBusinessDays, formatDate } from '@/lib/businessDays'
import { getPrimaryDomain } from '@/lib/pantheon'
import { getTemplate } from '@/lib/templates'

export async function POST(request) {
  // --- Auth ---
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // --- Parse body ---
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { site, template, email, vrt, subject: customSubject, domain: customDomain } = body

  // --- Validate required fields ---
  const errors = []
  if (!site)     errors.push('site is required')
  if (!template) errors.push('template is required')
  if (!email)    errors.push('email is required')
  if (!['autopilot', 'approval'].includes(template)) {
    errors.push('template must be autopilot or approval')
  }
  if (template === 'autopilot' && !vrt) {
    errors.push('vrt is required for autopilot template')
  }
  if (errors.length) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
  }

  // --- Resolve primary domain ---
  const primaryDomain = customDomain ?? (await getPrimaryDomain(site)) ?? '[domain]'

  // --- Calculate business-day dates ---
  const deployDate  = formatDate(addBusinessDays(3))
  const replyByDate = formatDate(addBusinessDays(2))

  // --- Build subject ---
  let subject = customSubject
  if (!subject) {
    if (template === 'autopilot') {
      subject = `${primaryDomain} - Managed Updates Ready for Review - Deploy to LIVE on ${deployDate}.`
    } else {
      subject = `${primaryDomain} - Managed Updates Ready for Review - Deploy upon Approval.`
    }
  }

  // --- Build body ---
  const autopilotUrl   = `https://dashboard.pantheon.io/sites/${site}#autopilot`
  const siteReviewUrl  = `https://autopilot-${site}.pantheonsite.io/`

  const placeholders = {
    AUTOPILOT_URL:     autopilotUrl,
    DEPLOY_DATE:       deployDate,
    REPLY_BY_DATE:     replyByDate,
    SITE_REVIEW_URL:   siteReviewUrl,
    VRT_REPORT_URL:    vrt ?? '',
    CORE_UPDATES:      '',
    MODULE_UPDATES:    '',
    COMPOSER_UPDATES:  '',
    TESTED_URLS:       '',
  }

  let htmlBody = getTemplate(template)
  for (const [key, value] of Object.entries(placeholders)) {
    htmlBody = htmlBody.replaceAll(`{{${key}}}`, value)
  }

  // --- Create Zendesk ticket ---
  const { ZENDESK_SUBDOMAIN, ZENDESK_EMAIL, ZENDESK_API_TOKEN } = process.env
  const credentials = Buffer.from(`${ZENDESK_EMAIL}:${ZENDESK_API_TOKEN}`).toString('base64')

  const zdRes = await fetch(
    `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        ticket: {
          subject,
          comment: { html_body: htmlBody },
          requester: { email, name: email },
        },
      }),
    }
  )

  const zdData = await zdRes.json()

  if (!zdRes.ok) {
    return NextResponse.json(
      { error: 'Zendesk API error', details: zdData },
      { status: zdRes.status }
    )
  }

  return NextResponse.json({
    success: true,
    ticket_id: zdData.ticket?.id,
    ticket_url: `https://${ZENDESK_SUBDOMAIN}.zendesk.com/tickets/${zdData.ticket?.id}`,
    subject,
  })
}
