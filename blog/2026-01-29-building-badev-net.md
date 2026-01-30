---
layout: layouts/post.njk
title: "Building badev.net: A Security Guy's Journey Into Static Sites"
date: 2026-01-29
description: "How I built my portfolio site with 11ty, Decap CMS, and Cloudflare Pages—including the struggles, the infrastructure rabbit holes, and why I went full cyberpunk."
tags:
  - post
  - 11ty
  - webdev
  - homelab
---

## Why I Finally Built a Personal Site

I've been building and breaking things since before I knew what a career in tech looked like.

At twelve years old, I was running a Minecraft server with 40-50 concurrent players. I wrote custom plugins, handled donations, and learned that infrastructure doesn't care if you're in middle school if your server goes down during peak hours, forty angry kids are going to let you know about it. That taught me more about uptime and user management than any class ever did.

Garry's Mod came next, and that's where things got real. I partnered with a friend who handled the customer facing side—support tickets, ban appeals, the donation/rank system while I ran all of the technical/backend. We had three game modes running simultaneously, somewhere between 150-200 concurrent players across all servers. For a couple of middle schoolers, we were basically running a small business. While didn't realize it at the time, I was learning server administration, database management, and how to keep comoplex systems stable under load.

Then came Rust during its beta days. Fifty to a hundred players on one server, back when the game was still figuring out what it wanted to be. Most of those players eventually moved on before the game officially released, but I'd already caught the bug. I liked making things work.

Between the game servers, jailbreaking every iPhone I could get my hands on, rooting Android devices, and JTAGing Xboxes. If there was firmware to poke at or a bootloader to unlock, I was there. Hardware hacking wasn't a skill I learned for a job, it was just what I did for fun.

Fast forward to now. I work in physical security systems at AIG during the day, I've got a 24-bay Dell PowerEdge R720 that doubles as a space heater for my 3D printer, and I run a home lab with more VLANs than the corporate global network I support at work. But I'd never built a personal website. I intentionally kept my online presence minimal with no social media footprint, and no public profiles beyond what was necessary, that was deliberate.

I finally decided to change that. Not for clout or SEO, but to document what I'm learning and maybe help someone else navigate these topics. Privacy used to be the default state of existence. You had to actively seek someone out to learn about them. Now it's inverted. Surveillance capitalism has normalized mass data collection to the point where opting out is treated as suspicious. We live in what security researchers call a "glass house" environment, where the assumption is that everything is visible unless you take extraordinary measures to prevent it. The asymmetry is staggering: corporations and governments have unprecedented access to personal information while individuals have almost no visibility into how that data is used, sold, or weaponized. This site exists partly to push back against that, to talk about threat modeling, operational security, and the kind of defensive thinking that shouldn't be necessary but increasingly is.

---

## The Tech Stack

Here's what I ended up with:

| Component             | Tool                   |
| --------------------- | ---------------------- |
| Static Site Generator | Eleventy (11ty)        |
| Templating            | Nunjucks               |
| CMS                   | Decap CMS              |
| Hosting               | Cloudflare Pages       |
| CMS Auth              | Netlify Identity       |
| Domain + SSL          | Cloudflare             |
| Contact Form Backend  | Python Flask + Mailcow |
| Version Control       | GitHub                 |

Total cost: $0/month (domain registration aside). The contact form runs on infrastructure I already had in my home lab.

---

## Eleventy (11ty) — Keeping It Simple

I looked at a lot of options. Jekyll felt dated. Hugo seemed fast but the templating language was unfamiliar. Next.js was overkill for what I needed—I didn't want to manage React for a portfolio site. Even raw HTML crossed my mind, but I knew I'd regret that the moment I wanted a blog.

I settled on Eleventy because it hit the sweet spot: simple enough to not get in my way, flexible enough to grow with me. It takes templates and content files and spits out plain HTML. No client-side JavaScript unless you add it. No database. Just files.

That resonated with me. I spend my days at work dealing with legacy physical security systems, fighting with proprietary protocols and vendor lock-in. The last thing I wanted was to fight a framework on my personal time.

Setting up 11ty took about ten minutes. Create a directory, run `npm init`, install Eleventy, add some scripts to package.json, and you're building. The real time sink was figuring out the project structure that made sense for my brain.

