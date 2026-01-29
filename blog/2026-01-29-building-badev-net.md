---
layout: layouts/post.njk
title: "Building badev.net: A Security Guy's Journey Into Static Sites"
date: 2026-01-29
description: "How I built my portfolio site with 11ty, Decap CMS, and Cloudflare Pages—including the setup process, the mistakes, and why I went full cyberpunk."
tags:
  - post
  - 11ty
  - webdev
  - homelab
---

I've been building and breaking things since I was a kid—running game servers in middle school, jailbreaking iPhones, JTAG-modding Xboxes. But I'd never actually built a personal website. After years of working in security operations and building out my home lab, I figured it was time to have a proper online presence. Not for clout, just for documentation. And honestly? I was tired of LinkedIn being my only online presence. A place to put my resume, write about what I'm learning, and maybe help someone else avoid the same rabbit holes I fall into.

This is the story of how badev.net came together.

---

## The Tech Stack

Before diving into the details, here's what I ended up with:

| Component             | Tool                            |
| --------------------- | ------------------------------- |
| Static Site Generator | Eleventy (11ty)                 |
| Templating            | Nunjucks                        |
| CMS                   | Decap CMS                       |
| Hosting               | Cloudflare Pages                |
| Auth                  | Netlify Identity (for CMS only) |
| Domain + SSL          | Cloudflare                      |
| Version Control       | GitHub                          |

Total cost: $0/month (domain registration aside).

Now let me walk through how I set up each piece.

---

## Eleventy (11ty) - The Static Site Generator

I looked at a lot of options. Jekyll, Hugo, Next.js, even just raw HTML. I settled on [Eleventy (11ty)](https://www.11ty.dev/) because it hit the sweet spot: simple enough to not get in my way, flexible enough to grow with me.

The pitch is straightforward—it's a static site generator that takes templates and content files and spits out plain HTML. No client-side JavaScript unless you add it. No database. Just files. That resonated with me. I already deal with enough complexity fighting with legacy physical security systems at AIG. I wanted something that just worked without me having to become an expert in yet another framework.

### Initial Setup

Getting started was quick:

```bash
mkdir badev-net
cd badev-net
npm init -y
npm install --save-dev @11ty/eleventy
```

I added these scripts to `package.json`:

```json
{
  "scripts": {
    "start": "eleventy --serve",
    "build": "eleventy",
    "clean": "rm -rf _site"
  }
}
```

### Project Structure

Here's how I organized everything:

```
badev-net/
├── _data/
│   └── site.json          # Global site config (name, URL, etc.)
├── _includes/
│   └── layouts/
│       ├── base.njk       # Main layout template
│       ├── post.njk       # Blog post layout
│       └── resume.njk     # Resume page layout
├── admin/
│   ├── config.yml         # Decap CMS configuration
│   └── index.html         # CMS admin interface
├── blog/
│   ├── blog.json          # Default front matter for posts
│   └── *.md               # Individual blog posts
├── css/
│   └── style.css          # The cyberpunk madness
├── resume/
│   └── index.md           # Resume content
├── index.md               # Homepage
└── .eleventy.js           # 11ty configuration
```

I went with this structure because I wanted clear separation between content (markdown files), presentation (templates), and configuration. Coming from a security background, I like things organized in a way where I can immediately understand what's what without digging through nested directories.

### The Configuration File

The `.eleventy.js` config handles custom filters, passthrough file copying, and build settings:

```javascript
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Date formatting filter
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });

  // Limit filter for "recent posts" on homepage
  eleventyConfig.addFilter("limit", function (arr, limit) {
    return arr.slice(0, limit);
  });

  // Copy static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("admin");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
    },
  };
};
```

The `postDate` filter uses Luxon to turn ugly ISO dates into something readable. The `limit` filter lets me show only the three most recent posts on the homepage. Neither of these exist in vanilla 11ty—you have to add them yourself. I found this out the hard way when my homepage tried to render a filter that didn't exist and just crashed silently.

---

## Nunjucks - The Templating Engine

11ty supports multiple templating languages. I went with [Nunjucks](https://mozilla.github.io/nunjucks/) because the syntax felt clean and the documentation was solid. If you've never heard of it, think of it like HTML with superpowers—variables, loops, conditionals, includes. It's made by Mozilla and it just works.

I initially considered using Liquid (what Jekyll uses), but Nunjucks felt more like writing actual code. The syntax is intuitive if you've done any server-side templating before.

### Base Layout Template

Everything inherits from `_includes/layouts/base.njk`. This handles the HTML boilerplate, navigation, and footer:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ title }} | {{ site.name }}</title>
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <header>
      <nav>
        <a href="/" class="logo">Badev</a>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/resume/">Resume</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </nav>
    </header>

    <main>{{ content | safe }}</main>

    <footer>
      <p>&copy; {{ site.currentYear }} {{ site.name }}</p>
    </footer>
  </body>
