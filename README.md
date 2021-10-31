# IPO WARNING

Everything that is needed for the app to fully work is present in this repo, with the exception of domain configuration and hosted zone.

We couldn't find a way to edit the defautl NameServers record, and since it is not mandatory for 
the app to fully work we figured it isn't needed for the IaC.

## Guiding principles:
- **TDD**
- **BDD**: Test behaviour, not implmentation details. This means that for example the "unit" lambda tests
are actually integration tests between lambdas and its dependencies (like DB)
- **Unified Infraestrcture as Code**: All infrastructure is written as code so it is easier
to follow and no need to look at external
- **Monorepo**: Everything (but secrets) is in the repo, no need to look absolutely anywhere else
  to start developing and contributing. This includes infrastructure, backend, frontend, and ci/cd pipelines.x