I organized everything with clear separation: `_data` for global config, `_includes/layouts` for templates, `blog` for posts, `admin` for the CMS interface. Coming from a security background where I need to understand what's what at a glance, I wanted a structure where I could immediately tell where things lived without digging through nested directories.

The configuration file handles custom filters and passthrough copying. I added a `postDate` filter using Luxon because 11ty doesn't format dates nicely out of the box, and a `limit` filter to show only recent posts on the homepage. Neither of these exist in vanilla 11ty—I discovered that the hard way when my homepage crashed trying to use a filter that didn't exist. It just crashed silently. No helpful error message. Just nothing.

---

## Nunjucks — Templates That Make Sense

11ty supports multiple templating languages. I went with Nunjucks because the syntax felt clean and the documentation was solid. If you've never heard of it, think of it like HTML with superpowers—variables, loops, conditionals, includes. It's made by Mozilla and it just works.

Everything inherits from a base layout that handles the HTML boilerplate, navigation, and footer. Blog posts extend that base and add post-specific stuff like dates and tags. The blog index loops through all posts. Nothing groundbreaking, but it keeps things maintainable.

I initially considered Liquid (what Jekyll uses), but Nunjucks felt more like writing actual code. The syntax is intuitive if you've done any server-side templating before.

---

## Decap CMS — The OAuth Rabbit Hole

I wanted a CMS so I could write posts from my phone or any browser without touching code. Decap CMS (formerly Netlify CMS) gives you an admin panel at `/admin/` where you can create and edit content through a nice interface. Changes commit directly to your GitHub repo.

The catch: Decap needs an OAuth backend to authenticate you with GitHub. If you're hosting on Netlify, they handle this automatically. I'm not on Netlify. I wanted everything on Cloudflare.

This is where I fell down a rabbit hole for way too long.

I spent probably three hours reading documentation and source code trying to figure out if I could use Authentik—an open-source identity provider I already run in my home lab—as the OAuth server. I got close. Authentik could handle the initial authentication. But the token exchange kept failing because Decap expects GitHub-specific claims in the JWT that Authentik wasn't providing. The OAuth flow is particular about what it wants to see.

I also tried Cloudflare's OAuth solution, thinking I could keep everything on one platform. That didn't work either—similar issues with the expected response format. Decap really wants to talk to GitHub's OAuth specifically, or something that perfectly mimics it.

Writing a custom Cloudflare Worker to proxy between Decap and GitHub's OAuth crossed my mind. Technically possible, but it meant handling token refresh, scope management, and edge cases I didn't want to debug for a portfolio site. I'm still considering implementing something like this for a future project—maybe a self-hosted forum—but for now, the complexity wasn't worth it.

In the end, I went with Netlify Identity just for the auth piece while hosting the actual site on Cloudflare Pages. It's a hybrid approach. It's definitely janky—I'm using Netlify's service purely for authentication while the site itself lives entirely on Cloudflare. But it works, and I can write blog posts from my phone now, so whatever.

One day I might write that Cloudflare Worker to replace Netlify Identity entirely and have the whole stack on one platform. For now, this works.

---

## Cloudflare Pages — The Easy Part

The actual deployment turned out to be the simplest piece of the whole project. Cloudflare Pages connects to your GitHub repo and rebuilds automatically on every push.

I configured the build settings (build command: `npm run build`, output directory: `_site`, Node version 18), added my custom domain, and Cloudflare handled everything else—SSL certificates, CDN distribution, caching. No nginx configuration. No manual certificate management. It genuinely just worked.

Every push to `main` triggers a rebuild. When I publish a post through Decap CMS, it commits to the repo, which triggers a rebuild. The loop is clean.

Adding my domain was straightforward since I already use Cloudflare for DNS. I added `badev.net` as a custom domain, and Cloudflare automatically provisioned SSL and added the DNS records. Five minutes.

---

## The Contact Form and Resume Download — Mailcow and the Python Relay

I wanted a contact form, but I wasn't about to pay for a third-party form service when I already run my own mail server. I've been running Mailcow in my home lab for about a year now. It's a fully-featured mail server stack—Postfix, Dovecot, Rspamd—packaged in Docker containers with a solid web UI. Setting it up was painful. Getting SPF, DKIM, and DMARC configured correctly, setting up reverse DNS, getting off spam blacklists—that took weeks of troubleshooting. But once it's running, it's rock solid.

The problem: Cloudflare Pages is static. There's no server-side processing. I needed something to receive form submissions and forward them to my mail server.