</html>
```

### Blog Post Layout

Individual posts use `_includes/layouts/post.njk`, which extends the base and adds post-specific stuff like date and tags:

```html
---
layout: layouts/base.njk
---

<article class="blog-post">
  <h1>{{ title }}</h1>
  <p class="post-meta">
    {{ date | postDate }} {% if tags %} | Tags: {% for tag in tags %}{% if tag
    != "post" %}{{ tag }}{% endif %}{% endfor %} {% endif %}
  </p>

  {{ content | safe }}

  <a href="/blog/">← Back to all posts</a>
</article>
```

### Blog Index Page

The blog listing at `/blog/` is `blog/index.njk`. It loops through all posts:

```html
---
layout: layouts/base.njk
title: Blog
---

<div class="blog-list">
  <h1>Blog</h1>

  {% for post in collections.posts | reverse %}
  <article class="post-preview">
    <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
    <p class="post-meta">{{ post.date | postDate }}</p>
    {% if post.data.description %}
    <p>{{ post.data.description }}</p>
    {% endif %}
  </article>
  {% endfor %}
</div>
```

The `collections.posts` is automatically created by 11ty because my blog posts have `tags: post` in their front matter.

---

## Decap CMS - Content Management

A static site is great for performance and security, but how do you update content without touching code every time? I wanted to be able to write blog posts from anywhere without opening VS Code.

Enter [Decap CMS](https://decapcms.org/) (formerly Netlify CMS). It's a git-based CMS that gives you a `/admin` interface right on your site. You log in, write a post in a nice editor, hit publish, and it commits the markdown file directly to your GitHub repo. Your site rebuilds automatically.

### Admin Interface Setup

I created `admin/index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager</title>
    <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </body>
</html>
```

### CMS Configuration

The `admin/config.yml` defines what content can be edited and how:

```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "images/uploads"
public_folder: "/images/uploads"

collections:
  - name: "blog"
    label: "Blog Posts"
    folder: "blog"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - {
          label: "Layout",
          name: "layout",
          widget: "hidden",
          default: "layouts/post.njk",
        }
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime" }
      - { label: "Description", name: "description", widget: "string" }
      - { label: "Tags", name: "tags", widget: "list", default: ["post"] }
      - { label: "Body", name: "body", widget: "markdown" }

  - name: "resume"
    label: "Resume"
    files:
      - label: "Resume Content"
        name: "resume"
        file: "resume/index.md"
        fields:
          - {
              label: "Layout",
              name: "layout",
              widget: "hidden",
              default: "layouts/resume.njk",
            }
          - {
              label: "Title",
              name: "title",
              widget: "hidden",
              default: "Resume",
            }
          - { label: "Name", name: "name", widget: "string" }
          - { label: "Body", name: "body", widget: "markdown" }
```

This gives me a nice admin panel at `/admin/` where I can create blog posts and edit my resume without touching the code.

### The OAuth Problem

This is where I fell down a rabbit hole for way too long.

Decap needs an OAuth backend to authenticate you with GitHub. If you're hosting on Netlify, they handle this for you automatically. I'm not on Netlify—I wanted everything on Cloudflare.

I spent probably three hours reading Authentik docs and Decap source code trying to figure out if I could use Authentik (an open-source identity provider I already run in my home lab) as the OAuth server. The problem is that Decap's OAuth flow is pretty specific. It expects certain endpoints and response formats that don't quite match standard OIDC flows. I got close—Authentik could handle the initial auth—but the token exchange kept failing because Decap was looking for GitHub-specific claims in the JWT.

I also explored writing a Cloudflare Worker to act as a proxy between Decap and GitHub's OAuth. Technically possible, but it meant handling token refresh, scope management, and a bunch of edge cases. The complexity wasn't worth it for a personal site.

In the end, I went with Netlify Identity just for the auth piece while hosting the actual site on Cloudflare Pages. A hybrid approach. It's definitely janky. But it works, and I can write blog posts from my phone now, so whatever. One day I might write that Cloudflare Worker to replace this entirely, but for now it's fine.

---

## GitHub - Version Control

Standard Git stuff—nothing worth dwelling on:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/badev-net/badev-net.git
git push -u origin main
```

Every push to `main` triggers a rebuild on Cloudflare Pages. The CMS commits directly to the repo when I publish posts, which also triggers rebuilds. It's a nice loop.

---

## Cloudflare Pages - Hosting

