# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/41c6ebaf-5774-427a-b6a3-7dd083b9e193

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/41c6ebaf-5774-427a-b6a3-7dd083b9e193) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Global Layout Contract (Desktop-only)

- FHD baseline: `fhd` breakpoint at 1920px. No page-level scrollbars at or above FHD.
- One-scroller rule below FHD: page root never scrolls vertically; the page body (active tab content) is the only vertical scroller.
- Sidebar policy: auto-expanded at FHD+, auto-collapsed below FHD (icon-only). Tooltip labels appear in collapsed state.
- Horizontal overflow: prefer inner horizontal scroll inside the body (tables/grids). Page-level horizontal scroll allowed only below 1280px as a last resort.
- All pages adopt the Top/Body pattern via `AppPage`.

### How to build pages with AppPage

Use `AppPage` from `src/components/layout`:

```tsx
import { AppPage } from "@/components/layout";

export default function Example() {
  return (
    <AppPage
      top={<div>Title, stats, breadcrumbs</div>}
      toolbar={<div>Tabs header / filters / actions</div>}
    >
      {/* This is the only vertical scroller below FHD */}
      <div className="overflow-x-auto">
        {/* Tables/grids can scroll horizontally inside */}
      </div>
    </AppPage>
  );
}
```

Behavioral guarantees:

- At/above 1920×1080: no page scrollbars; sidebar expanded; top sections visible.
- 1280–1919px: page has no vertical scrollbar; only `AppPage` body scrolls vertically.
- <1280px: page may scroll horizontally as last resort; prefer inner scroll first.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/41c6ebaf-5774-427a-b6a3-7dd083b9e193) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
