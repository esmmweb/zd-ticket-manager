# zd-ticket-manager

A Bash script to create Zendesk support tickets via the Zendesk REST API. Supports both interactive (CLI) and non-interactive (webhook/automation) modes.

## Prerequisites

- **curl** — used to make API requests (pre-installed on macOS and most Linux distros)
- **jq** — used to safely build the JSON payload (`brew install jq` on macOS)
- **terminus** — Pantheon CLI, required for managed updates templates ([install guide](https://pantheon.io/docs/terminus/install))
- A Zendesk account with API access enabled

## Installation

1. **Clone or download this repository:**

   ```bash
   git clone <repo-url>
   cd zd-ticket-manager
   ```

2. **Make the script executable:**

   ```bash
   chmod +x create_ticket
   ```

3. **Create a `.env` file** in the same directory as the script:

   ```bash
   cp .env.example .env
   ```

   Or create it manually:

   ```
   ZENDESK_SUBDOMAIN=yoursubdomain
   ZENDESK_EMAIL=you@example.com/token
   ZENDESK_API_TOKEN=your_api_token_here
   ```

   - `ZENDESK_SUBDOMAIN` — the subdomain of your Zendesk account (e.g. `mycompany` from `mycompany.zendesk.com`)
   - `ZENDESK_EMAIL` — your Zendesk login email, appended with `/token` (e.g. `you@example.com/token`)
   - `ZENDESK_API_TOKEN` — your Zendesk API token (Admin Center > Apps and integrations > APIs > Zendesk API)

   > **Note:** The `.env` file is excluded from git. Never commit credentials to version control.

## Usage

### Interactive mode (default)

Run without any flags and the script will prompt you for each value:

```bash
./create_ticket
```

### Non-interactive mode

Pass all required values as flags to skip prompts entirely. Useful for webhooks and automation:

```bash
./create_ticket --non-interactive \
  --site mysite \
  --template autopilot \
  --email client@example.com \
  --vrt "https://vrt.example.com/report"
```

### All options

| Flag | Short | Description |
|---|---|---|
| `--site <name>` | `-s` | Pantheon site name |
| `--template <type>` | `-t` | Template: `autopilot` \| `approval` \| `manual` \| `external` |
| `--email <address>` | `-e` | Requester email address |
| `--subject <text>` | | Custom ticket subject (overrides auto-generated subject) |
| `--vrt <url>` | | VRT report URL (required for `autopilot` template) |
| `--non-interactive` | `-n` | Disable all prompts; exit with error if required values are missing |
| `--help` | `-h` | Show usage information |

## Templates

| Template | Flag value | Description |
|---|---|---|
| Autopilot | `autopilot` | Managed updates staged via Pantheon Autopilot, ready for review. Deploy date is auto-set to 3 business days out. |
| Wait for Approval | `approval` | Managed updates awaiting explicit client approval before deployment. |
| Manual | `manual` | *(Not yet implemented)* |
| External | `external` | *(Not yet implemented)* |

### Auto-generated subjects

For managed updates templates the subject is built automatically from the site's primary domain:

- **Autopilot:** `nwtellc.com - Managed Updates Ready for Review - Deploy to LIVE on Tue, Mar 17, '26.`
- **Approval:** `nwtellc.com - Managed Updates Ready for Review - Deploy upon Approval.`

The deploy date uses **business days only** (Saturday and Sunday are skipped). In interactive mode you can press Enter to accept the auto-generated subject or type a custom one. In non-interactive mode it is used as-is, or overridden with `--subject`.

### Auto-calculated dates

| Variable | Value |
|---|---|
| Deploy date | 3 business days from now |
| Reply-by date | 2 business days from now |

## Webhook integration (Next.js example)

To trigger the script from a Next.js API route, the script must run in non-interactive mode. All required values are passed as flags so no stdin prompts are needed.

```js
// app/api/create-ticket/route.js
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request) {
  // Validate webhook secret
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { site, template, email, vrt } = await request.json()

  // Return 202 immediately; ticket creation runs in the background
  const scriptPath = '/path/to/zd-ticket-manager/create_ticket'
  const cmd = [
    scriptPath,
    '--non-interactive',
    `--site "${site}"`,
    `--template "${template}"`,
    `--email "${email}"`,
    vrt ? `--vrt "${vrt}"` : '',
  ].filter(Boolean).join(' ')

  execAsync(cmd).catch(err => console.error('Ticket creation failed:', err))

  return Response.json({ status: 'accepted' }, { status: 202 })
}
```

> **Requirements for webhook use:**
> - `terminus` must be installed on the server and authenticated (`terminus auth:login`)
> - The `.env` file must be present next to the script on the server
> - Protect the endpoint with a secret header or similar auth mechanism

## Getting a Zendesk API Token

1. Log in to your Zendesk account
2. Go to **Admin Center** (gear icon)
3. Navigate to **Apps and integrations > APIs > Zendesk API**
4. Under **Token Access**, enable API token access
5. Click **Add API token**, give it a description, and copy the token into your `.env` file
