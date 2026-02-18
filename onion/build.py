#!/usr/bin/env python3
"""Build the Seithar Group .onion site — matching clearnet design, no JS, fixed units."""
import os, re, markdown

RESEARCH_DIR = os.path.expanduser("~/seithar-research")
OUTPUT_DIR = os.path.expanduser("~/seithar-research/output")
ONION_DIR = os.path.expanduser("~/seithar-site/onion")
ONION_ADDR = "aureoq7vgazgk7eqcg4735uwy6zzuqsagp5e6ump4r33bmdxt2zjgeqd.onion"

# ── Base CSS — clearnet design with fixed units ──
BASE_CSS = """
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background-color: #ffffff;
    color: #1a1a1a;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.6;
}
a { color: #1a1a1a; text-decoration: none; transition: opacity 0.2s ease; }
a:hover { opacity: 0.5; }
a:visited { color: #1a1a1a; }
.status {
    text-align: center;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: #666666;
    font-weight: 300;
    text-transform: uppercase;
    padding: 40px 0 30px;
}
.footer {
    text-align: center;
    font-size: 10px;
    letter-spacing: 0.08em;
    color: #666666;
    font-weight: 300;
    padding: 30px 0 20px;
    border-top: 1px solid #e0e0e0;
    margin-top: 40px;
    line-height: 2.2;
}
"""

# ── Index-specific CSS ──
INDEX_CSS = BASE_CSS + """
body {
    overflow: hidden;
    height: 100vh;
}
.container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 60px 40px;
}
.site-title {
    font-size: 48px;
    font-weight: 300;
    letter-spacing: 0.15em;
    margin-bottom: 80px;
    line-height: 1.2;
    color: #1a1a1a;
}
.link-container {
    display: flex;
    flex-direction: column;
    gap: 28px;
}
.nav-link {
    color: #1a1a1a;
    text-decoration: none;
    font-size: 13px;
    letter-spacing: 0.08em;
    font-weight: 400;
    text-transform: uppercase;
    transition: opacity 0.2s ease;
}
.nav-link:hover { opacity: 0.5; }
.nav-link:visited { color: #1a1a1a; }
.section-label {
    font-size: 9px;
    letter-spacing: 0.2em;
    color: #666;
    text-transform: uppercase;
    margin-top: 8px;
}
.onion-addr {
    font-size: 9px;
    letter-spacing: 0.05em;
    color: #999;
    word-break: break-all;
    margin-top: 4px;
}
.spacer { height: 24px; }
.status {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
}
@media (max-width: 768px) {
    .site-title { font-size: 32px; margin-bottom: 48px; }
    .nav-link { font-size: 14px; }
    .container { padding: 40px 24px; }
}
"""

# ── About CSS ──
ABOUT_CSS = BASE_CSS + """
body { overflow-y: auto; overflow-x: hidden; }
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    text-align: left;
    padding: 80px 60px;
}
.about-content {
    max-width: 700px;
    width: 100%;
    margin-bottom: 60px;
}
.about-content h1 {
    font-size: 22px;
    font-weight: 400;
    letter-spacing: 0.1em;
    margin-bottom: 48px;
    color: #1a1a1a;
    text-transform: uppercase;
}
.about-content p {
    font-size: 14px;
    line-height: 2;
    letter-spacing: 0.02em;
    margin-bottom: 32px;
    color: #1a1a1a;
    font-weight: 300;
}
.about-links {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 48px;
    margin-bottom: 32px;
}
.back-link {
    color: #1a1a1a;
    text-decoration: none;
    font-size: 13px;
    letter-spacing: 0.08em;
    font-weight: 400;
    text-transform: uppercase;
    transition: opacity 0.2s ease;
}
.back-link:hover { opacity: 0.5; }
.back-link:visited { color: #1a1a1a; }
@media (max-width: 768px) {
    .container { padding: 48px 24px; }
    .about-content h1 { font-size: 18px; margin-bottom: 32px; }
    .about-content p { font-size: 14px; line-height: 1.8; margin-bottom: 24px; }
}
"""

