# zd-ticket-manager

A tool for creating Zendesk support tickets for Pantheon managed updates. Includes a CLI shell script for manual use and a Next.js webhook app for automation.

## Repository structure

```
zd-ticket-manager/
├── app/                        # Next.js app (webhook API)
│   ├── api/ticket/route.js     # POST /api/ticket endpoint
│   ├── layout.js
│   └── page.js
├── lib/                        # Next.js shared logic
│   ├── businessDays.js
│   ├── pantheon.js
│   └── templates.js
├── scripts/                    # Shell scripts for CLI use
│   ├── create_ticket           # Interactive ticket creation
│   ├── webhook_create_ticket   # Non-interactive (flags only)
│   └── templates/
│       └── managed_updates/
│           ├── autopilot.txt
│           └── values.env
├── package.json
├── next.config.mjs
└── .env.example
```

---

## CLI — `scripts/create_ticket`

An interactive shell script for creating tickets from the terminal.

### Prerequisites

- **curl** — pre-installed on macOS and most Linux distros
- **jq** — `brew install jq` on macOS
- **terminus** — Pantheon CLI ([install guide](https://pantheon.io/docs/terminus/install)), must be authenticated (`terminus auth:login`)
- A Zendesk account with API access enabled

### Setup

1. **Make the script executable:**

   ```bash
   chmod +x scripts/create_ticket
   chmod +x scripts/webhook_create_ticket
   ```

2. **Create a `.env` file** at the repo root:

   ```bash
   cp .env.example .env
   ```

   Fill in your values:

   ```
   ZENDESK_SUBDOMAIN=yoursubdomain
   ZENDESK_EMAIL=you@example.com/token
   ZENDESK_API_TOKEN=your_api_token_here
   PANTHEON_MACHINE_TOKEN=your_machine_token_here
   WEBHOOK_SECRET=your_webhook_secret_here
   ```

   | Variable | Description |
   |---|---|
   | `ZENDESK_SUBDOMAIN` | Subdomain of your Zendesk account (e.g. `mycompany` from `mycompany.zendesk.com`) |
   | `ZENDESK_EMAIL` | Your Zendesk login email appended with `/token` (e.g. `you@example.com/token`) |
   | `ZENDESK_API_TOKEN` | Zendesk API token (Admin Center > Apps and integrations > APIs > Zendesk API) |
   | `PANTHEON_MACHINE_TOKEN` | Pantheon machine token for domain lookup ([generate here](https://dashboard.pantheon.io/personal-settings/machine-tokens)) |
   | `WEBHOOK_SECRET` | A long random string used to authenticate incoming webhook requests |

   > The `.env` file is excluded from git. Never commit credentials to version control.

### Usage

Run without flags to use interactive prompts:

```bash
./scripts/create_ticket
```

The script will ask for the site name, template, and any other required values.

### Templates

| Template | Description |
|---|---|
| `autopilot` | Managed updates staged via Pantheon Autopilot, ready for review |
| `approval` | Managed updates awaiting explicit client approval before deployment |
| `manual` | *(Not yet implemented)* |
| `external` | *(Not yet implemented)* |

### Auto-generated subjects

For managed updates templates the subject is built from the site's primary domain (fetched via `terminus`):

- **Autopilot:** `nwtellc.com - Managed Updates Ready for Review - Deploy to LIVE on Tue, Mar 17, '26.`
- **Approval:** `nwtellc.com - Managed Updates Ready for Review - Deploy upon Approval.`

Dates use **business days only** — Saturday and Sunday are skipped.

| Date | Value |
|---|---|
| Deploy date | 3 business days from now |
| Reply-by date | 2 business days from now |

---

## Webhook — `POST /api/ticket`

A Next.js API route that creates Zendesk tickets without any shell script dependencies. Designed to be triggered by external services or automation.

### Setup

Install dependencies:

```bash
npm install
```

Add the required env vars to `.env` (see the CLI setup section above), then run locally:

```bash
npm run dev
```

### Deploying to Pantheon

This repo is structured with Next.js at the root so Pantheon can detect and deploy it directly. Connect this GitHub repository to your Pantheon Next.js site (Private Beta).

### Endpoint

**`POST /api/ticket`**

**Headers:**

| Header | Required | Description |
|---|---|---|
| `x-webhook-secret` | Yes | Must match `WEBHOOK_SECRET` in `.env` |
| `Content-Type` | Yes | `application/json` |

**Body:**

| Field | Required | Description |
|---|---|---|
| `site` | Yes | Pantheon site name |
| `template` | Yes | `autopilot` or `approval` |
| `email` | Yes | Requester email address |
| `vrt` | For autopilot | VRT report URL |
| `domain` | No | Primary domain override — auto-looked up via Pantheon API if omitted |
| `subject` | No | Custom subject override — auto-generated if omitted |

**Example request:**

```bash
curl -X POST https://your-site.pantheonsite.io/api/ticket \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your_webhook_secret_here" \
  -d '{
    "site": "mysite",
    "template": "autopilot",
    "email": "client@example.com",
    "vrt": "https://vrt.example.com/report"
  }'
```

**Example response:**

```json
{
  "success": true,
  "ticket_id": 12345,
  "ticket_url": "https://yoursubdomain.zendesk.com/tickets/12345",
  "subject": "nwtellc.com - Managed Updates Ready for Review - Deploy to LIVE on Tue, Mar 17, '26."
}
```

---

## Getting a Zendesk API Token

1. Log in to your Zendesk account
2. Go to **Admin Center** (gear icon)
3. Navigate to **Apps and integrations > APIs > Zendesk API**
4. Under **Token Access**, enable API token access
5. Click **Add API token**, give it a description, and copy the token into your `.env` file
