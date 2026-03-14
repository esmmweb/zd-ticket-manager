# zd-ticket-manager

A Bash script to create Zendesk support tickets via the Zendesk REST API.

## Prerequisites

- **curl** — used to make API requests (pre-installed on macOS and most Linux distros)
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

3. **Create a `.env` file** in the same directory as the script with your Zendesk credentials:

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
   - `ZENDESK_API_TOKEN` — your Zendesk API token (found in Admin Center > Apps and integrations > APIs > Zendesk API)

   > **Note:** The `.env` file is excluded from git. Never commit credentials to version control.

## Usage

```bash
./create_ticket "<subject>" "<body>" "<requester_email>"
```

### Arguments

| Argument          | Description                                      |
|-------------------|--------------------------------------------------|
| `<subject>`       | The subject/title of the ticket                  |
| `<body>`          | The description or body text of the ticket       |
| `<requester_email>` | Email address of the person requesting support |

### Examples

```bash
./create_ticket "Server is down" "The main web server is not responding." "user@example.com"
```

```bash
./create_ticket "Login issue" "Users cannot log in after the latest deployment." "ops@example.com"
```

## Getting a Zendesk API Token

1. Log in to your Zendesk account
2. Go to **Admin Center** (gear icon)
3. Navigate to **Apps and integrations > APIs > Zendesk API**
4. Under **Token Access**, enable API token access
5. Click **Add API token**, give it a description, and copy the token into your `.env` file
