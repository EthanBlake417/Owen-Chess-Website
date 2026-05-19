# Chess Coaching Site — Setup Guide

Stack: **Astro** + **Decap CMS** + **Vercel** + **Cal.com**

- You build and deploy. Your friend edits content via a UI at `/admin`. No code required for him.
- Cal.com handles all 1-on-1 booking and scheduling.

---

## What You Need

**You (the builder):**
- Node.js v18+
- Git
- GitHub account
- Vercel account (sign up at vercel.com with your GitHub)

**Your friend (the content editor):**
- GitHub account (just for CMS login — he never touches code)
- Cal.com account (manages his own availability + bookings)

---

## Step 1 — Create the Astro Project

```bash
npm create astro@latest chess-coaching-site
```

When prompted:
- Choose **A basic template**
- TypeScript: your call, **No** is fine
- Install dependencies: **Yes**

```bash
cd chess-coaching-site
npm run dev
```

Visit `http://localhost:4321` to confirm it's running.

---

## Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
```

Create a new repo on GitHub (github.com → New repository), then:

```bash
git remote add origin https://github.com/YOURUSERNAME/chess-coaching-site.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework preset: select **Astro**
4. Hit **Deploy**

You'll get a live URL immediately. Every `git push` to `main` auto-redeploys.

---

## Step 4 — Add Decap CMS

Decap CMS gives your friend a UI at `/admin` to edit site content. When he saves, it commits to GitHub which triggers a Vercel redeploy. He never touches code.

### Create the admin panel

Create the file `public/admin/index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager</title>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </body>
</html>
```

### Create the CMS config

Create the file `public/admin/config.yml`:

```yaml
backend:
  name: github
  repo: YOURUSERNAME/chess-coaching-site
  branch: main

media_folder: public/images
public_folder: /images

collections:
  - name: pages
    label: Pages
    files:
      - name: home
        label: Home Page
        file: src/content/home.json
        fields:
          - { label: Name, name: name, widget: string }
          - { label: Bio, name: bio, widget: text }
          - { label: Profile Photo, name: photo, widget: image }
      - name: lessons
        label: Lessons Page
        file: src/content/lessons.json
        fields:
          - { label: Intro Text, name: intro, widget: text }
          - label: Packages
            name: packages
            widget: list
            fields:
              - { label: Title, name: title, widget: string }
              - { label: Price, name: price, widget: string }
              - { label: Description, name: description, widget: text }
```

Add more fields to this config as you build out more pages. The config drives what your friend sees in the editor.

### Create the content files

Create `src/content/home.json`:
```json
{
  "name": "Your Friend's Name",
  "bio": "Write a bio here.",
  "photo": ""
}
```

Create `src/content/lessons.json`:
```json
{
  "intro": "Intro text for the lessons page.",
  "packages": [
    {
      "title": "Single Session",
      "price": "$60",
      "description": "One 60-minute coaching session."
    }
  ]
}
```

---

## Step 5 — Set Up CMS Authentication

Decap uses GitHub OAuth to authenticate your friend when he logs into `/admin`.

### Register a GitHub OAuth App

1. Go to GitHub → **Settings** → **Developer Settings** → **OAuth Apps** → **New OAuth App**
2. Fill in:
   - **Homepage URL:** `https://your-vercel-url.vercel.app`
   - **Authorization callback URL:** `https://your-vercel-url.vercel.app/api/auth`
3. Save — you'll get a **Client ID** and **Client Secret**

### Add the Vercel OAuth Adapter

Decap needs a small serverless function to handle the OAuth flow. Use this ready-made adapter:

1. Clone the adapter into your project:
   ```bash
   # Search "decap-cms-oauth-provider vercel" on GitHub
   # Most common one: vencax/netlify-cms-github-oauth-provider
   # Or use the simpler: stereobooster/gatsby-starter-decap-cms-github-oauth
   ```
   The recommended one for Vercel is **`decap-cms-backend-github-oauth-vercel`** — search it on GitHub and follow its 3-step install into your project.

2. Add environment variables in Vercel (Settings → Environment Variables):
   ```
   OAUTH_CLIENT_ID=your_client_id_from_github
   OAUTH_CLIENT_SECRET=your_client_secret_from_github
   ```

3. Redeploy.

After this, your friend can go to `yoursite.com/admin`, click **Login with GitHub**, and edit content.

---

## Step 6 — Embed Cal.com on the Lessons Page

Your friend creates a free account at [cal.com](https://cal.com) and sets his availability there. You just embed it.

In your Astro lessons page (`src/pages/lessons.astro`), add:

```astro
---
// lessons.astro
---

<section>
  <h2>Book a Session</h2>
  <div style="width:100%;height:700px;overflow:scroll">
    <iframe
      src="https://cal.com/YOURFRIENDSUSERNAME"
      frameborder="0"
      style="width:100%;height:100%">
    </iframe>
  </div>
</section>
```

Or get a cleaner embed snippet from Cal.com → **Embed** → **Inline** and paste that instead.

---

## Project Structure (when done)

```
chess-coaching-site/
├── public/
│   ├── admin/
│   │   ├── index.html        ← CMS admin panel
│   │   └── config.yml        ← defines what he can edit
│   └── images/               ← uploaded photos go here
├── src/
│   ├── content/
│   │   ├── home.json         ← edited via CMS
│   │   └── lessons.json      ← edited via CMS
│   ├── layouts/
│   │   └── Layout.astro      ← shared header/footer/nav
│   └── pages/
│       ├── index.astro       ← home page
│       ├── lessons.astro     ← lessons + cal.com embed
│       └── courses.astro     ← optional courses page
├── astro.config.mjs
└── package.json
```

---

## How It All Works Day-to-Day

**Students visiting the site:**
Visit → read about him → go to Lessons → book via Cal.com embed → done.

**Your friend updating the site:**
1. Go to `hissite.com/admin`
2. Log in with GitHub (one click)
3. Edit bio, lesson packages, photos, etc.
4. Hit Save
5. Site rebuilds on Vercel in ~30 seconds

**You making structural changes:**
Edit `.astro` files locally → `git push` → auto-deploys.

---

## Recommended Build Order

1. ✅ Create Astro project and push to GitHub
2. ✅ Connect Vercel — get a live URL
3. ✅ Build the pages (home, lessons, courses) with placeholder content
4. ✅ Embed Cal.com on the lessons page
5. ✅ Add Decap CMS + config
6. ✅ Set up GitHub OAuth for CMS login
7. ✅ Hand off the `/admin` URL to your friend

---

## Useful Links

- [Astro docs](https://docs.astro.build)
- [Decap CMS docs](https://decapcms.org/docs)
- [Cal.com embed docs](https://cal.com/docs/embedding/embedding-options)
- [Vercel + Astro guide](https://vercel.com/docs/frameworks/astro)
