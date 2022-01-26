# IPO WARNING

Everything that is needed for the app to fully work is present in this repo, with the exception of domain, SSL certificate,  and hosted zone configuration.

We couldn't find a way to edit the defautl NameServers record, and since it is not mandatory for 
the app to work fully we figured it isn't needed for the IaC.

## Guiding principles:
- **TDD**
- **BDD**: Test behaviour, not implementation details. This means that for example the "unit" lambda tests
are actually integration tests between lambdas and its dependencies (like DB). More about this [here](https://alramalho.medium.com/improve-your-codes-maintainability-by-dropping-unit-tests-92f115d5aa6b).
- **Unified Infraestrcture as Code**: All infrastructure is written as code so that nothing gets forgotten.
- **Monorepo**: Everything (but secrets) is in the repo, no need to look absolutely anywhere else
  to start developing and contributing. This includes infrastructure, backend, frontend, and ci/cd pipelines.
