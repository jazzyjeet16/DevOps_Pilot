# API quick test

Base URL: `http://localhost:5000/api/v1`

## Register

`POST /auth/register`

```json
{ "name": "Dev User", "email": "dev@example.com", "password": "ChangeMe123!" }
```

Copy the returned token and set `Authorization: Bearer <token>` for protected routes.

## Add repository

`POST /repositories`

```json
{ "fullName": "octocat/Hello-World" }
```

## List executions

`GET /executions?limit=10`

## Health

`GET /health`
