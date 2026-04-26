This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Frontend Quality Checks

```bash
npm run lint
npm run build
npm run test:e2e:ui
```

The Playwright suite lives in `e2e/` and uses these environment variables:

- `HMS_WEB_URL`: frontend base URL, default `http://localhost:3000`
- `HMS_API_URL`: backend API base URL, default `http://localhost:8080/api/v1`
- `NEXT_PUBLIC_API_BASE_URL`: client-side API base URL used by the app, default `http://localhost:8080/api/v1`

Available E2E commands:

- `npm run test:e2e:ui`: route smoke, console/runtime, accessibility, responsive, and workflow smoke checks.
- `npm run test:e2e:integrated`: backend-backed auth, claim, logout, and booking request checks. It skips when the backend health endpoint is unavailable.
- `npm run test:e2e:visual`: visual baseline snapshots for the highest-risk pages.
- `npm run test:e2e:headed`: headed local debugging.
- `npm run test:e2e:report`: open the last HTML report.

The UI route audit covers public, staff, patient portal, and admin route families. Tests prefer role, label, and link selectors; add `data-testid` only when semantic selectors are not practical.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