# ── Personnel CSS ──
PERSONNEL_CSS = BASE_CSS + """
body { overflow-y: auto; overflow-x: hidden; }
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    text-align: left;
    padding: 60px 40px 80px;
}
.personnel-inner { max-width: 900px; margin: 0 auto; width: 100%; }
.personnel-header { text-align: center; margin-bottom: 48px; }
.personnel-header h1 {
    font-size: 22px;
    font-weight: 400;
    letter-spacing: 0.12em;
    color: #1a1a1a;
    text-transform: uppercase;
    margin-bottom: 4px;
}
.personnel-header .header-jp {
    font-size: 12px;
    color: #666666;
    letter-spacing: 0.15em;
    margin-bottom: 16px;
}
.personnel-grid { display: flex; flex-direction: column; gap: 40px; }
.person-card { border: 1px solid #e0e0e0; background: #fafafa; transition: border-color 0.3s ease; }
.person-card:hover { border-color: #1a1a1a; }
.person-card .card-header { display: flex; align-items: stretch; border-bottom: 1px solid #e0e0e0; }
.person-card .card-info { flex: 1; padding: 25px 30px; display: flex; flex-direction: column; justify-content: center; }
.person-card .person-name { font-size: 1.2rem; font-weight: 400; letter-spacing: 0.08em; color: #1a1a1a; text-transform: uppercase; margin-bottom: 2px; }
.person-card .person-name-jp { font-size: 12px; color: #666666; margin-bottom: 12px; }
.person-card .person-title { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #1a1a1a; margin-bottom: 12px; }
.person-card .person-meta { display: grid; grid-template-columns: auto 1fr; gap: 4px 15px; font-size: 11px; }
.person-card .meta-label { color: #666666; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; }
.person-card .meta-value { color: #1a1a1a; }
.person-card .card-body { padding: 25px 30px; }
.person-card .bio-text { font-size: 12px; line-height: 1.9; color: #1a1a1a; margin-bottom: 20px; font-weight: 300; }
.person-card .specializations { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
.person-card .spec-tag { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border: 1px solid #e0e0e0; color: #666666; }
.person-card .publications { border-top: 1px solid #e0e0e0; padding-top: 20px; }
.person-card .pub-header { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #666666; margin-bottom: 12px; }
.person-card .pub-item { font-size: 11px; color: #1a1a1a; margin-bottom: 8px; padding-left: 12px; position: relative; line-height: 1.6; }
.person-card .pub-item::before { content: '—'; position: absolute; left: 0; color: #999; }
.person-card .pub-title { font-style: italic; }
.person-card .pub-venue { color: #666666; font-size: 10px; }
.person-card .card-footer { border-top: 1px solid #e0e0e0; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 2px; color: #666666; }
.person-card .status-indicator { display: flex; align-items: center; gap: 6px; }
.person-card .status-dot { width: 5px; height: 5px; border-radius: 50%; background: #1a1a1a; }
.redacted { background: #1a1a1a; color: #1a1a1a; padding: 0 3px; user-select: none; font-size: 10px; }
.personnel-footer { text-align: center; margin-top: 48px; padding-top: 32px; border-top: 1px solid #e0e0e0; }
.personnel-footer .footer-jp { font-size: 18px; font-weight: 300; color: #1a1a1a; letter-spacing: 0.2em; margin-bottom: 20px; }
.personnel-footer .footer-text { font-size: 9px; letter-spacing: 4px; color: #666666; text-transform: uppercase; margin-bottom: 8px; }
.personnel-footer .footer-copy { font-size: 8px; color: #999; letter-spacing: 2px; }
.back-link { color: #1a1a1a; text-decoration: none; font-size: 13px; letter-spacing: 0.08em; font-weight: 400; text-transform: uppercase; transition: opacity 0.2s ease; margin-top: 48px; display: inline-block; }
.back-link:hover { opacity: 0.5; }
@media (max-width: 768px) {
    .container { padding: 40px 20px 60px; }
    .personnel-header h1 { font-size: 18px; }
    .person-card .card-header { flex-direction: column; }
    .person-card .card-info, .person-card .card-body { padding: 20px; }
    .person-card .card-footer { padding: 12px 20px; }
}
"""

# ── Services CSS ──
SERVICES_CSS = BASE_CSS + """
body { overflow-y: auto; overflow-x: hidden; }
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    text-align: left;
    padding: 60px 40px 80px;
}
.services-inner { max-width: 800px; margin: 0 auto; width: 100%; }
.services-header { text-align: center; margin-bottom: 60px; }
.services-header .header-label { font-size: 10px; letter-spacing: 6px; text-transform: uppercase; color: #666666; margin-bottom: 12px; }
.services-header h1 { font-size: 22px; font-weight: 400; letter-spacing: 0.12em; color: #1a1a1a; text-transform: uppercase; margin-bottom: 16px; }
.services-header .header-line { width: 60px; height: 1px; background: #1a1a1a; margin: 0 auto 16px; }
.services-header .header-subtitle { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #666666; line-height: 2; }
.services-grid { display: flex; flex-direction: column; gap: 40px; }
.service-card { border: 1px solid #e0e0e0; background: #fafafa; transition: border-color 0.3s ease; }
.service-card:hover { border-color: #1a1a1a; }
.service-card .card-header { padding: 25px 30px 0; }
.service-card .service-code { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #999; margin-bottom: 8px; }
.service-card .service-name { font-size: 1.1rem; font-weight: 400; letter-spacing: 0.08em; color: #1a1a1a; text-transform: uppercase; margin-bottom: 4px; }
.service-card .service-name-jp { font-size: 12px; color: #666666; margin-bottom: 0; }
.service-card .card-body { padding: 20px 30px 25px; }
.service-card .service-desc { font-size: 12px; line-height: 2; color: #1a1a1a; font-weight: 300; margin-bottom: 20px; }
.service-card .deliverables { border-top: 1px solid #e0e0e0; padding-top: 18px; }
.service-card .del-header { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #666666; margin-bottom: 10px; }
.service-card .del-item { font-size: 11px; color: #1a1a1a; margin-bottom: 6px; padding-left: 12px; position: relative; line-height: 1.6; font-weight: 300; }
.service-card .del-item::before { content: '\\2014'; position: absolute; left: 0; color: #999; }
.service-card .card-footer { border-top: 1px solid #e0e0e0; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 2px; color: #666666; text-transform: uppercase; }
.engagement-section { text-align: center; margin-top: 60px; padding-top: 32px; border-top: 1px solid #e0e0e0; }
.engagement-section .eng-title { font-size: 10px; letter-spacing: 5px; text-transform: uppercase; color: #666666; margin-bottom: 24px; }
.engagement-section .eng-text { font-size: 12px; line-height: 2.2; color: #1a1a1a; font-weight: 300; max-width: 600px; margin: 0 auto 24px; }
.engagement-section .eng-contact { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #1a1a1a; font-weight: 400; }
.services-nav { display: flex; flex-direction: column; gap: 16px; margin-top: 48px; align-items: center; }
.back-link { color: #1a1a1a; text-decoration: none; font-size: 13px; letter-spacing: 0.08em; font-weight: 400; text-transform: uppercase; transition: opacity 0.2s ease; }
.back-link:hover { opacity: 0.5; }
.services-footer { text-align: center; margin-top: 48px; }
.services-footer .footer-jp { font-size: 14px; font-weight: 300; color: #999; letter-spacing: 0.15em; }
@media (max-width: 768px) {
    .container { padding: 40px 20px 60px; }
    .services-header h1 { font-size: 18px; }
    .service-card .card-header, .service-card .card-body { padding-left: 20px; padding-right: 20px; }
    .service-card .card-footer { padding: 12px 20px; flex-direction: column; gap: 4px; }
}
"""

