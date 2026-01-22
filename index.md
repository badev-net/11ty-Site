---
layout: layouts/base.njk
title: Home
description: Personal portfolio and blog
---

<div class="home-page">
    <section class="hero">
        <h1>Hello, I'm Nikola Badev</h1>
        <p class="tagline">Security Enthusiast | Problem Solver | Lifelong Learner</p>
        <p class="intro">Welcome to my personal corner of the internet. I'm a software engineer based in Houston, Texas, passionate about building elegant solutions to complex problems.</p>
        <div class="cta-buttons">
            <a href="/resume/" class="btn btn-primary">View Resume</a>
            <a href="/blog/" class="btn btn-secondary">Read My Blog</a>
        </div>
    </section>

    <section class="about-preview">
        <h2>About Me</h2>
        <p>I specialize in full-stack web development with a focus on modern JavaScript frameworks and cloud technologies. With a strong foundation in computer science and years of hands-on experience, I love tackling challenging projects that make a real impact.</p>
        <p>When I'm not coding, you can find me exploring new technologies, contributing to open source projects, or sharing what I've learned through writing and mentoring.</p>
    </section>

    <section class="recent-posts">
        <h2>Recent Blog Posts</h2>
        {% set recentPosts = collections.posts | limit(3) %}
        {% if recentPosts.length > 0 %}
            {% for post in recentPosts %}
            <article class="post-preview">
                <h3><a href="{{ post.url }}">{{ post.data.title }}</a></h3>
                <p class="post-meta">{{ post.date | postDate }}</p>
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
