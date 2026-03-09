# Shadow Fleet - Minimal Frontend

This is a standalone version of the Shadow Fleet frontend, ready for deployment on platforms like Vercel, Netlify, or GitHub Pages (via static export).

## Prerequisites

- Node.js 18+
- npm or pnpm

## Setup

1.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    # or
    pnpm dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

## Deployment

### Vercel (Recommended)

1.  Push this folder to a GitHub repository.
2.  Import the project into Vercel.
3.  Vercel will automatically detect Next.js and configure the build settings.
4.  Deploy.

### Static Export

To build a static version (HTML/CSS/JS) that can be hosted anywhere:

1.  Run the build command:
    ```bash
    npm run build
    ```

2.  The output will be in the `.next` folder (or `out` directory if `output: 'export'` is configured in `next.config.mjs`).

## Data Structure

The application uses static JSON data for scenarios, located in `public/data/scenarios/`.
- To add new scenarios, add the JSON file to this directory and update the navigation logic if necessary.
