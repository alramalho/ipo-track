# IPO WARNING

## Guiding principles:
- **TDD**
- **BDD**: Test behaviour, not implmentation details. This means that for example the "unit" lambda tests
are actually integration tests between lambdas and its dependencies (like DB)
- **Unified Infraestrcture as Code**: All infrastructure is written as code so it is easier
to follow and no need to look at external
- **Monorepo**: Everything (but secrets) is in the repo, no need to look absolutely anywhere else
  to start developing and contributing. This includes infrastructure, backend, frontend, and ci/cd pipelines.x