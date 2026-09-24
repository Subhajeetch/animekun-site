# Usage

Animekun is a pnpm workspace managed with Turborepo. The repository contains the following applications:

- [`apps/site`](../apps/site/README.md) - the Next.js web application, configured for Cloudflare Workers through OpenNext.
- [`apps/akapi`](../apps/akapi/README.md) - the Hono API service used during local development.

## Prerequisites

Install the following before starting:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 18 or newer
- [pnpm](https://pnpm.io/installation) 9 or newer

## Clone and install

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/Subhajeetch/animekun-site.git
cd animekun-site
pnpm install
```

## Configure the site

The site reads its API URL from an environment variable. Create the local environment file from the example:

```bash
cp apps/site/xx.env.local.example apps/site/.env.local
```

The example points to the local API at `http://localhost:3001`. If you are using a separately hosted API, replace `API_URL` with that API's public URL.

## Run locally

Start all development applications from the repository root:

```bash
pnpm dev
```

> Open the site at [http://localhost:3000](http://localhost:3000). The local API runs at [http://localhost:3001](http://localhost:3001).

You can also run an individual application: (if u want)

```bash
pnpm --filter site dev
pnpm --filter hono dev
```

## Build and check the project

Run the workspace build, lint, or type checks from the repository root:

```bash
pnpm build
pnpm lint
pnpm check-types
```

For application-specific commands and configuration details, read the documentation for the [site app](../apps/site/README.md) and [AKAPI app](../apps/akapi/README.md).

## Application documentation

(For deployment to vercel or cloudflare)

Read each application README for details specific to that application:

- [Deploying and configuring the site](../apps/site/README.md)
- [Running and building AKAPI](../apps/akapi/README.md)
