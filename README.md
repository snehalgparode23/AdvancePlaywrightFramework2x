# Advance Playwright Framework 2x

A production-ready, advanced test automation framework built on [Playwright](https://playwright.dev/) with TypeScript. It follows the **Page Object Model** and is designed for scalable UI, API, and data-driven testing with rich reporting, logging, schema validation, and CI/CD support.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running Tests](#running-tests)
- [API Testing](#api-testing)
- [Test Reports](#test-reports)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Dependencies Overview](#dependencies-overview)
- [Contributing](#contributing)
- [License](#license)

## Features

- **TypeScript** — fully typed tests and helpers for better maintainability
- **Page Object Model (POM)** — clean separation between test logic and page interactions
- **API Testing** — layered REST API testing built on Playwright's `request` context:
  - **`ApiHelper`** — thin HTTP wrapper for GET/POST/PUT/PATCH/DELETE with query params, headers, timeouts, retry-with-polling, and status predicates
  - **Service objects** — one class per resource (e.g. `BookingApi`) with typed request/response shapes, so specs read as intent rather than raw HTTP
  - **Managed auth** — tokens cached and minted on first use, with automatic re-auth and retry on `403`; pass an explicit token to opt out (needed for negative tests)
  - **Fixtures** — `bookingApi` / `bookerToken` injected per test via a custom `test`
  - **Negative-path coverage** — raw `*Response()` methods expose statuses so rejections can be asserted without the service object throwing
- **Data-Driven Testing** — read test data from CSV, Excel (`.xlsx`), JSON, and YAML
- **Dynamic Test Data** — realistic mock data generation with Faker, plus primitives (`number`, `bool`, `dateOffset`, `oneOf`) and per-resource builders that keep randomness in one place
- **Schema Validation** — runtime JSON Schema validation for API responses using Ajv with `ajv-formats`, reporting every violation at once with readable field paths
- **JSONPath Querying** — extract and assert on nested JSON using `jsonpath-plus`
- **Centralized Configuration** — environment-driven `BASE_URL` resolution (QA, staging, prod, dev, API)
- **Structured Logging** — Winston-based logging with configurable log levels
- **Custom TTA Reporter** — real-time HTML report with test steps, screenshots, videos, traces, console logs, and AI verdict/flaky tabs
- **AI Root-Cause Analysis** — heuristic RCA agent that classifies failed tests and suggests fixes
- **Flaky Test Analyzer** — diffs this build against the previous one to highlight flaky tests
- **Allure Reporting** — rich, interactive test reports via Allure
- **HTML & List Reporters** — built-in Playwright reports out of the box
- **Parallel Execution** — fully parallel test execution across workers
- **Retries & Tracing** — automatic retries on CI and trace capture on retry
- **CI/CD Ready** — GitHub Actions workflow for automated test runs
- **Priority-Based Test Selection** — run tests by priority tags (`@p1`, `@p2`, `@p3`)

## Tech Stack

| Category           | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Test Runner        | Playwright Test                                 |
| Language           | TypeScript                                      |
| Framework Pattern  | Page Object Model (POM)                         |
| API Testing        | Playwright Request / `restful-booker` sample API |
| Data Parsing       | `csv-parse`, `xlsx` (Excel)                     |
| Data Generation    | `@faker-js/faker`                               |
| JSON Queries       | `jsonpath-plus`                                 |
| Schema Validation  | `ajv`, `ajv-formats`                            |
| Logging            | `winston`                                       |
| Configuration      | `dotenv`                                        |
| Reporting          | Allure (`allure-playwright`), HTML, List        |
| CI/CD              | GitHub Actions                                  |

## Project Structure

```
AdvancePlaywrightFramework2x/
├── .github/
│   └── workflows/
│       └── playwright.yml          # CI pipeline: install, run tests, upload report
├── docs/                           # Project documentation
├── rules/                          # Coding rules & conventions
├── src/
│   ├── ai/                         # AI-powered analysis agents
│   │   ├── agents/
│   │   │   ├── rcaAgent.ts         # Root-cause analysis for failed tests
│   │   │   └── flakyAnalyzer.ts    # Build-vs-build flaky test detection
│   │   └── config/
│   │       └── providers.ts        # LLM provider key detection
│   ├── api/                        # API service objects (one class per resource)
│   │   └── BookingApi.ts           # restful-booker booking CRUD + token lifecycle
│   ├── config/                     # Centralized configuration & environment handling
│   │   ├── env.ts                  # dotenv helpers: requireEnv / envOr / assertEnv
│   │   └── credentials.ts          # Credentials resolved from .env
│   ├── fixtures/                   # Custom Playwright fixtures (test hooks, auth state)
│   │   ├── test-base.ts            # Extended `test` with page-object fixtures
│   │   └── booker.fixture.ts       # `bookingApi` + `bookerToken` API fixtures
│   ├── pages/                      # Page Object classes (UI automation)
│   │   ├── BasePage.ts             # Base class: navigation, logging, element helpers
│   │   ├── LoginPage.ts            # TTACart login screen
│   │   ├── InventoryPage.ts        # Product listing screen
│   │   ├── ItemDetailPage.ts       # Single product detail screen
│   │   ├── CartPage.ts             # Shopping cart screen
│   │   ├── CheckoutStepOnePage.ts  # Checkout information form
│   │   ├── CheckoutStepTwoPage.ts  # Checkout overview screen
│   │   └── CheckoutCompletePage.ts # Order confirmation screen
│   ├── testdata/                   # Test data files (CSV, Excel, JSON, YAML)
│   │   ├── booking.data.ts         # Booking builders (generated / pinned dates)
│   │   ├── logintestdata.json      # Login test data
│   │   └── schemas/                # JSON Schemas for response validation
│   │       └── create-booking.schema.json
│   ├── tests/                      # Test specs (*.spec.ts)
│   │   ├── apisTests/              # REST API specs, layered as levels 1-5
│   │   │   ├── 01_restfulbooker_raw/       # Raw `request` calls
│   │   │   ├── 02_restfulbooker_apiHelper/ # Via ApiHelper
│   │   │   ├── 03_restfulbooker_fixture_e2e_api/ # Fixture-driven CRUD + negative paths
│   │   │   ├── 04_jsonpath_plus/           # JSONPath queries
│   │   │   └── 05_ajv_json_schema/         # JSON Schema validation
│   │   ├── e2e/                    # End-to-end checkout specs
│   │   │   ├── e2e-checkout.spec.ts           # Checkout flow (@P0)
│   │   │   ├── e2e-checkout-env.spec.ts       # .env-driven checkout (@P0)
│   │   │   └── e2e-checkout_new_fixture.spec.ts
│   │   └── login/
│   │       └── login.spec.ts       # TTACart login flow (@p0)
│   └── utils/                      # Reusable utilities
│       ├── ApiHelper.ts            # HTTP wrapper (methods, retry, status helpers)
│       ├── CustomReporter.ts       # Real-time TTA HTML reporter
│       ├── DataGenerator.ts        # Test data factories
│       ├── SchemaValidator.ts      # Ajv runtime JSON Schema validation
│       ├── UtilElementLocator.ts   # Element interaction helpers
│       ├── visualStep.ts           # Visual step helper for reports
│       └── logger.ts               # Winston logger (console + file)
├── .claude/                        # Claude Code skills & commands
│   ├── commands/
│   │   └── gogo.md
│   └── skills/                     # 12 Playwright-focused skills (page objects, fixtures,
│                                   #   flaky debugging, network mocking, visual regression, ...)
├── learnings/                      # Framework learnings & patterns
├── .env                            # Environment variables (not committed)
├── .env.example                    # Committed example env file
├── .gitignore                      # Git ignore rules
├── package.json                    # Project manifest & scripts
├── playwright.config.ts            # Playwright configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

### Directory Conventions

- **`src/pages/`** — one class per page, encapsulating selectors and interactions
- **`src/tests/`** — test specs only; keep assertions and business logic out of selectors
- **`src/testdata/`** — externalized test inputs so tests stay data-driven
- **`src/fixtures/`** — shared setup/teardown and reusable test fixtures
- **`src/api/`** — one service object per API resource (e.g. `BookingApi`); endpoints, typed payloads, and auth live here, never in specs
- **`src/utils/`** — cross-cutting helpers (logging, JSON parsing, data factories, schema validation)

### Path Aliases

Imports use the aliases declared under `paths` in `tsconfig.json`, so specs never reach across the tree with `../../`:

| Alias | Resolves to |
| ----- | ----------- |
| `@api/*` | `src/api/*` |
| `@config/*` | `src/config/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@pages/*` | `src/pages/*` |
| `@testdata/*` | `src/testdata/*` |
| `@utils/*` | `src/utils/*` |

```ts
import { test, expect } from '@fixtures/booker.fixture';
import { buildBooking } from '@testdata/booking.data';
import { SchemaValidator } from '@utils/SchemaValidator';
```

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (comes with Node.js)
- A supported browser (Chromium is configured by default; others can be added)

## Installation

```bash
# Install project dependencies
npm install

# If your environment sets NODE_ENV=production, include dev dependencies explicitly
npm install --include=dev

# Install Playwright browsers (Chromium by default)
npx playwright install
```

## Environment Configuration

Copy the values from `.env` (or create your own) and set the environment you want to target:

| Variable        | Description                                             | Default                        |
| --------------- | ------------------------------------------------------- | ------------------------------ |
| `TTA_ENV`       | Target environment: `qa`, `dev`, `stg`, `prod`, `api`   | `qa`                           |
| `BASE_URL`      | Overrides the base URL entirely                         | *(unset)*                      |
| `QA_BASE_URL`   | Base URL for the QA environment                         | `https://app.thetestingacademy.com` |
| `STG_BASE_URL`  | Base URL for staging                                    | `https://stage.thetestingacademy.com` |
| `PROD_BASE_URL` | Base URL for production                                 | `https://app.thetestingacademy.com` |
| `DEV_BASE_URL`  | Base URL for local development                          | `http://localhost:3000`        |
| `API_BASE_URL`  | Base URL for API tests                                  | `https://restful-booker.herokuapp.com` |
| `LOG_LEVEL`     | Winston log level (`info`, `debug`, `error`, etc.)      | `info`                         |
| `TEST_ENV`      | Human-readable test environment label                   | `QA`                           |
| `TEST_AUTHOR`   | Test author name for reporting                          | *(unset)*                      |
| `USERNAME`      | Username for authenticated flows                        | `admin`                        |
| `PASSWORD`      | Password for authenticated flows                        | `ADMIN123`                     |
| `ATTACH_SCREENSHOTS` | Attach screenshots on failure (`true`/`false`)     | `false`                        |
| `STANDARD_USER` | Standard user for checkout specs                        | `standard_user`                |
| `TTA_SECRET`    | Password for the standard user                          | `tta_secret`                   |
| `CHECKOUT_ITEM_ID` | Inventory item to add during checkout              | `test-allthethings-tshirt-red` |
| `CHECKOUT_FIRST_NAME` | Checkout first name (falls back to Faker)       | *(unset)*                      |
| `CHECKOUT_LAST_NAME`  | Checkout last name (falls back to Faker)        | *(unset)*                      |
| `CHECKOUT_POSTAL_CODE`| Checkout postal code (falls back to Faker)      | *(unset)*                      |

> **Note:** `.env` is gitignored and must never be committed to the repository.

### Environment Resolution Logic

The base URL is resolved in `playwright.config.ts`:

1. If `BASE_URL` is set, it wins.
2. Otherwise, `TTA_ENV` selects the matching environment:
   - `api` → `API_BASE_URL`
   - `dev` / `local` → `DEV_BASE_URL`
   - `stg` / `stage` / `staging` → `STG_BASE_URL`
   - `prod` / `production` → `PROD_BASE_URL`
   - `qa` (default) → `QA_BASE_URL`

## Running Tests

```bash
# Run all tests
npx playwright test

# Run a single test file
npx playwright test src/tests/e2e/e2e-checkout.spec.ts

# Run the env-driven checkout spec (requires STANDARD_USER, TTA_SECRET, CHECKOUT_ITEM_ID in .env)
npx playwright test src/tests/e2e/e2e-checkout-env.spec.ts

# Run every API spec (all levels)
npx playwright test src/tests/apisTests

# Run one API level, e.g. the fixture-driven e2e CRUD suite
npx playwright test src/tests/apisTests/03_restfulbooker_fixture_e2e_api

# Smoke-check the restful-booker API is reachable
npm run test:ping

# Run with headed browser (watch the test live)
npx playwright test --headed

# Run in debug mode (with Playwright Inspector)
npx playwright test --debug

# Run only priority 1 tests
npm run test:p1

# Run only priority 2 tests
npm run test:p2

# Run only priority 3 tests
npm run test:p3

# Run all priorities sequentially (P1 → P2 → P3)
npm run test:priority
```

### Test Priority Tagging

Tests can be tagged with priority annotations to enable selective execution:

```ts
test('login with valid credentials @p1', async ({ page }) => {
  // ...
});
```

| Script            | Command                                      |
| ----------------- | -------------------------------------------- |
| `test:p1`         | `npx playwright test --grep @p1`             |
| `test:p2`         | `npx playwright test --grep @p2`             |
| `test:p3`         | `npx playwright test --grep @p3`             |
| `test:priority`   | Runs P1, then P2, then P3 sequentially       |

### Configuration Highlights (`playwright.config.ts`)

| Setting               | Value                                        |
| --------------------- | -------------------------------------------- |
| `testDir`             | `./src/tests`                                |
| Test timeout          | 60 seconds                                   |
| Expect timeout        | 10 seconds                                   |
| Parallel execution    | Fully parallel                               |
| Retries (CI)          | 2 retries on CI, 0 locally                   |
| Headless              | `false` (headed by default)                  |
| Screenshots           | On failure only (when `ATTACH_SCREENSHOTS=true`) |
| Video                 | Recorded for every test                      |
| Trace                 | Recorded for every test                      |
| Reporters             | HTML + List + Custom TTA Reporter           |
| Default project       | Chromium (Desktop Chrome)                    |

## API Testing

API specs live under `src/tests/apisTests/` and are layered so each level adds one concept, using the public [restful-booker](https://restful-booker.herokuapp.com) API.

| Level | Folder | What it demonstrates |
| ----- | ------ | -------------------- |
| 1 | `01_restfulbooker_raw/` | Raw `request` calls: ping, POST, isolated `newContext` headers, PUT, and a full CRUD chain |
| 2 | `02_restfulbooker_apiHelper/` | The same calls routed through `ApiHelper` |
| 3 | `03_restfulbooker_fixture_e2e_api/` | `BookingApi` + fixtures for a full lifecycle (create → update → read back → delete) and negative paths |
| 4 | `04_jsonpath_plus/` | Querying responses with JSONPath — dot paths, wildcards, recursive descent, array index/slice/filter |
| 5 | `05_ajv_json_schema/` | Validating a response against a JSON Schema with Ajv |

### Service objects and auth

`BookingApi` (`src/api/BookingApi.ts`) owns the endpoints and the token lifecycle:

```ts
// Managed token: minted on first use, cached, and re-minted once on a 403.
const updated = await bookingApi.updateBooking(id, payload);

// Explicit token opts out of auto-renewal — needed to assert a 403 honestly.
const response = await bookingApi.updateBookingResponse(id, payload, 'not-a-real-token');
expect(response.status()).toBe(403);
```

Typed methods (`createBooking`, `getBooking`, …) parse the body and **throw** on a non-2xx, so a failure can't masquerade as a `Booking`-shaped lie. The parallel `*Response()` methods return the raw `APIResponse` when you need to assert a status directly.

> restful-booker does not behave the way you would guess, and the specs encode the real behaviour: a bad token is **403** (not 401), a malformed payload is **500** (not 400), and bad credentials return **200** with `{ reason: "Bad credentials" }` — so `/auth` checks the body for a token rather than trusting the status.

### Fixtures

`src/fixtures/booker.fixture.ts` exposes:

| Fixture | Description |
| ------- | ----------- |
| `bookingApi` | A `BookingApi` instance bound to the test's `request` context |
| `bookerToken` | A token from `POST /auth`, resolved before the test body |

```ts
import { test, expect } from '@fixtures/booker.fixture';

test('create then delete', async ({ bookingApi, bookerToken }) => {
  const { bookingid } = await bookingApi.createBooking(buildBookingFromGenerator());
  expect(await bookingApi.deleteBooking(bookingid, bookerToken)).toBe(201);
});
```

A fixture resolves once, before the test body, so it can't react to a token that expires mid-test — that recovery lives in the service object instead.

### Test data

`src/testdata/booking.data.ts` builds payloads from `DataGenerator`, so all randomness comes from one place. `buildBookingFromGenerator()` derives check-out from check-in (so the dates are always in order) and keeps check-in relative to today; `buildBooking()` pins check-in to a fixed date for specs that assert on a literal.

### Schema validation

`SchemaValidator` (`src/utils/SchemaValidator.ts`) is the **runtime** counterpart to the TypeScript interfaces — an `interface` is erased at compile time, so casting a response to one proves nothing about what the server sent:

```ts
import createBookingSchema from '@testdata/schemas/create-booking.schema.json';

SchemaValidator.assertValid(createBookingSchema, body, 'POST /booking');
```

It reports **every** violation at once, with the offending field named rather than a bare `instancePath`.

## Test Reports

### Custom TTA Reporter

The framework ships a custom HTML reporter (`src/utils/CustomReporter.ts`) that generates a real-time, self-refreshing report into `tta-report/`:

- **Live summary** — total / passed / failed / skipped, pass rate, duration, environment
- **Per-test details** — collapsible sections for errors, call stacks, step-by-step console logs, screenshots, videos, and traces
- **AI Verdict tab** — root-cause analysis verdicts for failed tests (severity, priority, cause, fixes)
- **AI Data tab** — AI-generated test data captured via `ai-data` attachments
- **Flaky tab** — build-vs-build comparison highlighting flaky and consistently failing tests
- **Report history** — `tta-report/history.html` lists every generated run, with `index.html` redirecting to the latest

> The report artifacts are gitignored (`/tta-report/`). Open `tta-report/index.html` after a run.

### HTML Report

After a run, open the interactive Playwright HTML report:

```bash
npx playwright show-report
```

### Allure Report

To generate and serve an Allure report:

```bash
# Generate the Allure results (add the allure reporter to playwright.config.ts)
npx playwright test

# Generate the report from the results directory
allure generate ./allure-results --clean -o ./allure-report

# Serve the report locally
allure open ./allure-report
```

### AI Features

The custom reporter's AI tabs are driven by `src/ai/`:

- **`rcaAgent.ts`** — classifies failed tests into severity/priority buckets and suggests fixes (heuristic, works offline)
- **`flakyAnalyzer.ts`** — diffs per-test statuses against the previous run stored in `reports/runs/` and reports flaky tests
- **`providers.ts`** — checks for LLM API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.); when a key is set, analyzers can be extended to call a model

## CI/CD with GitHub Actions

The repository includes a CI workflow at `.github/workflows/playwright.yml`:

- **Triggers:** pushes and pull requests to `main` / `master`
- **Runs on:** `ubuntu-latest` (Node.js LTS)
- **Steps:**
  1. Check out the code
  2. Set up Node.js
  3. Install dependencies (`npm ci`)
  4. Install Playwright browsers with OS dependencies
  5. Run all Playwright tests
  6. Upload the `playwright-report/` artifact (retained 30 days)

## Dependencies Overview

### Dev Dependencies

| Package             | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `@playwright/test`  | Playwright test runner                         |
| `@faker-js/faker`   | Generate realistic test data                   |
| `ajv`               | JSON schema validation                         |
| `ajv-formats`       | Format support for Ajv (dates, emails, etc.)   |
| `allure-playwright` | Allure reporter integration                    |
| `csv-parse`         | Parse CSV test data                            |
| `dotenv`            | Load environment variables from `.env`         |
| `exceljs`           | Read/write Excel files                         |
| `js-yaml`           | Parse YAML test data                           |
| `jsonpath-plus`     | Query nested JSON structures                   |
| `mysql2`            | Database interactions for test setup           |
| `winston`           | Structured logging                             |
| `xlsx`              | Parse Excel (`.xlsx`) test data                |
| `@types/node`       | TypeScript types for Node.js                   |
| `@types/js-yaml`    | TypeScript types for `js-yaml`                 |

### Dependencies

| Package     | Purpose                                   |
| ----------- | ----------------------------------------- |
| `googleapis` | Google API client (e.g., Sheets)          |

## Contributing

1. Fork the repository and create a feature branch.
2. Follow the existing code conventions and the rules in the `rules/` directory.
3. Keep tests data-driven — put test data in `src/testdata/`.
4. Add or update tests for any new functionality.
5. Run `npx tsc --noEmit` to ensure types are valid before pushing.
6. Open a pull request with a clear description of the change.

## License

ISC