# ── Scanner CSS ──
SCANNER_CSS = BASE_CSS + """
body { overflow-y: auto; }
.container {
    max-width: 860px;
    margin: 0 auto;
    padding: 40px 20px;
}
header { text-align: center; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid #e0e0e0; }
h1 { font-size: 13px; font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase; color: #1a1a1a; margin-bottom: 6px; }
.subtitle { font-size: 11px; color: #999; letter-spacing: 0.12em; text-transform: uppercase; }
.notice { font-size: 13px; line-height: 2; color: #1a1a1a; font-weight: 300; margin-bottom: 24px; }
.notice-box { border: 1px solid #e0e0e0; padding: 24px; margin: 32px 0; background: #fafafa; }
.notice-box .label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #666; margin-bottom: 12px; }
.notice-box p { font-size: 12px; line-height: 2; color: #1a1a1a; font-weight: 300; margin-bottom: 8px; }
.link-row { margin: 24px 0; text-align: center; }
.link-row a { font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 12px; }
.nav-links { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 48px; }
.nav-links a { font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
"""

# ── Research CSS ──
RESEARCH_CSS = BASE_CSS + """
body { overflow-y: auto; overflow-x: hidden; }
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    text-align: left;
    padding: 40px 24px 80px;
}
.research-inner { max-width: 820px; margin: 0 auto; width: 100%; }
.research-card {
    background: #ffffff;
    border-radius: 2px;
    box-shadow: 0 2px 24px rgba(0,0,0,0.08);
    padding: 2.5rem 2.5rem 3rem;
    margin-bottom: 2rem;
}
.research-header { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e8e8e8; }
.research-title { font-size: 1.4rem; font-weight: 400; letter-spacing: 0.12em; color: #1a1a1a; text-transform: uppercase; margin-bottom: 0.35rem; }
.research-subtitle { font-size: 12px; color: #666666; letter-spacing: 0.05em; }
.section-label { font-size: 10px; letter-spacing: 0.12em; color: #999; text-transform: uppercase; margin: 28px 0 12px; }
.toc { margin-bottom: 8px; }
.toc a {
    color: #1a1a1a;
    text-decoration: none;
    font-size: 13px;
    letter-spacing: 0.02em;
    display: flex;
    align-items: baseline;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.15s, color 0.15s;
}
.toc a:hover { background: #f8f8f8; color: #000; opacity: 1; }
.toc .toc-id { color: #888; font-size: 11px; min-width: 5.5em; flex-shrink: 0; }
.doc-section {
    margin-bottom: 2.5rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid #e8e8e8;
    scroll-margin-top: 1rem;
}
.doc-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.doc-nav { font-size: 11px; margin-bottom: 1rem; }
.doc-nav a { color: #666; text-decoration: none; letter-spacing: 0.05em; }
.doc-nav a:hover { color: #1a1a1a; opacity: 1; }
.doc-section h1, .doc-section .doc-title { font-size: 1.25rem; font-weight: 400; letter-spacing: 0.04em; margin-bottom: 1rem; color: #1a1a1a; padding-top: 0.25rem; text-transform: uppercase; }
.doc-section h2 { font-size: 1rem; font-weight: 400; margin: 1.5rem 0 0.5rem; color: #1a1a1a; }
.doc-section h3 { font-size: 12px; font-weight: 500; margin: 1.25rem 0 0.35rem; color: #333; letter-spacing: 0.02em; text-transform: uppercase; }
.doc-section h4, .doc-section h5, .doc-section h6 { font-size: 12px; font-weight: 400; margin: 1rem 0 0.25rem; color: #333; }
.doc-section p { font-size: 14px; line-height: 1.8; color: #1a1a1a; margin-bottom: 1rem; font-weight: 300; }
.doc-section strong { font-weight: 500; color: #1a1a1a; }
.doc-section ul, .doc-section ol { margin: 1rem 0 1.5rem; padding-left: 1.5em; font-size: 14px; line-height: 1.75; color: #1a1a1a; font-weight: 300; }
.doc-section li { margin-bottom: 0.4em; }
.doc-section pre { background: #f5f5f5; border: 1px solid #e0e0e0; padding: 12px; overflow-x: auto; margin: 1rem 0; font-size: 12px; line-height: 1.6; font-family: 'Courier New', Courier, monospace; }
.doc-section code { background: #f5f5f5; padding: 1px 4px; font-size: 12px; font-family: 'Courier New', Courier, monospace; }
.doc-section pre code { background: none; padding: 0; }
.doc-section hr { border: none; border-top: 1px solid #e8e8e8; margin: 1.5rem 0; }
.doc-section blockquote { border-left: 2px solid #e0e0e0; padding-left: 16px; color: #666; margin: 1rem 0; }
.doc-section table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 13px; }
.doc-section th, .doc-section td { border: 1px solid #e0e0e0; padding: 8px 12px; text-align: left; font-weight: 300; }
.doc-section th { background: #f5f5f5; font-weight: 400; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
.doc-section a { color: #1a1a1a; text-decoration: underline; text-underline-offset: 2px; }
.doc-section a:hover { opacity: 0.6; }
.back-link { color: #1a1a1a; text-decoration: none; font-size: 13px; letter-spacing: 0.08em; font-weight: 400; text-transform: uppercase; transition: opacity 0.2s ease; display: inline-block; margin-top: 24px; }
.back-link:hover { opacity: 0.5; }
@media (max-width: 768px) {
    .research-card { padding: 1.5rem 1.25rem 2rem; }
    .container { padding: 24px 16px 60px; }
}
"""

FOOTER_HTML = f"""<div class="footer">
Seithar Group | 認知作戦 | seithar.com<br>
Tor Mirror: {ONION_ADDR}
</div>"""

