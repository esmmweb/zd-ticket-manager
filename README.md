# zd-ticket-manager

A Bash script to create Zendesk support tickets via the Zendesk REST API.

## Prerequisites

- **curl** — used to make API requests (pre-installed on macOS and most Linux distros)
- **jq** — used to safely build the JSON payload (`brew install jq` on macOS)
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

3. **Create a `.env` file** in the same directory as the script with your Zendesk credentials and ticket values:

   ```bash
   cp .env.example .env
   ```

   Or create it manually:

   ```
   # Zendesk credentials
   ZENDESK_SUBDOMAIN=yoursubdomain
   ZENDESK_EMAIL=you@example.com/token
   ZENDESK_API_TOKEN=your_api_token_here

   # Ticket template values
   DEPLOY_DATE="Fri, May 31, '24"
   REPLY_BY_DATE="Thu, May 30, '24"
   SITE_REVIEW_URL=https://example.com
   VRT_REPORT_URL=https://example.com/vrt-report
   CORE_UPDATES="- WordPress 6.5.3"
   MODULE_UPDATES="- Yoast SEO 22.9"
   COMPOSER_UPDATES="- None"
   TESTED_URLS="- https://example.com"
   ```

   **Zendesk credentials:**
   - `ZENDESK_SUBDOMAIN` — the subdomain of your Zendesk account (e.g. `mycompany` from `mycompany.zendesk.com`)
   - `ZENDESK_EMAIL` — your Zendesk login email, appended with `/token` (e.g. `you@example.com/token`)
   - `ZENDESK_API_TOKEN` — your Zendesk API token (found in Admin Center > Apps and integrations > APIs > Zendesk API)

   **Ticket template values:**
   | Variable | Description |
   |---|---|
   | `DEPLOY_DATE` | Scheduled deployment date (e.g. `Fri, May 31, '24`) |
   | `REPLY_BY_DATE` | Deadline for client to reply before auto-deploy (e.g. `Thu, May 30, '24`) |
   | `SITE_REVIEW_URL` | Link to the Multidev environment for review |
   | `VRT_REPORT_URL` | Link to the Visual Regression Testing report |
   | `CORE_UPDATES` | List of core updates performed |
   | `MODULE_UPDATES` | List of module/plugin/theme updates performed |
   | `COMPOSER_UPDATES` | List of Composer dependency updates |
   | `TESTED_URLS` | List of URLs that were tested during VRT |

   > **Note:** The `.env` file is excluded from git. Never commit credentials to version control.

## Usage

```bash
./create_ticket "<subject>" "<requester_email>"
```

The ticket body is automatically built from `ticket_body_template.txt` using the values set in `.env`.

### Arguments

| Argument            | Description                                      |
|---------------------|--------------------------------------------------|
| `<subject>`         | The subject/title of the ticket                  |
| `<requester_email>` | Email address of the person requesting support   |

### Example

```bash
./create_ticket "Managed Updates Ready for Review" "client@example.com"
```

## Ticket Template

The ticket body is defined in `ticket_body_template.txt`. Placeholders use the `{{PLACEHOLDER_NAME}}` format and are replaced at runtime with values from `.env`. Edit the template file directly to change the message structure.

## Getting a Zendesk API Token

1. Log in to your Zendesk account
2. Go to **Admin Center** (gear icon)
3. Navigate to **Apps and integrations > APIs > Zendesk API**
4. Under **Token Access**, enable API token access
5. Click **Add API token**, give it a description, and copy the token into your `.env` file
