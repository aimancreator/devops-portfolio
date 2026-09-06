# Aiman — Static DevOps portfolio

A React + Vite multipage static site for Cloudflare Pages. Four routes: `/`, `/projects`, `/approach`, and `/about`. Each has its own HTML entry and metadata. Search, project notes, and backend-managed skills run in the browser. No frontend server or Cloudflare Worker is required.

## Local development

Use Node.js 24:

```sh
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:3000. `VITE_API_URL` in `.env` is used in development only. The separate portfolio API defaults to http://localhost:4000.

## Configure the production API

Edit `public/config.json` before building:

```json
{ "apiUrl": "https://api.your-domain.com" }
```

Use a browser-accessible HTTPS API origin. Leave it empty to display the bundled catalog. No localhost API URL is included in production by default. The API must allow your Pages origin in `CORS_ORIGINS`, for example `https://aiman-portfolio.pages.dev`.

Projects come from `/api/projects` and skills from `/api/skills`. Update the backend catalog and restart/redeploy the API, then refresh the portfolio. No frontend rebuild is needed for those live content updates. If the API is unavailable, bundled content remains visible with a fallback label.

`config.json` is a public runtime setting, not a secret store. You can also edit `dist/config.json` after building and before uploading, without rebuilding JavaScript. To change the setting after publishing, upload a new Pages deployment containing the updated file.

## Cloudflare Pages ZIP upload

```sh
npm ci
npm run build
```

The static output is `dist/`. In Cloudflare's Pages **Upload assets** screen, upload this folder or a ZIP of its **contents**. `index.html` must be at the ZIP root, alongside `assets/`, `projects/`, `approach/`, `about/`, and `config.json`.

Do not upload the source folder, `node_modules`, or `.env`. Build tools are not run by direct upload. A ZIP can be generated from the build using the command below.

To create a ZIP yourself on macOS/Linux:

```sh
cd dist
zip -r ../../portfolio-pages.zip .
```

After deployment, open Home, Projects, Approach, and About directly and refresh each page. A custom `404.html` handles unknown routes. `_headers` prevents runtime config caching.

## Cloudflare Pages Git integration

For a separate frontend repository, select **Pages** and connect the repository:

| Setting | Value |
| --- | --- |
| Root | Repository root |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `24` |

There is no Wrangler deploy command. Commit changes to `public/config.json` to update the deployed API address. Direct Upload and Git integration are separate Pages project setup choices.

## Docker static hosting

```sh
docker compose up -d --build
```

Open http://localhost:3000. The build stage compiles the site; the final image serves only static files using unprivileged Nginx on port 8080. Set `public/config.json` before building. Nginx supports direct navigation to each page.

## Content and files

- `components/portfolio-page.tsx`: shared layout and interactions.
- `src/main.tsx`: entry point and route selection.
- `index.html`, `projects/index.html`, `approach/index.html`, `about/index.html`: page entries.
- `app/globals.css`: styles.
- `lib/portfolio.json`: offline catalog.
- `public/config.json`: public API origin.
- `public/og.png`: social preview artwork.

Curated from aimancreator's public GitHub repositories; existing portfolio repositories are excluded. To keep the offline catalog current, copy the API's `data/portfolio.json` to `lib/portfolio.json` and rebuild. Live API skills and project updates do not require this step.

## Validation

```sh
npm run build
docker build -t portfolio-frontend .
```

The build includes TypeScript checking. GitHub Actions validates the build and Docker image; it does not publish automatically.