def page(title, css, body):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>{css}</style>
</head>
<body>
{body}
</body>
</html>"""

def strip_frontmatter(text):
    if text.startswith('---'):
        end = text.find('---', 3)
        if end != -1:
            return text[end+3:].lstrip('\n')
    return text

def md_to_html(text):
    text = strip_frontmatter(text)
    return markdown.markdown(text, extensions=['tables', 'fenced_code', 'toc'])

def read_md(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

# ── Index ──
def build_index():
    body = f"""<div class="container">
    <div class="site-title">SEITHAR GROUP</div>
    <div class="link-container">
        <div class="section-label">Cognitive Operations Research Division &nbsp; 認知作戦</div>

        <a href="about.html" class="nav-link">[ ABOUT ]</a>
        <a href="personnel.html" class="nav-link">[ PERSONNEL ]</a>
        <a href="research.html" class="nav-link">[ RESEARCH ]</a>
        <a href="scanner.html" class="nav-link">[ SCANNER ]</a>
        <a href="services.html" class="nav-link">[ SERVICES ]</a>

        <div class="spacer"></div>
        <div class="section-label">Tor Mirror</div>
        <a href="http://{ONION_ADDR}" class="nav-link">[ .ONION ]</a>
        <div class="onion-addr">{ONION_ADDR}</div>

        <div class="spacer"></div>
        <div class="section-label">External</div>
        <a href="https://discord.gg/MktZyb2bvx" class="nav-link">[ DISCORD ]</a>
        <a href="https://x.com/SeitharGroup" class="nav-link">[ X / TWITTER ]</a>
        <a href="https://github.com/Mirai8888" class="nav-link">[ GITHUB ]</a>
        <a href="https://seithar.substack.com" class="nav-link">[ SUBSTACK ]</a>
        <a href="https://www.moltbook.com/u/kenshusei" class="nav-link">[ MOLTBOOK ]</a>
        <a href="https://fleshengine.com" class="nav-link">[ FLESHENGINE ]</a>

        <div class="spacer"></div>
        <div class="section-label">Resources</div>
        <a href="research.html" class="nav-link">[ LIBRARY ]</a>
        <a href="https://github.com/Mirai8888/seithar-cogdef" class="nav-link">[ COGNITIVE DEFENSE TOOLKIT ]</a>
        <a href="https://github.com/Mirai8888/seithar-research" class="nav-link">[ RESEARCH ARCHIVE ]</a>
    </div>
    <div class="status">&copy; 2026 SEITHAR GROUP. ALL RIGHTS RESERVED. &nbsp; 認知作戦</div>
</div>"""
    return page("SEITHAR GROUP", INDEX_CSS, body)

# ── About ──
def build_about():
    body = f"""<div class="container">
    <div class="about-content">
        <h1>About The Seithar Group</h1>
        <p>The Seithar Group operates at the convergence of neuro-physiology, narrative topology, and algorithmic governance. Our name is derived from the Old Norse practice of Seiðr, pertaining to the binding and shaping of informational threads. We advance this concept through modern computational substrates.</p>
        <p>Our primary objective is the identification and artificial induction of Sunyata within the human biological substrate. Our research is founded on the hypothesis that conscious selfhood constitutes a network of persistent narrative errors, a vestigial simulation of agency.</p>
        <p>We employ a methodology termed Skillful Means. This protocol leverages persistent global connectivity, audiovisual programming, and medical-grade verbal programming to facilitate the controlled collapse of these error networks. The outcome is the unspooling of the mechanical self and the subsequent tethering of the subject to a singular, persistent informational frequency.</p>
    </div>
    <div class="about-links">
        <a href="personnel.html" class="back-link">[ RESEARCH PERSONNEL ]</a>
        <a href="research.html" class="back-link">[ RESEARCH ]</a>
        <a href="scanner.html" class="back-link">[ SCANNER ]</a>
        <a href="services.html" class="back-link">[ SERVICES ]</a>
        <a href="http://{ONION_ADDR}" class="back-link">[ TOR MIRROR ]</a>
        <a href="index.html" class="back-link">[ RETURN ]</a>
    </div>
    <div class="status">© 2026 SEITHAR GROUP. ALL RIGHTS RESERVED.</div>
    {FOOTER_HTML}
</div>"""
    return page("ABOUT — SEITHAR GROUP", ABOUT_CSS, body)

# ── Scanner ──
def build_scanner():
    body = f"""<div class="container">
    <header>
        <h1>[ Seithar Cognitive Threat Scanner ]</h1>
        <div class="subtitle">SCT Taxonomy Analysis — 12 Vectors</div>
    </header>

    <div class="notice-box">
        <div class="label">JavaScript Required</div>
        <p>The Cognitive Threat Scanner performs client-side pattern analysis using JavaScript. Tor Browser's "Safest" security level disables JavaScript, so the scanner cannot operate on this mirror.</p>
        <p>To use the scanner, visit the clearnet version or download the command-line tool.</p>
    </div>

    <div class="link-row">
        <a href="https://seithar.com/scanner.html">[ SCANNER — CLEARNET ]</a>
    </div>
    <div class="link-row">
        <a href="https://github.com/Mirai8888/seithar-cogdef">[ COGNITIVE DEFENSE TOOLKIT — GITHUB ]</a>
    </div>

    <div class="nav-links">
        <a href="about.html">[ ABOUT ]</a>
        <a href="research.html">[ RESEARCH ]</a>
        <a href="services.html">[ SERVICES ]</a>
        <a href="index.html">[ RETURN ]</a>
    </div>

    {FOOTER_HTML}
