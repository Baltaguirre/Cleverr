# Branch protection & Git workflow

## Branch model

- **`main`** — stable. Only updated by merging `dev` (or a hotfix) via Pull Request.
- **`dev`** — integration branch. Day-to-day work lands here.
- **feature branches** — branch off `dev`, named `feat/...`, `fix/...`, `chore/...`.

```
feat/xyz ──▶ dev ──▶ main
   (PR)      (PR)
```

### Typical flow

```bash
git checkout dev && git pull
git checkout -b feat/topic-export      # branch off dev
# ...work, commit...
git push -u origin feat/topic-export   # open a PR into dev
# after review + merge, promote when ready:
#   open a PR from dev into main
```

## Recommended protection for `main`

Apply via GitHub UI (Settings → Branches → Add branch ruleset / protection rule) or
with the `gh` command below.

- Require a pull request before merging
- Require at least **1 approving review** (or 0 if you work solo — see note)
- Dismiss stale approvals when new commits are pushed
- Require branches to be up to date before merging
- Require status checks to pass (add the CI check name here once CI exists)
- Require linear history
- Do **not** allow force pushes or deletions

> **Solo-dev note:** GitHub blocks you from approving your own PR. If you work
> alone, set required approvals to **0** but keep "require a PR before merging"
> so `main` still only moves through PRs.

### Apply with the GitHub CLI

Requires a token with the `repo` scope (which the current one has).

```bash
gh api -X PUT repos/Baltaguirre/Cleverr/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

Consider the same, lighter protection on `dev` (require a PR, allow self-merge)
once the workflow settles.
