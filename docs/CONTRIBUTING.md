# Contributing to Animekun

Thank you for considering a contribution to Animekun. Bug fixes, features, documentation improvements, and thoughtful feedback are welcome.

## Before you start

Please:

- Search existing [issues](https://github.com/Subhajeetch/animekun-site/issues) and [pull requests](https://github.com/Subhajeetch/animekun-site/pulls) before opening a new one.
- Read the [usage guide](USAGE.md) to understand the local development and deployment setup.
- Be respectful and constructive in issues, pull requests, and discussions.

For small fixes such as documentation updates or clear bug fixes, you can open a pull request directly. For new features, architecture changes, or breaking changes, open an issue first so the approach can be discussed.

## Development setup

### Requirements

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 18 or newer
- [pnpm](https://pnpm.io/installation) 9 or newer

The repository declares pnpm `9.0.0` as its package manager. After installing Node.js, you can enable that version with Corepack:

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

### Fork and clone

1. Fork the [Animekun repository](https://github.com/Subhajeetch/animekun-site/fork).
2. Clone your fork and enter the repository:

```bash
git clone https://github.com/<your-username>/animekun-site.git
cd animekun-site
```

3. Install all workspace dependencies:

```bash
pnpm install
```

4. Create a branch for your change:

```bash
git switch -c type/descriptive-name
```

Use a descriptive branch prefix:

- `feature/` for new functionality
- `fix/` for bug fixes
- `docs/` for documentation changes
- `refactor/` for code refactoring
- `chore/` for maintenance work

### Environment setup

For local site development, create the site environment file:

```bash
cp apps/site/xx.env.local.example apps/site/.env.local
```

The default `API_URL` points to the local AKAPI service at `http://localhost:3001`. Do not commit `.env.local` or other files containing local credentials or secrets.

## Project structure

This repository is a pnpm workspace managed with Turborepo:

```text
.
├── apps/
│   ├── akapi/                 # Hono API service
│   │   ├── src/               # API routes, server, and utilities
│   │   ├── images/            # AKAPI documentation images
│   │   └── README.md          # API setup and deployment notes
│   └── site/                  # Next.js web application
│       ├── src/               # App Router pages, components, and utilities
│       ├── public/            # Static assets served by the site
│       ├── images/            # Site documentation images
│       ├── wrangler.jsonc     # Cloudflare Workers configuration
│       └── README.md          # Site setup and Cloudflare deployment notes
├── assets/                    # Repository-level README assets
├── docs/                      # Contribution and usage documentation
├── packages/
│   ├── anilist/               # Shared AniList functionality and types
│   ├── eslint-config/         # Shared ESLint configurations
│   ├── typescript-config/     # Shared TypeScript configurations
│   └── ui/                    # Shared React UI components
├── package.json               # Root scripts and workspace tooling
├── pnpm-workspace.yaml        # Workspace package globs
└── turbo.json                 # Turborepo task configuration
```

## Making changes

Run the development applications from the repository root:

```bash
pnpm dev
```

The site is available at [http://localhost:3000](http://localhost:3000), and AKAPI runs at [http://localhost:3001](http://localhost:3001).

You can run an individual application when needed:

```bash
pnpm --filter site dev
pnpm --filter hono dev
```

Before submitting a change, run the checks relevant to your work:

```bash
pnpm build
pnpm lint
pnpm check-types
```

Use the repository's existing patterns and shared packages where possible. Update documentation when commands, configuration, user-visible behavior, or deployment steps change. For UI changes, include screenshots or a short recording in the pull request when useful.

## Submitting a pull request

1. Review your changes and remove debug code, generated output, and local environment files.
2. Run the applicable build, lint, and type-check commands.
3. Commit with a clear message.
4. Push your branch:

```bash
git push origin type/descriptive-name
```

5. Open a pull request against the `main` branch.

Include:

- A concise description of the change and its motivation
- Testing or validation commands you ran
- Screenshots for visual changes
- Links to related issues, using `Fixes #123` when appropriate
- Notes about configuration or migration steps, if applicable

## Commit messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```text
type(scope): short description
```

Common types include:

- `feat` - new functionality
- `fix` - a bug fix
- `docs` - documentation changes
- `refactor` - code changes without changing behavior
- `test` - tests or test-related changes
- `chore` - maintenance and dependency updates

Examples:

```text
feat(site): add anime filtering
fix(akapi): handle missing anime results
docs: update Cloudflare deployment steps
```

## Code style

- Use clear, descriptive names.
- Keep functions and components focused.
- Follow the formatting and patterns already used in the surrounding code.
- Add comments only when they clarify non-obvious logic.
- Keep changes focused and avoid unrelated modifications.

Thank you for helping improve Animekun!
