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

<style>
.home-page {
    max-width: 900px;
    margin: 0 auto;
}

.hero {
    text-align: center;
    padding: 4rem 2rem;
    margin-bottom: 4rem;
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.hero h1 {
    font-size: 2.75rem;
    margin-bottom: 1rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
}

.tagline {
    font-size: 1.125rem;
    color: #2563eb;
    margin-bottom: 1.5rem;
    font-weight: 500;
}

.intro {
    font-size: 1.0625rem;
    line-height: 1.8;
    margin-bottom: 2rem;
    max-width: 650px;
    margin-left: auto;
    margin-right: auto;
    color: #64748b;
}

.cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 2rem;
}

.btn {
    display: inline-block;
    padding: 0.875rem 2rem;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9375rem;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #2563eb;
    color: white;
    border: 1px solid #2563eb;
}

.btn-primary:hover {
    background: #1e40af;
    border-color: #1e40af;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(37, 99, 235, 0.2);
}

.btn-secondary {
    background: white;
    color: #2563eb;
    border: 2px solid #2563eb;
}

.btn-secondary:hover {
    background: #eff6ff;
    transform: translateY(-1px);
}

.about-preview,
.recent-posts {
    margin-bottom: 4rem;
}

.about-preview h2,
.recent-posts h2 {
    font-size: 1.875rem;
    margin-bottom: 1.5rem;
    color: #1e293b;
    font-weight: 700;
    padding-bottom: 0.75rem;
    border-bottom: 3px solid #e2e8f0;
    position: relative;
}

.about-preview h2::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 60px;
    height: 3px;
    background: #0d9488;
}

.recent-posts h2::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 60px;
    height: 3px;
    background: #7c3aed;
}

.about-preview p {
    font-size: 1.0625rem;
    line-height: 1.8;
    margin-bottom: 1.25rem;
    color: #475569;
}

.post-preview {
    margin-bottom: 1.5rem;
    padding: 1.75rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.post-preview:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.post-preview h3 {
    font-size: 1.375rem;
    margin-bottom: 0.5rem;
}

.post-preview h3 a {
    color: #1e293b;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
}

.post-preview h3 a:hover {
    color: #2563eb;
}

.post-meta {
    color: #94a3b8;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
    font-weight: 500;
}

.post-preview p {
    color: #64748b;
    line-height: 1.7;
    margin-bottom: 0;
}

.view-all {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    margin-top: 1rem;
}

.view-all:hover {
    color: #1e40af;
    gap: 0.75rem;
}

.view-all::after {
    content: '→';
    transition: transform 0.2s ease;
}

.view-all:hover::after {
    transform: translateX(2px);
}

@media (max-width: 768px) {
    .hero {
        padding: 3rem 1.5rem;
    }

    .hero h1 {
        font-size: 2rem;
    }

    .tagline {
        font-size: 1rem;
    }

    .intro {
        font-size: 1rem;
    }

    .btn {
        padding: 0.75rem 1.5rem;
        font-size: 0.875rem;
    }
}
</style>