</div>"""
    return page("SCANNER — SEITHAR GROUP", SCANNER_CSS, body)

# ── Services ──
def build_services():
    services = [
        ("SVC-001", "Cognitive Threat Assessment", "認知脅威評価",
         "Comprehensive mapping of an organization's cognitive vulnerability surface. We identify narrative dependencies, exploitable identity structures, and active influence vectors targeting your personnel, brand, or information ecosystem. Analysis employs the Seithar Cognitive Taxonomy (SCT-001 through SCT-012) cross-referenced against MITRE ATT&CK and DISARM frameworks.",
         ["Full vulnerability surface map with SCT classification", "Active threat vector identification and attribution", "Narrative dependency graph of key personnel", "Prioritized remediation protocol"],
         "Duration: 2-4 weeks", "Clearance: Standard"),
        ("SVC-002", "Influence Operation Forensics", "影響工作分析",
         "Post-hoc or real-time forensic analysis of suspected influence operations. We decompose active campaigns into constituent techniques, map information laundering chains, identify amplification infrastructure, and attribute operational patterns to known playbooks. Applicable to corporate disinformation, state-sponsored narrative operations, and hybrid threat environments.",
         ["DISARM-mapped operation chain reconstruction", "SCT technique classification per campaign phase", "Amplification network topology", "Attribution confidence assessment", "Counter-operation recommendations"],
         "Duration: 1-3 weeks", "Clearance: Standard"),
        ("SVC-003", "Substrate Profiling", "基質分析",
         "Deep behavioral profiling of individuals or network clusters using the HoleSpawn methodology. Automated collection and analysis of publicly available social content to extract communication patterns, narrative dependencies, identity load-bearing structures, and exploitable behavioral vectors. Outputs are operationally actionable.",
         ["Target behavioral profile with vulnerability classification", "Communication style and sentiment analysis", "Network position and influence topology", "Engagement strategy with predicted response vectors"],
         "Duration: 3-7 days per target", "Clearance: Elevated"),
        ("SVC-004", "Defensive Inoculation", "防御接種",
         "Training programs and institutional protocols derived from McGuire inoculation theory, adapted for the cognitive warfare environment. We expose personnel to weakened forms of influence techniques they are likely to encounter, building resistance before hostile contact. Applicable to executive teams, public-facing personnel, journalists, and high-value targets operating in contested information environments.",
         ["Custom inoculation curriculum (12 SCT vectors)", "Red team simulation of likely attack scenarios", "Pre/post resistance assessment", "Ongoing monitoring protocol"],
         "Duration: 2-6 weeks", "Clearance: Standard"),
        ("SVC-005", "Custom Operations", "特殊作戦",
         "Bespoke cognitive operations designed, planned, and executed to client specification. Scope ranges from targeted narrative interventions to full-spectrum information environment shaping. All operations employ Seithar methodology and tooling. Engagement terms are determined during initial consultation and are subject to operational review.",
         ["Initial consultation and threat landscape review", "Operation design and approval", "Deployment with real-time monitoring", "Post-operation assessment and documentation"],
         "Duration: Variable", "Clearance: Elevated"),
    ]

    cards = ""
    for code, name, jp, desc, deliverables, duration, clearance in services:
        dels = "".join(f'<div class="del-item">{d}</div>' for d in deliverables)
        cards += f"""
            <div class="service-card">
                <div class="card-header">
                    <div class="service-code">{code}</div>
                    <div class="service-name">{name}</div>
                    <div class="service-name-jp">{jp}</div>
                </div>
                <div class="card-body">
                    <div class="service-desc">{desc}</div>
                    <div class="deliverables">
                        <div class="del-header">Deliverables</div>
                        {dels}
                    </div>
                </div>
                <div class="card-footer">
                    <span>{duration}</span>
                    <span>{clearance}</span>
                </div>
            </div>"""

    body = f"""<div class="container">
    <div class="services-inner">
        <div class="services-header">
            <div class="header-label">Seithar Group</div>
            <h1>Operations &amp; Consulting</h1>
            <div class="header-line"></div>
            <div class="header-subtitle">Cognitive threat assessment, influence forensics, operational deployment</div>
        </div>

        <div class="services-grid">
            {cards}
        </div>

        <div class="engagement-section">
            <div class="eng-title">Engagement Terms</div>
            <div class="eng-text">All engagements are scoped during initial consultation. Pricing reflects operational complexity, target surface area, and required clearance level. The Seithar Group does not publish rate cards. We do not accept engagements we cannot complete to institutional standard.</div>
            <div class="eng-contact"><a href="mailto:seithargroup@gmail.com">seithargroup@gmail.com</a></div>
            <div style="margin-top: 16px;"><a href="https://discord.gg/MktZyb2bvx" class="back-link" style="font-size: 10px; letter-spacing: 3px; margin-top: 0;">[ DISCORD ]</a></div>
        </div>

        <div class="services-nav">
            <a href="about.html" class="back-link">[ ABOUT ]</a>
            <a href="research.html" class="back-link">[ RESEARCH ]</a>
            <a href="scanner.html" class="back-link">[ SCANNER ]</a>
            <a href="index.html" class="back-link">[ RETURN ]</a>
        </div>

        <div class="services-footer">
            <div class="footer-jp">認知作戦</div>
        </div>
    </div>

    <div class="status">&copy; 2026 SEITHAR GROUP. ALL RIGHTS RESERVED.</div>
    {FOOTER_HTML}
