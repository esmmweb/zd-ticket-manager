# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository contains a single Bash script (`create_ticket`) that creates Zendesk support tickets via the Zendesk REST API using `curl`.

## Usage

```bash
./create_ticket "<subject>" "<body>" "<requester_email>"
```

Example:
```bash
./create_ticket "Server is down" "The main web server is not responding." "user@example.com"
```

## Configuration

The script has three configuration variables near the top:

- `ZENDESK_SUBDOMAIN` — the Zendesk account subdomain
- `ZENDESK_EMAIL` — login email suffixed with `/token` (e.g. `user@example.com/token`)
- `ZENDESK_API_TOKEN` — Zendesk API token (Admin Center > Apps and integrations > APIs > Zendesk API)

These are currently hardcoded in the script. Prefer loading `ZENDESK_API_TOKEN` from an environment variable to avoid committing credentials.

## Security Note

The API token is hardcoded in `create_ticket` at line 14. This token should be rotated and moved to an environment variable (e.g. `export ZENDESK_API_TOKEN=...` in the shell environment or a `.env` file excluded from git).
