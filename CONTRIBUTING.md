# Contributing to Vida Coach

We welcome improvements and new coaching agents from the community. This guide explains our workflow so your PRs merge smoothly.

## Branching Model
- Start from the latest **`main`** branch.
- Create a feature branch named `feature/<short-desc>` or `fix/<short-desc>`.
- Rebase frequently to keep your branch up to date.

## Commit Style
- Use **Conventional Commits** for clear history.
  - `feat: new orchestration rule`
  - `fix: handle edge case in PDF export`
- Keep commit messages short, present-tense, and descriptive.

## Pull Requests
1. Push your branch and open a PR against `main`.
2. Fill out the PR template with context and testing notes.
3. CI runs backend and frontend tests on every PR.
4. A maintainer will review and merge once checks pass.

## Tests
Run tests locally before opening a PR:
```bash
pytest -q
cd frontend && npm run test:unit
```
Some integration tests rely on network services and may fail in isolated environments. Check `docs/testing_notes.md` for details.

## Pre-commit Hooks
We use [`pre-commit`](https://pre-commit.com/) to enforce formatting and linting.
Install and run hooks with:
```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files
```
Hooks check Python formatting with Black, import order with isort, and basic linting.

## Suggesting New Agents or Orchestration Rules
- Describe your idea in a GitHub issue or discussion.
- Reference existing agents in [`AGENTS.md`](AGENTS.md) and add any new design docs under `docs/agent_design/`.
- Submit a PR with code updates plus documentation for the new agent or orchestration logic.

Thank you for helping make Vida Coach better!