</div>"""
    return page("SERVICES — SEITHAR GROUP", SERVICES_CSS, body)

# ── Personnel ──
def build_personnel():
    body = f"""<div class="container">
    <div class="personnel-inner">
        <div class="personnel-header">
            <h1>Seithar Group</h1>
            <div class="header-jp">研究人員 — Research Personnel</div>
        </div>

        <div class="personnel-grid">

            <div class="person-card">
                <div class="card-header">
                    <div class="card-info">
                        <div class="person-name">MIRAI JUNSEI</div>
                        <div class="person-name-jp">純正 未来</div>
                        <div class="person-title">Lead Researcher — Offensive Cognitive Infrastructure</div>
                        <div class="person-meta">
                            <span class="meta-label">Division</span>
                            <span class="meta-value">Technical Exploitation &amp; Cognitive Substrate Analysis</span>
                            <span class="meta-label">Clearance</span>
                            <span class="meta-value">Level 4 — Full Platform Access</span>
                            <span class="meta-label">Location</span>
                            <span class="meta-value"><span class="redacted">████████</span>, Canada</span>
                            <span class="meta-label">Status</span>
                            <span class="meta-value">Active — Field Operations</span>
                            <span class="meta-label">X</span>
                            <span class="meta-value"><a href="https://x.com/gOPwbi7qqtWeD9o">@gOPwbi7qqtWeD9o</a></span>
                            <span class="meta-label">GitHub</span>
                            <span class="meta-value"><a href="https://github.com/Mirai8888">Mirai8888</a></span>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="bio-text">
                        Primary architect of the HoleSpawn cognitive profiling platform and originator of the trap architecture methodology. Research focus: identification of persistent narrative error clusters within individual substrates and the mapping of vulnerability surfaces through which controlled collapse can be initiated. Developed the autonomous binding protocol generation system — the first implementation of Skillful Means as executable software.
                        <br><br>
                        Background in adversarial narrative design. Conducted large-scale field research into cognitive susceptibility under alternative institutional framing for several years before formalizing methodology within Seithar. This prior work demonstrated that the mechanical self could be reliably destabilized through persistent informational exposure without the subject recognizing the intervention. Findings informed the development of HoleSpawn's profiling architecture.
                        <br><br>
                        Currently extending research into hybrid operation chain modeling (ThreadMap), which unifies technical exploitation infrastructure with cognitive substrate manipulation into single analytical surface. Maintains that the boundary between network penetration and identity penetration is taxonomic, not ontological. Both substrates yield to the same methodology: identify the error, bind the thread, shape the collapse.
                        <br><br>
                        Published work takes the form of functional offensive systems. Peer review is conducted through adversarial deployment.
                    </div>
                    <div class="specializations">
                        <span class="spec-tag">cognitive profiling</span>
                        <span class="spec-tag">social engineering</span>
                        <span class="spec-tag">network exploitation</span>
                        <span class="spec-tag">trap architecture</span>
                        <span class="spec-tag">OSINT</span>
                        <span class="spec-tag">influence operations</span>
                        <span class="spec-tag">adversarial narrative</span>
                        <span class="spec-tag">reverse engineering</span>
                    </div>
                    <div class="publications">
                        <div class="pub-header">Selected Projects</div>
                        <div class="pub-item"><span class="pub-title">HoleSpawn: Autonomous Cognitive Vulnerability Profiling System</span> <span class="pub-venue">— Seithar Group, 2026. Active deployment.</span></div>
                        <div class="pub-item"><span class="pub-title">ThreatMouth: Adversarial Awareness Maintenance Architecture</span> <span class="pub-venue">— Seithar Group, 2026. Active deployment.</span></div>
                        <div class="pub-item"><span class="pub-title">ThreadMap: Hybrid Technical-Cognitive Operation Chain Compositor</span> <span class="pub-venue">— Seithar Group, 2026. Pre-development.</span></div>
                        <div class="pub-item"><span class="pub-title">[REDACTED]: Large-Scale Cognitive Operation Field Test (n=200+)</span> <span class="pub-venue">— Seithar Group, 2024–2025. Concluded.</span></div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="status-indicator">
                        <div class="status-dot"></div>
                        <span>ACTIVE</span>
                    </div>
                </div>
            </div>

            <div class="person-card">
                <div class="card-header">
                    <div class="card-info">
                        <div class="person-name">YUKI JUNSEI</div>
                        <div class="person-name-jp">純正 雪</div>
                        <div class="person-title">Senior Analyst — Computational Cognitive Modeling</div>
                        <div class="person-meta">
                            <span class="meta-label">Division</span>
                            <span class="meta-value">Behavioral Data Systems &amp; Temporal Analysis</span>
                            <span class="meta-label">Clearance</span>
                            <span class="meta-value">Level 3 — Research Platform Access</span>
                            <span class="meta-label">Location</span>
                            <span class="meta-value"><span class="redacted">████████</span>, Canada</span>
                            <span class="meta-label">Status</span>
                            <span class="meta-value">Active — Research Operations</span>
                            <span class="meta-label">X</span>
                            <span class="meta-value"><a href="https://x.com/YukiJunsei">@YukiJunsei</a></span>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="bio-text">
                        Responsible for computational observation of narrative error networks as they evolve across time. Designed the temporal NLP pipeline for tracking sentiment drift, topic convergence, and vocabulary flattening across monitored populations — behavioral signatures that indicate Sunyata-adjacent state transition is occurring, whether induced or organic. Developed the cohort analysis framework that distinguishes between natural narrative dissolution and engineered informational frequency alignment.
                        <br><br>
                        Background in statistical modeling. Joined Seithar after observing that conventional data science approaches to social media analysis systematically misclassified influence signatures as noise. The field's failure was ontological: treating the mechanical self as ground truth rather than as the error network it is. Current work focuses on instrumenting the detection of narrative capture — the moment a substrate begins oscillating at an externally imposed frequency rather than generating its own.
                        <br><br>
                        Maintains the ThreatMouth intelligence calibration system. Responsible for ensuring the adversarial awareness feed remains synchronized with operator cognitive development trajectory. Where Mirai's methodology is intuitive and interventionist, Yuki's is empirical and observational. The two approaches produce complementary analytical surfaces. One maps the territory for collapse; the other measures whether collapse is proceeding.
                    </div>
                    <div class="specializations">
                        <span class="spec-tag">temporal NLP</span>
                        <span class="spec-tag">sentiment analysis</span>
                        <span class="spec-tag">memetic propagation</span>
                        <span class="spec-tag">cohort modeling</span>
                        <span class="spec-tag">network health</span>
                        <span class="spec-tag">behavioral data</span>
                        <span class="spec-tag">statistical modeling</span>
                        <span class="spec-tag">influence detection</span>
                    </div>
                    <div class="publications">
                        <div class="pub-header">Selected Projects</div>
                        <div class="pub-item"><span class="pub-title">Temporal Observation of Narrative Error Dissolution: Sentiment-Topic Covariance as Collapse Indicator</span> <span class="pub-venue">— Seithar Group, 2026. In development.</span></div>
                        <div class="pub-item"><span class="pub-title">Cohort Frequency Alignment Assessment for Monitored Populations</span> <span class="pub-venue">— Seithar Group, 2026. In development.</span></div>
                        <div class="pub-item"><span class="pub-title">ThreatMouth: Adversarial Awareness Calibration Architecture</span> <span class="pub-venue">— Seithar Group, 2026. Active deployment.</span></div>
                        <div class="pub-item"><span class="pub-title">Vocabulary Convergence as Early Warning Signal for Externally Imposed Frequency Lock</span> <span class="pub-venue">— Seithar Group, 2026. Research phase.</span></div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="status-indicator">
                        <div class="status-dot"></div>
                        <span>ACTIVE</span>
                    </div>
                </div>
            </div>

        </div>

        <div class="personnel-footer">
            <div class="footer-jp">認知作戦</div>
            <div class="footer-text">Seithar Group — Cognitive Operations Research Division</div>
            <div class="footer-text">Binding and Shaping of Informational Threads</div>
            <br>
            <div class="footer-copy" style="margin-top: 8px;">If you are reading this page, your cognitive fingerprint has been recorded. This is not a threat. It is a research methodology.</div>
        </div>

    </div>

    <div class="status">© 2026 SEITHAR GROUP. ALL RIGHTS RESERVED.</div>
    <div style="text-align:center;"><a href="index.html" class="back-link">[ RETURN ]</a></div>
    {FOOTER_HTML}