The actual deployment turned out to be the easy part. [Cloudflare Pages](https://pages.cloudflare.com/) connects to your GitHub repo and rebuilds on every push.

### Setup Steps

1. Log into Cloudflare Dashboard
2. Go to Pages → Create a project
3. Connect your GitHub account and select the repo
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `_site`
   - **Root directory:** `/` (leave default)
5. Add environment variable: `NODE_VERSION` = `18`

That's it. Cloudflare handles the build, caching, and CDN distribution.

### Custom Domain

Adding my domain was straightforward:

1. In Pages → your project → Custom domains
2. Add `badev.net`
3. Cloudflare automatically provisions SSL
4. DNS records are added automatically since I use Cloudflare for DNS

No manual certificate management. No nginx config. It just works.

---

## Netlify Identity - CMS Authentication

Since Decap CMS needs OAuth to authenticate with GitHub, and I didn't want to build my own auth server, I used Netlify Identity as a standalone service.

### Setup

1. Create a Netlify account (free tier works)
2. Create a new site (can be empty—just needs Identity enabled)
3. Go to Site Settings → Identity → Enable Identity
4. Under Registration, set to "Invite only"
5. Enable Git Gateway under Identity → Services
6. Invite yourself via email

The Identity widget in my `admin/index.html` handles the login flow. When I authenticate, it gives Decap the token it needs to commit to GitHub.

---

## The Design Evolution

This is where things went sideways—in a good way.

### Phase 1: Clean and Professional

My first instinct was to keep it boring. ATS-friendly. Sans-serif fonts, lots of whitespace, neutral colors. I was building this partly as a portfolio for job hunting, so I figured recruiters would appreciate something clean.

### Phase 2: Let's Add Some Polish

Clean got boring fast. I added a purple-blue gradient background, some card-based layouts, better typography. It looked fine. Generic, but fine.

### Phase 3: Full Cyberpunk

Then I said screw it.

I work in security. I've been hacking on hardware since I was a teenager. I have a server rack in my apartment with a 24-bay Dell PowerEdge R720 that doubles as a space heater for my 3D printer enclosure. The safe corporate design was the lie. This is who I actually am.

I went full terminal aesthetic:

- **Colors:** Neon cyan (`#00d9ff`) and green (`#00ff41`) on black
- **Fonts:** [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) for body text, [Orbitron](https://fonts.google.com/specimen/Orbitron) for headings
- **Effects:** Animated scanlines, grid overlays, glitch animations
- **Details:** Terminal-style borders with labels like `[ $ whoami ]` and `[ SYSTEM ONLINE ]`

Is it ATS-friendly? Absolutely not. Does it represent who I actually am? Yeah.

The CSS for this is borderline excessive. Animated scanlines that scroll slowly across the page. A grid overlay that gives everything a retro CRT feel. Neon glow effects on hover states. It's ridiculous and I love it.

---

## The Bugs

No project is complete without a troubleshooting section. Here's what broke:

### Blank Pages Everywhere

At one point my entire site was just white pages. No errors in the console, nothing in the build logs—just nothing. I clicked around for a good 10 minutes thinking maybe it was a caching issue before I realized my layout files existed but were completely empty. 11ty doesn't complain; it just renders... nothing.

**Fix:** Actually put content in the layout files. Yeah. I felt like an idiot for about five minutes.

### Missing Blog Index

I could visit individual blog posts at `/blog/2026-01-17-welcome/` but `/blog/` itself 404'd. I'd forgotten to create `blog/index.njk`. The listing page that shows all posts isn't magic—you have to build it.

**Fix:** Create `blog/index.njk` with a loop through `collections.posts`.

### The `limit` Filter

My homepage was supposed to show the three most recent posts. It crashed because I tried to use a `| limit(3)` filter that doesn't exist in vanilla 11ty.

**Fix:** Add the filter to `.eleventy.js`:

```javascript
eleventyConfig.addFilter("limit", function (arr, limit) {
  return arr.slice(0, limit);
});
```

### Date Formatting

11ty doesn't format dates nicely out of the box. A post dated `2026-01-17` would show up as a raw ISO string.

**Fix:** Install Luxon and add a custom `postDate` filter.

### Mobile Navigation

The hamburger menu wasn't closing when you tapped a link. Had to add some JavaScript to handle the overlay state and accessibility (aria-expanded, Escape key to close).

---

## What's Next

This site is a work in progress. Some things I want to add:

- **A projects section** showcasing my home lab setup—the PowerEdge server, pfSense with Suricata IDS/IPS, the VLAN segmentation, the self-hosted services (Mailcow, honeypots, Plex)
- **More blog posts** about actual security topics, not just meta posts about building the site
- **A custom OAuth Worker** to replace Netlify Identity and have the whole stack on Cloudflare

I'm also considering writing about the home lab in more detail. Running your own mail server with proper SPF/DKIM/DMARC, setting up Suricata rules, segmenting IoT devices onto their own VLAN—that kind of stuff.

---

## Final Thoughts

Building this site reminded me why I got into tech in the first place. Not because I had to, but because I wanted to see what I could make. It's the same reason I ran game servers as a kid, the same reason I have an overcomplicated home lab, the same reason I spend my free time cloning access cards with a Proxmark.

If you're thinking about building your own site, here's what I'd tell you: just start. Use 11ty if you want simplicity. Use something else if you don't. The tools matter less than the act of building.

---

_This post was written in Decap CMS and deployed automatically via Cloudflare Pages. The source is on [GitHub](https://github.com/badev-net). If you spot something broken, that's probably my fault._
