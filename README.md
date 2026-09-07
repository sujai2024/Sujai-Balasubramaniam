# Deploying this site

This is a real, working site: publications archive, blog, and comments with actual
sign-in (via Netlify Identity — free, built into Netlify, no separate service needed).

## 1. Deploy

**Recommended: connect a GitHub repo (needed for the comments feature to work)**
1. Create a new GitHub repo and push this whole folder to it.
2. In Netlify: **Add new site → Import an existing project → GitHub** → pick the repo.
3. Build settings are already set in `netlify.toml` — leave them as detected.
4. Deploy.

Drag-and-drop deploy (Netlify UI) will publish the static pages, but the comments
function needs its dependency (`@netlify/blobs`) installed during a build, which only
happens with a Git-connected deploy or the Netlify CLI (`netlify deploy --build`).

## 2. Turn on sign-in

1. In the Netlify dashboard for this site: **Site configuration → Identity → Enable Identity.**
2. Under **Registration**, choose **Open** (anyone can register) or **Invite only**
   (you invite people by email) — your call.
3. That's it. The "Sign in" button in the top right already talks to this.

## 3. Add your real content

Everything below lives in plain files you edit and redeploy — no database, no admin
panel needed for you specifically (comments from visitors are the one thing stored
dynamically, in Netlify Blobs).

- `public/content/publications.json` — one entry per paper/book. Fields:
  `id` (unique short string), `year`, `title`, `type`, `doi` (optional), `summary`,
  `url` (link to the PDF on Zenodo, ResearchGate, Academia.edu, or wherever it's
  already hosted — the "View / download" button on the archive page opens this).
- `public/content/posts.json` — one entry per blog post. Fields:
  `id`, `title`, `date` (YYYY-MM-DD), `body` (use `\n\n` for paragraph breaks).

Files are not stored in this repo — every publication links out to where it's
already hosted, so there's no size limit to worry about and nothing to re-upload.

After editing, commit and push (or re-deploy) to publish the changes.

## What I need from you to fill this in for real

1. **Your actual publication list** — title, year, venue/journal or "book", DOI if
   any, a one- or two-sentence summary, and the Zenodo / ResearchGate / Academia.edu
   link for each.
2. **Blog posts** — whatever you want to publish first; can start with just one or two.
3. **A profile note for the homepage** — a sentence or two about you if you want
   something different from what's there now.
4. **Registration preference** — should anyone be able to register and comment, or
   should it be invite-only?
5. **Your Netlify account / a GitHub repo** — so this can actually go live. If you
   don't have a GitHub account yet, I can walk you through creating one.

Nothing above is required to preview the site locally — you can open
`public/index.html` in a browser right now to see the layout (comments won't load
until it's deployed, since that needs the live function).