So I built a Python Flask relay. It runs in a Docker container on my PowerEdge server and does exactly what you'd expect: receives POST requests from the contact form, validates the input (email format, message length), rate-limits by IP address to prevent spam, constructs a proper email, and relays it through Mailcow's SMTP. The whole thing is maybe 150 lines of Python. Nothing fancy—Flask, some validation, and smtplib.

The relay uses a dedicated SMTP user in Mailcow with send-only permissions. If someone somehow compromises the relay, they can't read my email or access anything else. Just basic security hygiene.

The resume download works similarly. Instead of hosting a static PDF that anyone can scrape, download requests go through the same relay infrastructure. It logs who's requesting it, validates the request, and serves the file. Is this overkill for a resume on a portfolio site? Absolutely. But that's kind of the point. If I'm going to write about security and privacy, the site itself should reflect those principles. Every piece of my infrastructure that touches the public internet goes through the same scrutiny.

The Python relay runs behind my pfSense firewall. I use an nginx reverse proxy with SSL to expose it externally, and Cloudflare's proxy sits in front of the services that need their origin hidden. The contact form makes a POST request to the relay endpoint. If it succeeds, the user sees a success message. If it fails, they see a generic error and I get a log entry to investigate.

Is this overkill for a personal portfolio site? Probably. Could I have just used a mailto link and a static PDF? Sure. But where's the fun in that?

---

## The Design Evolution

This is where things went sideways—in a good way.

**Phase 1: Clean and Professional.** My first instinct was to keep it boring. ATS-friendly resume formatting. Sans-serif fonts, lots of whitespace, neutral colors. I was building this partly for job hunting, so I figured recruiters would appreciate something clean.

**Phase 2: Some Polish.** Clean got boring fast. I added a purple-blue gradient background, card-based layouts, better typography. It looked fine. Generic, but fine.

**Phase 3: Full Cyberpunk.** Then I said screw it.

I work in security. I've been hacking on hardware since I was a teenager. I have a server rack in my apartment. The safe corporate design was the lie. This felt more honest.

I went full terminal aesthetic. Neon cyan and green on black. Share Tech Mono for body text, Orbitron for headings. Animated scanlines that scroll slowly across the page. A grid overlay that gives everything a retro CRT feel. Terminal-style borders with labels like `[ $ whoami ]` and `[ SYSTEM ONLINE ]`. Neon glow effects on hover states.

Is it ATS-friendly? Absolutely not. Does it represent who I actually am? Yeah.

The CSS is borderline excessive. I'm not even going to pretend otherwise. It's ridiculous and I love it.

---

## The Bugs

No project is complete without a troubleshooting section. Building this site involved two AI assistants, countless iterations, and bugs that ranged from embarrassing to genuinely confusing.

### The Rendering Pipeline Collapse

Early in development, I pushed changes and the entire site went white. Every page. No console errors, no build failures, nothing in the logs that indicated a problem. The build completed successfully. The files deployed. They just rendered as blank HTML.

I spent time checking browser caches, clearing Cloudflare's cache, testing in incognito mode, checking for JavaScript errors that might be preventing paint. Nothing. The issue turned out to be a mismatch between my template chain and how I'd restructured the layouts. The base template existed but wasn't properly inheriting content from child templates after a refactor. 11ty doesn't throw errors when your template chain produces empty output—it just builds empty pages and calls it a day. Debugging required tracing through the entire template inheritance to find where the content variable was getting lost.

### The Collection That Didn't Exist

Individual blog posts rendered fine at their direct URLs. The blog index page at `/blog/` returned a 404. I assumed I'd misconfigured the URL structure or had a permalink issue. Checked the front matter, checked the directory structure, checked the 11ty config. Everything looked right.

The actual problem: I'd never created the index template. I had templates for individual posts, but no template that looped through `collections.posts` to generate the listing page. 11ty doesn't create index pages automatically—if you want a page that lists all your blog posts, you have to build it yourself. Obvious in retrospect, but I'd assumed the collection system handled this.

### Filter Functions and Silent Failures

The homepage was supposed to display the three most recent posts. Instead, it crashed during build. The error message referenced a filter that didn't exist, but the stack trace wasn't particularly helpful in pointing to which template was calling it.