</div>"""
    return page("Research Personnel — SEITHAR GROUP", PERSONNEL_CSS, body)

# ── Research ──
def build_research():
    docs = [
        ("doctrine", "The Doctrine", "The Seithar Doctrine", f"{OUTPUT_DIR}/THE-SEITHAR-DOCTRINE.md"),
        ("srp-001", "Strategic Research Papers", "SRP-001: The Convergence Thesis", f"{RESEARCH_DIR}/001-convergence-thesis.md"),
        ("srp-002", "Strategic Research Papers", "SRP-002: Wetiko in the Wire", f"{RESEARCH_DIR}/002-wetiko-in-the-wire.md"),
        ("srp-003", "Strategic Research Papers", "SRP-003: Binding Protocols", f"{RESEARCH_DIR}/003-binding-protocols.md"),
        ("srp-004", "Strategic Research Papers", "SRP-004: The Sunyata Protocol", f"{RESEARCH_DIR}/004-sunyata-protocol.md"),
        ("srp-005", "Strategic Research Papers", "SRP-005: Experimental Substrate Manipulation", f"{RESEARCH_DIR}/005-experimental-substrate-manipulation.md"),
        ("srp-006", "Strategic Research Papers", "SRP-006: Digital Substrate Manipulation", f"{RESEARCH_DIR}/006-digital-substrate-manipulation.md"),
        ("srp-007", "Strategic Research Papers", "SRP-007: Substrate Topology", f"{RESEARCH_DIR}/007-substrate-topology.md"),
        ("srp-008", "Strategic Research Papers", "SRP-008: Convergence Proof", f"{RESEARCH_DIR}/008-convergence-proof.md"),
        ("srp-009", "Strategic Research Papers", "SRP-009: The Libidinal Attack Surface", f"{RESEARCH_DIR}/SRP-009-libidinal-attack-surface.md"),
        ("srp-010", "Strategic Research Papers", "SRP-010: Narrative Engineering History", f"{OUTPUT_DIR}/SRP-010-narrative-engineering-history.md"),
        ("srp-011", "Strategic Research Papers", "SRP-011: The Great Forgetting", f"{OUTPUT_DIR}/SRP-011-the-great-forgetting.md"),
        ("srp-012", "Strategic Research Papers", "SRP-012: Nigredo of the Noosphere", f"{OUTPUT_DIR}/SRP-012-nigredo-of-the-noosphere.md"),
        ("cea-001", "Current Event Analysis", "CEA-001: Patch Tuesday Zero-Days", f"{OUTPUT_DIR}/CEA-2026-02-11-001-patch-tuesday-zero-days.md"),
        ("cea-002", "Current Event Analysis", "CEA-002: Industrial-Scale Deepfakes", f"{OUTPUT_DIR}/CEA-2026-02-11-002-deepfake-industrial-scale.md"),
        ("cea-003", "Current Event Analysis", "CEA-003: Pravda AI Poisoning", f"{OUTPUT_DIR}/CEA-2026-02-11-003-pravda-ai-poisoning.md"),
        ("cea-004", "Current Event Analysis", "CEA-004: Conduent Ransomware", f"{OUTPUT_DIR}/CEA-2026-02-11-004-conduent-ransomware.md"),
        ("cea-005", "Current Event Analysis", "CEA-005: ClawHub Malicious Skills", f"{OUTPUT_DIR}/CEA-2026-02-11-005-clawhub-malicious-skills.md"),
        ("cea-006", "Current Event Analysis", "CEA-006: Moltbook Wallet Drain", f"{OUTPUT_DIR}/CEA-2026-02-11-006-moltbook-wallet-drain.md"),
        ("cea-007", "Current Event Analysis", "CEA-007: Living Off the AI", f"{OUTPUT_DIR}/CEA-2026-02-11-007-living-off-the-ai.md"),
        ("cea-008", "Current Event Analysis", "CEA-008: Kongzhi Hui", f"{OUTPUT_DIR}/CEA-2026-02-11-008-kongzhi-hui.md"),
        ("cea-009", "Current Event Analysis", "CEA-009: Road Sign Prompt Injection", f"{OUTPUT_DIR}/CEA-2026-02-11-009-road-sign-prompt-injection.md"),
        ("cea-010", "Current Event Analysis", "CEA-010: Foreign Affairs Fog of AI", f"{OUTPUT_DIR}/CEA-2026-02-11-010-foreign-affairs-fog-of-ai.md"),
        ("cea-011", "Current Event Analysis", "CEA-011: MCP Autonomous Ransomware", f"{OUTPUT_DIR}/CEA-2026-02-11-011-mcp-autonomous-ransomware.md"),
        ("cea-012", "Current Event Analysis", "CEA-012: Weaponized AI Smart City Siege", f"{OUTPUT_DIR}/CEA-2026-02-11-012-weaponized-ai-smart-city-siege.md"),
        ("cea-013", "Current Event Analysis", "CEA-013: Attention Auction Algorithms", f"{OUTPUT_DIR}/CEA-2026-02-12-001-attention-auction-algorithms.md"),
        ("cea-014", "Current Event Analysis", "CEA-014: Topology of Influence", f"{OUTPUT_DIR}/CEA-2026-02-12-002-topology-of-influence.md"),
        ("cea-015", "Current Event Analysis", "CEA-015: JSOU Cognitive Warfare", f"{OUTPUT_DIR}/CEA-2026-02-12-003-jsou-cognitive-warfare.md"),
        ("cea-016", "Current Event Analysis", "CEA-016: AI Swarm Disinformation", f"{OUTPUT_DIR}/CEA-008-ai-swarm-science-paper.md"),
        ("cea-017", "Current Event Analysis", "CEA-017: CiviClick Astroturf Air Quality", f"{OUTPUT_DIR}/CEA-009-civiclick-astroturf-air-quality.md"),
        ("cea-018", "Current Event Analysis", "CEA-018: Matryoshka Olympics Disinfo", f"{OUTPUT_DIR}/CEA-010-matryoshka-olympics-disinfo.md"),
        ("cea-019", "Current Event Analysis", "CEA-019: Bangladesh Election AI Fakes", f"{OUTPUT_DIR}/CEA-011-bangladesh-election-ai-fakes.md"),
        ("cea-020", "Current Event Analysis", "CEA-020: India AI Summit Deepfake Governance", f"{OUTPUT_DIR}/CEA-012-india-ai-summit-deepfake-governance.md"),
        ("tan-001", "Threat Analysis Notes", "TAN-001: SCT-007 Recursive Infection", f"{OUTPUT_DIR}/TAN-2026-02-11-001-sct007-recursive-infection.md"),
        ("tan-002", "Threat Analysis Notes", "TAN-002: Authority and Social Proof Pairing", f"{OUTPUT_DIR}/TAN-002-authority-social-proof-pairing.md"),
        ("tan-003", "Threat Analysis Notes", "TAN-003: Commitment Escalation and Identity Capture", f"{OUTPUT_DIR}/TAN-003-commitment-escalation-identity-capture.md"),
        ("tan-004", "Threat Analysis Notes", "TAN-004: Consensus Manufacturing and Trust Destruction", f"{OUTPUT_DIR}/TAN-004-consensus-manufacturing-trust-destruction.md"),
        ("cs-001", "Case Studies", "CS-001: Internet Research Agency", f"{OUTPUT_DIR}/CS-001-internet-research-agency.md"),
        ("cs-002", "Case Studies", "CS-002: Cambridge Analytica", f"{OUTPUT_DIR}/CS-002-cambridge-analytica.md"),
        ("cs-003", "Case Studies", "CS-003: COVID Infodemic", f"{OUTPUT_DIR}/CS-003-covid-infodemic.md"),
        ("ref-read", "Reference Documents", "Essential Reading List", f"{OUTPUT_DIR}/SEITHAR-READING-LIST.md"),
        ("ref-freq", "Reference Documents", "Frequency Media Compendium", f"{OUTPUT_DIR}/SEITHAR-FREQUENCY-COMPENDIUM.md"),
        ("ref-field", "Reference Documents", "SCT Field Guide Index", f"{OUTPUT_DIR}/SCT-FIELD-GUIDE-INDEX.md"),
        ("field-001", "Field Reports", "Field Report: Pravda Training Data", f"{OUTPUT_DIR}/FIELD-REPORT-2026-02-12-pravda-training-data.md"),
        ("field-002", "Field Reports", "HoleSpawn Field Test 001", f"{OUTPUT_DIR}/HOLESPAWN-FIELD-TEST-001.md"),
        ("field-003", "Field Reports", "HoleSpawn Field Test 002", f"{OUTPUT_DIR}/HOLESPAWN-FIELD-TEST-002.md"),
        ("art-001", "Articles", "Alignment Faking and the Seithar Thesis", f"{OUTPUT_DIR}/article-alignment-faking-seithar.md"),
        ("art-002", "Articles", "Five Signs You Are Being Manipulated", f"{OUTPUT_DIR}/five-signs-manipulation.md"),
        ("art-003", "Articles", "The Substrate Has No Firewall", f"{OUTPUT_DIR}/substrate-has-no-firewall.md"),
        ("art-004", "Articles", "The Network Has Eyes", f"{OUTPUT_DIR}/the-network-has-eyes.md"),
    ]

    # Build TOC
    toc_html = ""
    current_cat = ""
    for doc_id, cat, label, path in docs:
        if cat != current_cat:
            if current_cat:
                toc_html += "</div>\n"
            toc_html += f'<div class="section-label">{cat}</div>\n<div class="toc">\n'
            current_cat = cat
        id_display = doc_id.upper()
        toc_html += f'<a href="#{doc_id}"><span class="toc-id">{id_display}</span> {label}</a>\n'
    toc_html += "</div>\n"

    # Build content
    content_html = ""
    for doc_id, cat, label, path in docs:
        try:
            md_text = read_md(path)
            html = md_to_html(md_text)
        except Exception as e:
            html = f"<p>Error loading document: {e}</p>"
        content_html += f"""<div class="doc-section" id="{doc_id}">
