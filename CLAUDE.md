@AGENTS.md

# Security Rules — MUST FOLLOW

## ENV Variables
**NEVER display the value of any environment variable in the conversation.**

Only allowed: check whether a key EXISTS (present / missing / placeholder).

```
# OK — check existence only
grep -q 'RESEND_API_KEY' .env.local && echo "SET" || echo "MISSING"

# NEVER — do not cat, read, or print .env file contents into chat
cat .env.local        ← FORBIDDEN
Read .env.local       ← FORBIDDEN
```

Sensitive keys in this project:
- `DATABASE_URL` — Neon PostgreSQL credentials
- `RESEND_API_KEY` — email sending
- `EVENTBRITE_TOKEN` — event scraper
- `HUMANITIX_API_KEY` — event scraper
- `NEXT_PUBLIC_MAPBOX_TOKEN` — map tiles
- `CRON_SECRET` — cron endpoint auth

If you need to verify a key is configured, use:
```bash
grep -q 'KEY_NAME=re_' .env.local && echo "SET" || echo "MISSING or placeholder"
```

If a key value has already appeared in the conversation by mistake, tell the user to rotate it immediately.
