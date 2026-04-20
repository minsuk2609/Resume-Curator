# Resume Curator

## Pre-push safety check

Run this before `git push` to remove local auth/session artifacts and detect likely secrets in tracked files.

### From the repository root

```bash
./scripts/pre-push-safety.sh
```

### From `server/` or `client/`

```bash
npm run prepush:safety
```

### Is this client-side only?

No. This is a **repository-level** safety script and is intended to protect the entire repo (client + server) before pushing.
