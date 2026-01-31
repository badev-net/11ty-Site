---
layout: layouts/base.njk
title: Home
description: Personal portfolio and blog
---

<div class="home-page">
<section class="hero">
    <h1>Hello, I'm Nikola Badev</h1>
    <p class="tagline">Security Enthusiast | Privacy Advocate | Lifelong Learner</p>
  <p class="intro">
       Welcome to my corner of the internet. I'm a security analyst based in the USA who looks for real-world gaps across cyber and physical systems and turns those findings into actionable remediation. I focus on practical, threat-informed security that gives leadership clear visibility into risk and how to remediate it.
    </p>
    <p class="intro">
        I learn by breaking things, fixing them, and understanding why they failed. Whether it's enterprise infrastructure or my own home lab, I’m always digging into how systems behave under pressure and what it takes to make them resilient.
    </p>
    <div class="cta-buttons">
        <a href="/resume/" class="btn btn-primary">View Resume</a>
        <a href="/blog/" class="btn btn-secondary">Read My Blog</a>
    </div>
</section>
        <section class="about-preview">
            <h2>About Me</h2>
            <p>I got my start in security by building and running systems long before I ever called it “security”. Early on, I was modding hardware, reverse-engineering console behavior, and operating game servers with 200+ concurrent players—writing custom plugins, building anti-cheat logic, and keeping the backend stable under heavy load. That mix of engineering, adversarial problem-solving, and real-world operational pressure is what ultimately pulled me into cybersecurity.
            <p>
            <p>Outside of work I run a home lab with segmented networks, IDS/IPS, and more self-hosted services. I write about all of the tools, tradecraft, and lessons learned along the way in my blog!</p>
    </section>

    <section class="recent-posts">
        <h2>Recent Blog Posts</h2>
        {% set recentPosts = collections.posts | limit(3) %}
        {% if recentPosts.length > 0 %}
            {% for post in recentPosts %}
            <article class="post-preview">
                <h3><a href="{{ post.url }}">{{ post.data.title }}</a></h3>
                <p class="post-meta">
                    {{ post.date | postDate }}
                    <span class="visitor-counter loading" data-path="{{ post.url }}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span class="visitor-count">...</span>
                    </span>
                </p>
                {% if post.data.description %}
                    <p>{{ post.data.description }}</p>
                {% endif %}
            </article>
            {% endfor %}
            <a href="/blog/" class="view-all">View all posts →</a>
        {% else %}
            <p>No blog posts yet. Check back soon!</p>
        {% endif %}
    </section>

</div>
