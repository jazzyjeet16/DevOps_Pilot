# DevOpsPilot

A full-stack developer-automation dashboard using React, Express, MongoDB, n8n and GitHub. The first workflow receives GitHub pull-request events, fetches changed files, optionally generates an advisory AI review, and records execution history.

> **Status:** Initial MVP scaffold. Authentication, repository registration, execution history, dashboard UI, API integration and an importable n8n workflow are included. GitHub webhook verification, workspace-to-GitHub installation mapping, durable job processing and production deployment hardening remain follow-up work. Do not expose this initial webhook publicly without the hardening described below.

## Requirements

- Node.js 20 or newer
- Docker Desktop with Docker Compose
- A MongoDB client is optional; MongoDB runs in Docker
- GitHub personal access token or GitHub App token with read access to pull requests and contents
- Optional OpenAI-compatible API key for AI reviews

## 1. Start infrastructure

From the project root:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env`. Replace all example passwords and the n8n encryption key. Then start MongoDB, Redis and n8n:

```bash
docker compose up -d
```

Open n8n at <http://localhost:5678> and complete the initial owner-account setup. Keep this local instance private.

## 2. Configure the API

```bash
cd server
cp .env.example .env
npm install
```

On Windows PowerShell use `Copy-Item .env.example .env` instead of `cp`.

Edit `server/.env`:

- Set `JWT_SECRET` to a long random value.
- Set `INTERNAL_AUTOMATION_TOKEN` to another long random value.
- Set `MONGODB_URI` to match the MongoDB username/password in the root `.env`.
- Set `N8N_WEBHOOK_URL` to `http://localhost:5678/webhook/devopspilot-pr`.
- Add `GITHUB_TOKEN` with minimum required read permissions for the test repository.
- Add `LLM_API_KEY` only if you want AI review. `LLM_BASE_URL` and `LLM_MODEL` can point to an OpenAI-compatible provider.

Start the API:

```bash
npm run dev
```

Health check: <http://localhost:5000/api/v1/health>

## 3. Start the frontend

In another terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Windows PowerShell: `Copy-Item .env.example .env`.

Open <http://localhost:5173>, create an account and sign in. Add a repository using `owner/repository` format.

## 4. Import the n8n workflow

1. Open <http://localhost:5678>.
2. Choose **Overview → Add workflow → Import from file**.
3. Import `n8n/workflows/github-pr-review.json`.
4. Open the **Process PR in DevOpsPilot API** HTTP Request node.
5. Replace `REPLACE_WITH_INTERNAL_AUTOMATION_TOKEN` with the exact `INTERNAL_AUTOMATION_TOKEN` from `server/.env`.
6. Keep `http://host.docker.internal:5000` when n8n runs in Docker Desktop and the API runs on your host. If both services later run in the same Compose network, use the API service DNS name instead.
7. Save and activate the workflow. Copy the **Production URL** shown by the Webhook node. It should resemble `http://localhost:5678/webhook/devopspilot-pr`.

## 5. Configure GitHub webhook

In the GitHub repository, open **Settings → Webhooks → Add webhook**:

- Payload URL: the n8n production webhook URL. For a local GitHub-to-n8n test, localhost is not reachable from GitHub; use a secure HTTPS tunnel or deploy n8n first.
- Content type: `application/json`
- Events: select **Let me select individual events**, then **Pull requests** only.
- Secret: configure webhook authentication/verification before public use. The included starter workflow does not yet verify GitHub's `X-Hub-Signature-256`; do not treat it as production-secure.

A `pull_request` event should create an execution record visible in the dashboard.

## 6. API endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/health` | No | API health |
| POST | `/api/v1/auth/register` | No | Create account |
| POST | `/api/v1/auth/login` | No | Login and receive JWT |
| GET | `/api/v1/auth/me` | JWT | Current user |
| GET | `/api/v1/repositories` | JWT | List own repositories |
| POST | `/api/v1/repositories` | JWT | Add repository |
| DELETE | `/api/v1/repositories/:id` | JWT | Remove own repository |
| GET | `/api/v1/executions` | JWT | List own executions |
| GET | `/api/v1/executions/stats` | JWT | Dashboard metrics |
| POST | `/api/v1/automation/process-pr` | Internal token | Process n8n PR event |

## 7. Local smoke test

1. Check `GET http://localhost:5000/api/v1/health` returns `{ "status": "ok" }`.
2. Register a user in the frontend.
3. Add a test repository.
4. Import and activate the n8n workflow.
5. Configure the GitHub webhook through a secure public HTTPS endpoint.
6. Open a test pull request and inspect the n8n execution and DevOpsPilot dashboard.

## Security notes

- This is a development MVP, not a production-ready security product.
- Use test repositories and least-privilege GitHub credentials.
- The initial GitHub webhook flow requires signature verification before public exposure. Add a verifier before n8n or implement a verified ingress service.
- The initial execution record is not linked to an authenticated user; user-to-repository ownership mapping is a planned next step. The dashboard only shows records associated with the signed-in user, so implement that mapping before multi-user production use.
- Never commit `.env` files or API tokens.
- AI code review is advisory. Review all findings manually.

## Next development milestones

1. Secure GitHub webhook signature verification and delivery-id idempotency.
2. GitHub App installation and repository ownership mapping.
3. CI status ingestion and deployment monitoring.
4. n8n failure workflow, notifications and retries.
5. Automated tests, Swagger documentation and Dockerized API/frontend.
