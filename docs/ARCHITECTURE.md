# DevOpsPilot architecture

## Event flow

1. A GitHub repository sends a `pull_request` webhook to the n8n Webhook node.
2. n8n forwards the GitHub event body to `POST /api/v1/automation/process-pr`.
3. The API validates the shared internal automation token.
4. The API fetches changed-file metadata and patches from GitHub using a server-side fine-grained token.
5. The AI review service optionally sends bounded diffs to an OpenAI-compatible chat-completions endpoint.
6. The API stores an execution record in MongoDB and exposes it to the authenticated dashboard.

## Trust boundaries

- GitHub and n8n are external integration boundaries. Use HTTPS and rotate tokens.
- Never expose `GITHUB_TOKEN`, `LLM_API_KEY`, `JWT_SECRET`, or `INTERNAL_AUTOMATION_TOKEN` to the browser.
- The model output is advisory and untrusted. It must not trigger merges, deployments, shell commands, or privileged actions.
- The initial implementation does not post comments to GitHub or merge pull requests.
- Configure the GitHub webhook to send only the `pull_request` event. The n8n webhook should be protected with an authentication mechanism or an unguessable path and network restrictions before public deployment.

## Production hardening backlog

- Verify GitHub webhook HMAC signatures before accepting events (or use a dedicated verification service before n8n).
- Add workspace-scoped repository authorization and map GitHub installations to users.
- Add pagination, retention policies, structured logs, metrics and request tracing.
- Move long-running analysis into a durable worker queue and implement idempotency by GitHub delivery ID.
- Add tests for auth, ownership boundaries, webhook validation, GitHub API failures and AI provider timeouts.
- Use managed secrets, TLS, backups, least-privilege GitHub App permissions and a separate n8n encryption key per environment.