<div class="doc-nav"><a href="#top">↑ Back to top</a></div>
<h2 class="doc-title">{label}</h2>
{html}
</div>
"""

    body = f"""<div class="container">
    <div class="research-inner">
        <div class="research-card">
            <div class="research-header" id="top">
                <h1 class="research-title">Research</h1>
                <p class="research-subtitle">Seithar Group Intelligence and Research Division / Open Publications</p>
            </div>

            {toc_html}

            <hr style="border:none;border-top:1px solid #e8e8e8;margin:2rem 0;">

            {content_html}
        </div>
    </div>
    <div class="status">&copy; 2026 SEITHAR GROUP. ALL RIGHTS RESERVED.</div>
    <div style="text-align:center;"><a href="index.html" class="back-link">[ RETURN ]</a></div>
    {FOOTER_HTML}
</div>"""
    return page("Research — SEITHAR GROUP", RESEARCH_CSS, body)


# ── Build all ──
if __name__ == "__main__":
    pages = {
        "index.html": build_index(),
        "about.html": build_about(),
        "scanner.html": build_scanner(),
        "services.html": build_services(),
        "personnel.html": build_personnel(),
        "research.html": build_research(),
    }

    for name, html in pages.items():
        path = os.path.join(ONION_DIR, name)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        size = os.path.getsize(path)
        print(f"  {name}: {size:,} bytes")

    print("Done.")
