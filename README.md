# Call_Template_Single (Next.js)

Minimal Next.js + TypeScript project that calls a reusable CI/CD workflow from a central workflow repository.

## Local Commands

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```

## CI/CD Setup Required

This repository does **not** contain its own workflow definitions.  
Instead, `.github/workflows/fe-pipeline-caller.yml` calls the reusable workflow defined in the configured central workflow repository.

### 1) Required Branches

- `test`
- `uat`
- `main`

### 2) Required Repository Secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- A secret that stores your Vercel Project ID (for example: `VERCEL_PROJECT_ID_FE_SINGLE`)

For PR auto-creation jobs, also provide one of:

- `GH_PR_TOKEN` (preferred), or
- `GHPR_TOKEN` (legacy)

### 3) Required Repository Variable

- `FE_SINGLE_SYSTEM_JSON`
  - A JSON object (or one-item array) with keys: `name`, `dir`, `image`, `vercel_project_secret`.
  - Example: `{"name":"Frontend-Root","dir":".","image":"fe-single-web","vercel_project_secret":"VERCEL_PROJECT_ID_FE_SINGLE"}`

### 4) Update Workflow Reference

In `.github/workflows/fe-pipeline-caller.yml`, verify the `uses:` reference points to your team's approved reusable workflow repository and branch/tag.

Current reference in this template:

- `ImplementSprint/central-workflow/.github/workflows/master-pipeline-fe.yml@main`

If your API/DevOps team uses a different repo or pinned version, update this value before pushing.

### 5) Vercel Project Settings

- Link this repository to a Vercel project.
- Set Vercel Root Directory to `.` for this single frontend setup.

## Notes

- Unit tests generate `coverage/coverage-summary.json` for the test workflow.
- `Dockerfile` is included so the existing Docker build workflow on `main` can run.
- Keep `.github/workflows/fe-pipeline-caller.yml`, `Dockerfile`, and test config files (`jest.config.js`, `jest.setup.ts`) when replacing frontend source files.
