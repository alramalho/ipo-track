![](media/ipo-bg.png)
# URL changed to [ipo-track.alexramalho.dev](https://ipo-track.alexramalho.dev/)
---
[![Netlify Status](https://api.netlify.com/api/v1/badges/0ea084ae-a6d4-4e6e-a728-d7b0209849a5/deploy-status)](https://app.netlify.com/sites/ipo-track/deploys)


### Welcome to Ipo-track repo!

Here you can find all the inner workings of this application.
Everything that it needs to fully work is present, with the exception of domain, SSL certificate,  and frontend distribution. This was done in Netlify in order to participate in the [Hashnode/Netlify hackathon](https://townhall.hashnode.com/netlify-hackathon)


# Guiding principles:
- **TDD**
- **BDD**: Test behaviour, not implementation details. This means that for example the "unit" lambda tests
are actually integration tests between lambdas and its dependencies (like DB). More about this [here](https://alramalho.medium.com/improve-your-codes-maintainability-by-dropping-unit-tests-92f115d5aa6b).
- **Unified Infraestrcture as Code**: All infrastructure is written as code so that nothing gets forgotten.
- **Monorepo**: Everything (but secrets) is in the repo, no need to look absolutely anywhere else
  to start developing and contributing. This includes infrastructure, backend, frontend, and ci/cd pipelines.

  
# Environment setting:

### CI/CD 

- In order to login into netlify from the CI/CD, you need to provide `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` 

### Shared (CI and local)

- In order to use AWS services, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` need to be provided
- In order for the backend to consume IPO's api, `DATA_API_URL` needs to be provided
  - This is dummy in sandbox and github secret `RAPID_API_KEY` in production (Stock analysis [IPOs API](https://rapidapi.com/stock-analysis-stock-analysis-default/api/upcoming-ipo-calendar))

There is also a friendly reminder of that when you do `cdk deploy` to deploy it into AWS.

# 🏆 Awarded _A_ class on [MPM](https://alramalho.medium.com/the-maintainable-program-manifesto-mpm-3ba5239f7a8)