The issue: I'd used `| limit(3)` in my template, expecting it to work like similar filters in other templating languages. 11ty doesn't include a `limit` filter by default. You have to register it in your config file. This one was straightforward once I understood 11ty's filter system, but the initial error message didn't make it obvious that the problem was a missing custom filter versus a syntax error.

### CSS Specificity Wars

The cyberpunk design involved layered elements—scanlines, grid overlays, content, navigation. Getting the z-index hierarchy right across different viewport sizes became its own debugging session. The mobile navigation overlay would cover the hamburger button, making it impossible to close the menu. On some screen sizes, the scanline effect would render above interactive elements, blocking clicks.

The fix required establishing a strict z-index scale and documenting it at the top of my CSS file. Overlay at 140, menu at 150, toggle at 160. Every new element that needed stacking context had to fit into this scale. I also found duplicate CSS rules from iterative development—multiple definitions of `.nav-toggle` with conflicting properties that behaved differently depending on which one the browser evaluated last.

### The OAuth Debugging Spiral

The Authentik integration absorbed more debugging time than any other component. OAuth flows involve multiple redirects, token exchanges, and JWT validation. When something fails, it can fail at any of those steps, and the error messages don't always indicate which step broke.

I enabled verbose logging in Authentik, captured network traffic, decoded JWTs manually, and compared them against what Decap expected. The authentication succeeded—Authentik correctly validated my credentials and issued a token. The failure happened when Decap tried to use that token to access GitHub's API. Decap was passing the token expecting GitHub's specific claims structure, and Authentik's JWT didn't match that structure. No amount of Authentik configuration could fix this because the fundamental assumption in Decap's code is that it's talking to GitHub.

Cloudflare's OAuth solution had a similar outcome. Different implementation, same core problem: Decap is built around GitHub's OAuth flow specifically.

### Mobile Navigation State Management

The hamburger menu opened correctly but wouldn't close when you tapped a navigation link. The overlay stayed visible, the menu stayed open, and users had to tap the hamburger again or hit Escape to close it. This was a JavaScript state management issue—the click handlers on navigation links weren't calling the close function, and the close function wasn't resetting all the CSS classes and ARIA attributes correctly.

The fix involved rewriting the navigation JavaScript to properly track state, update `aria-expanded` for accessibility, listen for Escape key presses, and ensure clicking any navigation link or the overlay itself would trigger the close sequence.

### Domain and SSL Coordination

Setting up the custom domain required coordinating between Cloudflare Pages and Cloudflare DNS. The initial certificate provisioning needed DNS-only mode—Cloudflare's proxy had to be disabled temporarily so the certificate authority could validate domain ownership. Once the certificate was issued, I could enable the proxy for the services that needed origin protection. Getting the timing wrong on this meant either SSL errors or exposed origin IPs.

---

## What's Next

This site is a work in progress, and I have a rough roadmap for where I want to take it.

A projects section is high on the list with a proper showcase of the home lab setup. The PowerEdge server, pfSense with Suricata IDS/IPS, the VLAN architecture, all the self-hosted services running in containers or vms. I want to document the infrastructure in a way that's actually useful to someone trying to build something similar.

More blog posts about security topics beyond meta posts about building this site. Writing about running your own mail server with proper SPF/DKIM/DMARC configuration. Setting up Suricata rules that actually catch things without drowning you in false positives. The things I've learned through trial and error that might save someone else the debugging time.

Eventually, that custom Cloudflare Worker to replace Netlify Identity. Having the entire authentication flow on one platform would be cleaner, and the experience might be useful for other projects down the line.

If you're tackling similar projects or have a topic you'd like me to cover, reach out through the contact form. I'm open to professional opportunities as well.

This site exists partly because I wanted to stop being invisible on the internet. Now that it's here, I'd rather it be useful than just another portfolio collecting dust.

---

## Final Thoughts

Building this site reminded me why I got into tech in the first place. Not because I had to, but because I wanted to see what I could make. It's the same itch I had as a twelve year old running game servers, the same reason I have an overcomplicated home lab, the same reason I spend my free time poking at access cards with a Proxmark.

If you're thinking about building your own site, here's what I'd tell you: just start. Use 11ty if you want simplicity. Use something else if you don't. The tools matter less than the act of building.

---

_This post was written in Decap CMS and deployed automatically via Cloudflare Pages. The source is on [GitHub](https://github.com/badev-net). If you spot something broken, that's probably my fault._
