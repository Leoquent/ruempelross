# RümpelRoss deployment

Pushes and merged pull requests on `main` run `.github/workflows/vps.yml`.
The workflow checks the static website, quiz submission and email layout, then
calls an authenticated HTTPS endpoint on the VPS. The server fetches `main`
from this public GitHub repository and applies a fast-forward update. nginx
serves `site/` from that checkout immediately; no website restart is needed.
Other branches do not deploy. To undo a change, revert its commit and push the
revert to `main`. The workflow can also be started manually in GitHub Actions.

## VPS setup

- Checkout: `/docker/hermes-agent-yasb/data/clients/ruempelross/RRwebsite`
- Website compose: `/docker/ruempelross/docker-compose.yml`
- Deploy helper compose: `/docker/ruempelross/docker-compose.webhook.yml`
- Deploy helper files: `/docker/ruempelross/webhook/`
- Secret: `/docker/ruempelross/deploy.env` (root-readable; never commit)
- Corresponding GitHub Actions secret: `VPS_DEPLOY_TOKEN`
- Logs: `docker logs ruempelross-ruempelross-deploy-1`

The helper runs as UID 10000 without Docker socket or general server access.
It accepts only its authenticated deployment POST. It refuses tracked local
changes and divergent histories. No polling timer or SSH key is used by Actions.
The previous SSH attempt could not reach port 22 from GitHub's hosted runner;
the temporary deployment key was revoked and its GitHub secrets removed.

Server infrastructure changes are deliberately separate from static-site
deployment: a push does not replace active TLS configuration or restart shared
services. The shared form API `api.lqnt.de` lives at `/docker/lqnt-api` and serves
other customers too. Its RümpelRoss HTML mail renderer is maintained in
`deploy/api/ruempelross_mail.py`; changes to that renderer need an explicit API
deployment and must preserve the other tenants.

## Forms

The quiz posts structured fields to `https://api.lqnt.de/lead`. The API chooses
the recipient from its server-side origin registry: `info@ruempelross.de`.
The SMTP relay is Google Workspace. There is no additional permanent form-body
copy on the API server. Success requires `{ "ok": true, "mail": "gesendet" }`.
HTML mail has a plain-text alternative. Do not add customer submissions to this
repository or application logs. Use fictitious data for tests; real test emails
require an explicit request identifying the recipients.

### Shared API retention standard (2026-11-03)

Applies to every current and future tenant of `api.lqnt.de`: process form bodies
in memory only; do not write payloads, names, email addresses, subjects or SMTP
error strings to files, logs or retry queues. Delivery records contain only a
random identifier, tenant, status and UTC timestamp. `delivery_retention.py`
deletes records after 30 days at startup and every minute through
`/etc/cron.d/lqnt-form-metadata`. Moll questionnaire idempotency records retain
their request ID, digest, status and timestamp under the same 30-day rule.
No per-delivery stdout logs: Docker size rotation is not a time retention rule.

The old nightly form-content backup and 12-month retention jobs are disabled.
The owner authorized removal of the three legacy JSONL files and 32 dedicated
archives on 2026-11-03. No mailbox messages were deleted. The deletion report is
private on the VPS: `/docker/lqnt-api/backups/retention-20261103/deployment.json`.
Do not create new backups of form contents or delivery databases.

Hostinger full-VPS backups are independent, weekly with two restore points;
they may retain previous files and metadata until replaced. They are not
selectively editable. After a full restore, before exposing the API, reinstall
this policy, remove legacy JSONL/archive copies, disable the old backup jobs
and run the metadata purge. Never restore an old content-writing API as live.
Mailbox and mail-relay retention are separate from this API policy.
