#!/usr/bin/env python3
"""Build static onion site pages from clearnet templates + markdown research."""

import os
import re
import markdown
from pathlib import Path

RESEARCH_DIR = Path.home() / "seithar-research"
OUTPUT_DIR = Path.home() / "seithar-site" / "onion"

# ── Base CSS (clearnet styles.css converted: vw/vh → px/rem, inline) ──

BASE_CSS = """
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background-color: #ffffff;
    color: #1a1a1a;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
a { color: #1a1a1a; text-decoration: none; transition: opacity 0.2s ease; }
a:hover { opacity: 0.5; }
a:visited { color: #1a1a1a; }

.container {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 60px 80px;
}

.timer {
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

.waiver-link, .discord-link, .back-link {
    color: #1a1a1a;
    text-decoration: none;
    font-size: 14px;
    letter-spacing: 0.08em;
    font-weight: 400;
    text-transform: uppercase;
}
.waiver-link:hover, .discord-link:hover, .back-link:hover { opacity: 0.5; }
.waiver-link:visited, .discord-link:visited, .back-link:visited { color: #1a1a1a; }

.back-link { margin-top: 60px; }

.status {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    letter-spacing: 0.12em;
    color: #666666;
    font-weight: 300;
    text-transform: uppercase;
}

.section-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #666;
    text-transform: uppercase;
}

.spacer { height: 24px; }
.spacer-sm { height: 16px; }

/* About page */
body.about-page .container {
    justify-content: flex-start;
    padding: 80px 120px;
    text-align: left;
}
.about-content { max-width: 700px; width: 100%; margin: 0 auto 60px; }
.about-content h1 {
    font-size: 28px;
    font-weight: 400;
    letter-spacing: 0.1em;
    margin-bottom: 40px;
    color: #1a1a1a;
    text-transform: uppercase;
}
.about-content p {
    font-size: 16px;
    line-height: 2;
    letter-spacing: 0.02em;
    margin-bottom: 28px;
    color: #1a1a1a;
    font-weight: 300;
}
.about-links { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; margin-bottom: 28px; }
.about-links .back-link { margin-top: 0; }

/* Personnel page */
body.personnel-page .container {
    justify-content: flex-start;
    padding: 60px 80px 80px;
    text-align: left;
}
.personnel-inner { max-width: 900px; margin: 0 auto; width: 100%; }
.personnel-header { text-align: center; margin-bottom: 40px; }
.personnel-header .header-label {
    font-size: 10px; letter-spacing: 6px; text-transform: uppercase; color: #666666; margin-bottom: 12px;
}
.personnel-header h1 {
    font-size: 28px; font-weight: 400; letter-spacing: 0.12em; color: #1a1a1a; text-transform: uppercase; margin-bottom: 4px;
}
.personnel-header .header-jp { font-size: 12px; color: #666666; letter-spacing: 0.15em; margin-bottom: 16px; }
.personnel-header .header-line { width: 60px; height: 1px; background: #1a1a1a; margin: 0 auto 16px; }
.personnel-header .header-subtitle { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #666666; }
.personnel-grid { display: flex; flex-direction: column; gap: 36px; }
.person-card { border: 1px solid #e0e0e0; background: #fafafa; }
.person-card .card-header { display: flex; align-items: stretch; border-bottom: 1px solid #e0e0e0; }
.person-card .card-photo { width: 180px; min-height: 220px; background: #f0f0f0; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.person-card .card-photo-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.person-card .avatar-block { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
.person-card .avatar-glyph { font-size: 64px; font-weight: 700; color: #d0d0d0; }
.person-card .card-info { flex: 1; padding: 25px 30px; display: flex; flex-direction: column; justify-content: center; }
.person-card .person-name { font-size: 1.2rem; font-weight: 400; letter-spacing: 0.08em; color: #1a1a1a; text-transform: uppercase; margin-bottom: 2px; }
.person-card .person-name-jp { font-size: 12px; color: #666666; margin-bottom: 12px; }
.person-card .person-title { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #1a1a1a; margin-bottom: 12px; }
.person-card .person-meta { display: grid; grid-template-columns: auto 1fr; gap: 4px 15px; font-size: 11px; }
.person-card .meta-label { color: #666666; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; }
.person-card .meta-value { color: #1a1a1a; }
.person-card .meta-value a { color: #1a1a1a; text-decoration: none; }
.person-card .card-body { padding: 25px 30px; }
.person-card .bio-text { font-size: 12px; line-height: 1.9; color: #1a1a1a; margin-bottom: 20px; font-weight: 300; }
.person-card .specializations { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
.person-card .spec-tag { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border: 1px solid #e0e0e0; color: #666666; }
.person-card .publications { border-top: 1px solid #e0e0e0; padding-top: 20px; }
.person-card .pub-header { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #666666; margin-bottom: 12px; }
.person-card .pub-item { font-size: 11px; color: #1a1a1a; margin-bottom: 8px; padding-left: 12px; position: relative; line-height: 1.6; }
.person-card .pub-item::before { content: '\\2014'; position: absolute; left: 0; color: #999; }
.person-card .pub-title { font-style: italic; }
.person-card .pub-venue { color: #666666; font-size: 10px; }
.person-card .card-footer { border-top: 1px solid #e0e0e0; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 2px; color: #666666; }
.person-card .status-indicator { display: flex; align-items: center; gap: 6px; }
.person-card .status-dot { width: 5px; height: 5px; border-radius: 50%; background: #1a1a1a; }
.person-card .redacted { background: #1a1a1a; color: #1a1a1a; padding: 0 3px; user-select: none; font-size: 10px; }
.personnel-footer { text-align: center; margin-top: 60px; padding-top: 28px; border-top: 1px solid #e0e0e0; }
.personnel-footer .footer-jp { font-size: 18px; font-weight: 300; color: #1a1a1a; letter-spacing: 0.2em; margin-bottom: 20px; }
.personnel-footer .footer-text { font-size: 9px; letter-spacing: 4px; color: #666666; text-transform: uppercase; margin-bottom: 8px; }
.personnel-footer .footer-copy { font-size: 8px; color: #999; letter-spacing: 2px; }

/* Services page */
body.services-page .container {
    justify-content: flex-start;
    padding: 70px 120px 80px;
    text-align: left;
}
.services-inner { max-width: 800px; margin: 0 auto; width: 100%; }
.services-header { text-align: center; margin-bottom: 56px; }
.services-header .header-label { font-size: 10px; letter-spacing: 6px; text-transform: uppercase; color: #666666; margin-bottom: 12px; }
.services-header h1 { font-size: 28px; font-weight: 400; letter-spacing: 0.12em; color: #1a1a1a; text-transform: uppercase; margin-bottom: 16px; }
.services-header .header-line { width: 60px; height: 1px; background: #1a1a1a; margin: 0 auto 16px; }
.services-header .header-subtitle { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #666666; line-height: 2; }
.services-grid { display: flex; flex-direction: column; gap: 36px; }
.service-card { border: 1px solid #e0e0e0; background: #fafafa; }
.service-card .card-header { padding: 25px 30px 0; }
.service-card .service-code { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #999; margin-bottom: 8px; }
.service-card .service-name { font-size: 1.1rem; font-weight: 400; letter-spacing: 0.08em; color: #1a1a1a; text-transform: uppercase; margin-bottom: 4px; }
.service-card .service-name-jp { font-size: 12px; color: #666666; }
.service-card .card-body { padding: 20px 30px 25px; }
.service-card .service-desc { font-size: 12px; line-height: 2; color: #1a1a1a; font-weight: 300; margin-bottom: 20px; }
.service-card .deliverables { border-top: 1px solid #e0e0e0; padding-top: 18px; }
.service-card .del-header { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #666666; margin-bottom: 10px; }
.service-card .del-item { font-size: 11px; color: #1a1a1a; margin-bottom: 6px; padding-left: 12px; position: relative; line-height: 1.6; font-weight: 300; }
.service-card .del-item::before { content: '\\2014'; position: absolute; left: 0; color: #999; }
.service-card .card-footer { border-top: 1px solid #e0e0e0; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; letter-spacing: 2px; color: #666666; text-transform: uppercase; }
.engagement-section { text-align: center; margin-top: 56px; padding-top: 28px; border-top: 1px solid #e0e0e0; }
.engagement-section .eng-title { font-size: 10px; letter-spacing: 5px; text-transform: uppercase; color: #666666; margin-bottom: 24px; }
.engagement-section .eng-text { font-size: 12px; line-height: 2.2; color: #1a1a1a; font-weight: 300; max-width: 600px; margin: 0 auto 24px; }
.engagement-section .eng-contact { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #1a1a1a; font-weight: 400; }
.engagement-section .eng-contact a { color: #1a1a1a; text-decoration: none; }
.services-nav { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; align-items: center; }
.services-footer { text-align: center; margin-top: 40px; }
.services-footer .footer-jp { font-size: 14px; font-weight: 300; color: #999; letter-spacing: 0.15em; }

/* Research page */
body.research-page { overflow-y: auto; overflow-x: hidden; }
body.research-page .container {
    min-height: 100vh; height: auto; justify-content: flex-start;
    padding: 40px 60px 80px; text-align: left; align-items: stretch;
}
.research-inner { max-width: 820px; margin: 0 auto; width: 100%; }
.research-card {
    background: #ffffff; border-radius: 2px;
    box-shadow: 0 2px 24px rgba(0,0,0,0.08);
    padding: 2.5rem 2.5rem 3rem; margin-bottom: 2rem;
}
.research-header { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e8e8e8; }
.research-title { font-size: 1.4rem; font-weight: 400; letter-spacing: 0.12em; color: #1a1a1a; text-transform: uppercase; margin-bottom: 0.35rem; }
.research-subtitle { font-size: 12px; color: #666666; letter-spacing: 0.05em; }
.research-toc { margin-bottom: 2rem; }
.research-toc-title { font-size: 10px; letter-spacing: 0.12em; color: #666666; text-transform: uppercase; margin-bottom: 1rem; }
.research-toc-section { margin-bottom: 1.25rem; }
.research-toc-section-title { font-size: 10px; letter-spacing: 0.1em; color: #999; text-transform: uppercase; margin-bottom: 0.5rem; padding-left: 2px; }
.research-toc-list { display: flex; flex-direction: column; }
.toc-item { border-bottom: 1px solid #f0f0f0; display: flex; align-items: baseline; padding: 0.5rem 0; font-size: 13px; letter-spacing: 0.02em; color: #1a1a1a; text-decoration: none; }
.toc-item:hover { background: #f8f8f8; }
.toc-id { color: #888; font-size: 11px; min-width: 5.5em; flex-shrink: 0; }
.research-doc {
    margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 1px solid #e8e8e8; scroll-margin-top: 1rem;
}
.research-doc:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.research-doc-nav { font-size: 11px; margin-bottom: 1rem; }
.research-doc-nav a { color: #666; text-decoration: none; letter-spacing: 0.05em; }
.research-doc h1 { font-size: 1.25rem; font-weight: 400; letter-spacing: 0.04em; margin-bottom: 1rem; color: #1a1a1a; }
.research-doc h2 { font-size: 1rem; font-weight: 400; margin: 1.5rem 0 0.5rem; color: #1a1a1a; }
.research-doc h3 { font-size: 12px; font-weight: 500; margin: 1.25rem 0 0.35rem; color: #333; letter-spacing: 0.02em; text-transform: uppercase; }
.research-doc p { font-size: 14px; line-height: 1.8; color: #1a1a1a; margin-bottom: 1rem; font-weight: 300; }
.research-doc strong { font-weight: 500; color: #1a1a1a; }
.research-doc ul, .research-doc ol { margin: 1rem 0 1.5rem; padding-left: 1.5em; font-size: 14px; line-height: 1.75; color: #1a1a1a; font-weight: 300; }
.research-doc li { margin-bottom: 0.4em; }
.research-doc pre, .research-doc code { font-family: inherit; font-size: 12px; background: #f5f5f5; padding: 1px 4px; }
.research-doc pre { padding: 12px; overflow-x: auto; margin: 1rem 0; border: 1px solid #e0e0e0; }
.research-doc hr { border: none; border-top: 1px solid #e8e8e8; margin: 1.5rem 0; }
.research-doc table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 13px; }
.research-doc th, .research-doc td { border: 1px solid #e0e0e0; padding: 8px 12px; text-align: left; font-weight: 300; }
.research-doc th { background: #f5f5f5; font-weight: 400; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
.research-doc a { color: #1a1a1a; text-decoration: underline; text-underline-offset: 2px; }

/* Scanner page */
.scanner-container { max-width: 860px; margin: 0 auto; padding: 40px 20px; }
.scanner-header { text-align: center; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid #e0e0e0; }
.scanner-header h1 { font-size: 13px; font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase; color: #1a1a1a; margin-bottom: 6px; }
.scanner-subtitle { font-size: 11px; color: #999; letter-spacing: 0.12em; text-transform: uppercase; }
.scanner-version { font-size: 10px; color: #999; letter-spacing: 0.1em; margin-top: 4px; }
.scanner-label { font-size: 10px; font-weight: 400; letter-spacing: 0.18em; text-transform: uppercase; color: #666; margin-bottom: 10px; display: block; }
.scanner-notice { font-size: 12px; color: #666; line-height: 1.8; border: 1px solid #e0e0e0; padding: 20px; margin-bottom: 32px; font-weight: 300; }
.sct-grid { display: flex; flex-direction: column; gap: 2px; margin-bottom: 32px; }
.sct-item { border: 1px solid #e0e0e0; padding: 14px 18px; }
.sct-code { font-size: 10px; font-weight: 400; letter-spacing: 0.15em; text-transform: uppercase; color: #1a1a1a; margin-bottom: 4px; }
.sct-name { font-size: 12px; color: #666; }
.sct-desc { font-size: 11px; color: #999; margin-top: 6px; line-height: 1.6; font-weight: 300; }
footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; }
footer .footer-brand { font-size: 11px; font-weight: 400; letter-spacing: 0.18em; text-transform: uppercase; color: #1a1a1a; margin-bottom: 8px; }
footer .footer-links { margin-bottom: 12px; }
footer .footer-links a { color: #666; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 10px; }
footer .footer-jp { font-size: 11px; color: #999; letter-spacing: 0.05em; }

@media (max-width: 768px) {
    .container { padding: 40px 24px; }
    .timer { font-size: 32px; margin-bottom: 48px; }
    .waiver-link, .discord-link, .back-link { font-size: 12px; }
    body.about-page .container { padding: 48px 32px; }
    .about-content h1 { font-size: 20px; }
    .about-content p { font-size: 14px; }
    body.personnel-page .container { padding: 40px 20px 60px; }
    .personnel-header h1 { font-size: 20px; }
    .person-card .card-header { flex-direction: column; }
    .person-card .card-photo { width: 100%; min-height: 150px; }
    body.services-page .container { padding: 40px 24px 60px; }
    .services-header h1 { font-size: 20px; }
    body.research-page .container { padding: 24px 16px 60px; }
    .research-card { padding: 1.5rem 1.25rem 2rem; }
}
"""

def strip_frontmatter(text):
    if text.startswith('---'):
        end = text.find('---', 3)
        if end != -1:
            return text[end+3:].lstrip('\n')
    return text

def md_to_html(md_text):
    md_text = strip_frontmatter(md_text)
    return markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'toc'])

def wrap_page(title, body_class, content, extra_css=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>{BASE_CSS}{extra_css}</style>
</head>
<body{' class="' + body_class + '"' if body_class else ''}>
{content}
</body>
</html>"""

# ── Document manifest (same as clearnet research.html JS) ──

DOCS = [
    ('doctrine', 'doctrine', 'The Seithar Doctrine', 'output/THE-SEITHAR-DOCTRINE.md'),
    ('srp-001', 'srp', 'SRP-001: The Convergence Thesis', '001-convergence-thesis.md'),
    ('srp-002', 'srp', 'SRP-002: Wetiko in the Wire', '002-wetiko-in-the-wire.md'),
    ('srp-003', 'srp', 'SRP-003: Binding Protocols', '003-binding-protocols.md'),
    ('srp-004', 'srp', 'SRP-004: The Sunyata Protocol', '004-sunyata-protocol.md'),
    ('srp-005', 'srp', 'SRP-005: Experimental Substrate Manipulation', '005-experimental-substrate-manipulation.md'),
    ('srp-006', 'srp', 'SRP-006: Digital Substrate Manipulation', '006-digital-substrate-manipulation.md'),
    ('srp-007', 'srp', 'SRP-007: Substrate Topology', '007-substrate-topology.md'),
    ('srp-008', 'srp', 'SRP-008: Convergence Proof', '008-convergence-proof.md'),
    ('srp-009', 'srp', 'SRP-009: The Libidinal Attack Surface', 'SRP-009-libidinal-attack-surface.md'),
    ('srp-010', 'srp', 'SRP-010: Narrative Engineering History', 'output/SRP-010-narrative-engineering-history.md'),
    ('srp-011', 'srp', 'SRP-011: The Great Forgetting', 'output/SRP-011-the-great-forgetting.md'),
    ('srp-012', 'srp', 'SRP-012: Nigredo of the Noosphere', 'output/SRP-012-nigredo-of-the-noosphere.md'),
    ('cea-001', 'cea', 'CEA-001: Patch Tuesday Zero-Days', 'output/CEA-2026-02-11-001-patch-tuesday-zero-days.md'),
    ('cea-002', 'cea', 'CEA-002: Industrial-Scale Deepfakes', 'output/CEA-2026-02-11-002-deepfake-industrial-scale.md'),
    ('cea-003', 'cea', 'CEA-003: Pravda AI Poisoning', 'output/CEA-2026-02-11-003-pravda-ai-poisoning.md'),
    ('cea-004', 'cea', 'CEA-004: Conduent Ransomware', 'output/CEA-2026-02-11-004-conduent-ransomware.md'),
    ('cea-005', 'cea', 'CEA-005: ClawHub Malicious Skills', 'output/CEA-2026-02-11-005-clawhub-malicious-skills.md'),
    ('cea-006', 'cea', 'CEA-006: Moltbook Wallet Drain', 'output/CEA-2026-02-11-006-moltbook-wallet-drain.md'),
    ('cea-007', 'cea', 'CEA-007: Living Off the AI', 'output/CEA-2026-02-11-007-living-off-the-ai.md'),
    ('cea-008', 'cea', 'CEA-008: Kongzhi Hui', 'output/CEA-2026-02-11-008-kongzhi-hui.md'),
    ('cea-009', 'cea', 'CEA-009: Road Sign Prompt Injection', 'output/CEA-2026-02-11-009-road-sign-prompt-injection.md'),
    ('cea-010', 'cea', 'CEA-010: Foreign Affairs Fog of AI', 'output/CEA-2026-02-11-010-foreign-affairs-fog-of-ai.md'),
    ('cea-011', 'cea', 'CEA-011: MCP Autonomous Ransomware', 'output/CEA-2026-02-11-011-mcp-autonomous-ransomware.md'),
    ('cea-012', 'cea', 'CEA-012: Weaponized AI Smart City Siege', 'output/CEA-2026-02-11-012-weaponized-ai-smart-city-siege.md'),
    ('cea-013', 'cea', 'CEA-013: Attention Auction Algorithms', 'output/CEA-2026-02-12-001-attention-auction-algorithms.md'),
    ('cea-014', 'cea', 'CEA-014: Topology of Influence', 'output/CEA-2026-02-12-002-topology-of-influence.md'),
    ('cea-015', 'cea', 'CEA-015: JSOU Cognitive Warfare', 'output/CEA-2026-02-12-003-jsou-cognitive-warfare.md'),
    ('cea-016', 'cea', 'CEA-016: AI Swarm Disinformation', 'output/CEA-008-ai-swarm-science-paper.md'),
    ('cea-017', 'cea', 'CEA-017: CiviClick Astroturf Air Quality', 'output/CEA-009-civiclick-astroturf-air-quality.md'),
    ('cea-018', 'cea', 'CEA-018: Matryoshka Olympics Disinfo', 'output/CEA-010-matryoshka-olympics-disinfo.md'),
    ('cea-019', 'cea', 'CEA-019: Bangladesh Election AI Fakes', 'output/CEA-011-bangladesh-election-ai-fakes.md'),
    ('cea-020', 'cea', 'CEA-020: India AI Summit Deepfake Governance', 'output/CEA-012-india-ai-summit-deepfake-governance.md'),
    ('tan-001', 'tan', 'TAN-001: SCT-007 Recursive Infection', 'output/TAN-2026-02-11-001-sct007-recursive-infection.md'),
    ('tan-002', 'tan', 'TAN-002: Authority and Social Proof Pairing', 'output/TAN-002-authority-social-proof-pairing.md'),
    ('tan-003', 'tan', 'TAN-003: Commitment Escalation and Identity Capture', 'output/TAN-003-commitment-escalation-identity-capture.md'),
    ('tan-004', 'tan', 'TAN-004: Consensus Manufacturing and Trust Destruction', 'output/TAN-004-consensus-manufacturing-trust-destruction.md'),
    ('cs-001', 'cs', 'CS-001: Internet Research Agency', 'output/CS-001-internet-research-agency.md'),
    ('cs-002', 'cs', 'CS-002: Cambridge Analytica', 'output/CS-002-cambridge-analytica.md'),
    ('cs-003', 'cs', 'CS-003: COVID Infodemic', 'output/CS-003-covid-infodemic.md'),
    ('ref-read', 'ref', 'Essential Reading List', 'output/SEITHAR-READING-LIST.md'),
    ('ref-freq', 'ref', 'Frequency Media Compendium', 'output/SEITHAR-FREQUENCY-COMPENDIUM.md'),
    ('ref-field', 'ref', 'SCT Field Guide Index', 'output/SCT-FIELD-GUIDE-INDEX.md'),
    ('field-001', 'field', 'Field Report: Pravda Training Data', 'output/FIELD-REPORT-2026-02-12-pravda-training-data.md'),
    ('field-002', 'field', 'HoleSpawn Field Test 001', 'output/HOLESPAWN-FIELD-TEST-001.md'),
    ('field-003', 'field', 'HoleSpawn Field Test 002', 'output/HOLESPAWN-FIELD-TEST-002.md'),
    ('art-001', 'article', 'Alignment Faking and the Seithar Thesis', 'output/article-alignment-faking-seithar.md'),
    ('art-002', 'article', 'Five Signs You Are Being Manipulated', 'output/five-signs-manipulation.md'),
    ('art-003', 'article', 'The Substrate Has No Firewall', 'output/substrate-has-no-firewall.md'),
    ('art-004', 'article', 'The Network Has Eyes', 'output/the-network-has-eyes.md'),
]

CAT_NAMES = {
    'doctrine': 'The Doctrine',
    'srp': 'Strategic Research Papers',
    'cea': 'Current Event Analysis',
    'tan': 'Threat Analysis Notes',
    'cs': 'Case Studies',
    'ref': 'Reference Documents',
    'field': 'Field Reports',
    'article': 'Articles',
}

# Also include extra docs found on disk but not in manifest
EXTRA_DOCS_CHECKED = set()
for d in DOCS:
    EXTRA_DOCS_CHECKED.add(d[3])

def build_index():
    content = """<div class="container">
    <div class="timer">SEITHAR GROUP</div>
    <div class="link-container">
        <div style="font-size:11px; letter-spacing:0.15em; color:#999; margin-bottom:16px; text-transform:uppercase;">Cognitive Operations Research Division &nbsp; 認知作戦</div>
        <a href="about.html" class="waiver-link">[ ABOUT ]</a>
        <a href="personnel.html" class="waiver-link">[ PERSONNEL ]</a>
        <a href="research.html" class="waiver-link">[ RESEARCH ]</a>
        <a href="scanner.html" class="waiver-link">[ SCANNER ]</a>
        <a href="services.html" class="waiver-link">[ SERVICES ]</a>
        <div class="spacer"></div>
        <div class="section-label">Clearnet Mirror</div>
        <a href="https://seithar.com" class="waiver-link" target="_blank">[ SEITHAR.COM ]</a>
        <div class="spacer"></div>
        <div class="section-label">External</div>
        <a href="https://discord.gg/MktZyb2bvx" class="waiver-link" target="_blank">[ DISCORD ]</a>
        <a href="https://x.com/SeitharGroup" class="waiver-link" target="_blank">[ X / TWITTER ]</a>
        <a href="https://github.com/Mirai8888" class="waiver-link" target="_blank">[ GITHUB ]</a>
        <a href="https://seithar.substack.com" class="waiver-link" target="_blank">[ SUBSTACK ]</a>
        <a href="https://www.moltbook.com/u/kenshusei" class="waiver-link" target="_blank">[ MOLTBOOK ]</a>
        <a href="https://fleshengine.com" class="waiver-link" target="_blank">[ FLESHENGINE ]</a>
        <div class="spacer"></div>
        <div class="section-label">Resources</div>
        <a href="https://github.com/Mirai8888/seithar-cogdef" class="waiver-link" target="_blank">[ COGNITIVE DEFENSE TOOLKIT ]</a>
        <a href="https://github.com/Mirai8888/seithar-research" class="waiver-link" target="_blank">[ RESEARCH ARCHIVE ]</a>
    </div>
    <div class="status">&copy; 2026 SEITHAR GROUP. ALL RIGHTS RESERVED. &nbsp; 認知作戦</div>
</div>"""
    return wrap_page("SEITHAR GROUP", "", content)

def build_about():
    content = """<div class="container">
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
        <a href="index.html" class="back-link">[ RETURN ]</a>
    </div>
    <div class="status">&copy; 2026 SEITHAR GROUP. ALL RIGHTS RESERVED.</div>
</div>"""
    return wrap_page("ABOUT — SEITHAR GROUP", "about-page", content)

def build_research():
    # Build TOC and content from markdown files
    cats = {}
    for doc_id, cat, label, path in DOCS:
        cats.setdefault(cat, [])
        cats[cat].append((doc_id, label, path))

    toc_html = '<div class="research-toc"><div class="research-toc-title">Publications</div>\n'
    content_html = '<div class="research-content-wrap">\n'

    for cat_key in ['doctrine', 'srp', 'cea', 'tan', 'cs', 'ref', 'field', 'article']:
        if cat_key not in cats:
            continue
        toc_html += f'<div class="research-toc-section">\n'
        toc_html += f'<div class="research-toc-section-title">{CAT_NAMES[cat_key]}</div>\n'
        toc_html += f'<nav class="research-toc-list">\n'

        for doc_id, label, path in cats[cat_key]:
            display_id = doc_id.upper().replace('-', '-')
            display_label = re.sub(r'^[A-Z]+-\d+:\s*', '', label)
            toc_html += f'<a href="#{doc_id}" class="toc-item"><span class="toc-id">{display_id}</span>{display_label}</a>\n'

            # Read and convert markdown
            full_path = RESEARCH_DIR / path
            if full_path.exists():
                md_text = full_path.read_text(encoding='utf-8')
                html_body = md_to_html(md_text)
            else:
                html_body = f'<p><em>Document not found: {path}</em></p>'

            content_html += f'<div id="{doc_id}" class="research-doc">\n'
            content_html += f'<div class="research-doc-nav"><a href="#top">Back to list</a></div>\n'
            content_html += html_body
            content_html += '\n</div>\n'

        toc_html += '</nav>\n</div>\n'

    toc_html += '</div>\n'
    content_html += '</div>\n'

    body = f"""<div class="container" id="top">
    <div class="research-inner">
        <div class="research-card">
            <div class="research-header">
                <h1 class="research-title">Research</h1>
                <p class="research-subtitle">Seithar Group Intelligence and Research Division / Open Publications</p>
            </div>
            {toc_html}
            {content_html}
        </div>
    </div>
    <div class="status">&copy; 2026 SEITHAR GROUP. ALL RIGHTS RESERVED.</div>
    <a href="index.html" class="back-link">[ RETURN ]</a>
</div>"""
    return wrap_page("Research — SEITHAR GROUP", "research-page", body)

def build_services():
    # Directly from clearnet but with inline CSS, no JS, no vw units
    content = """<div class="container">
    <div class="services-inner">
        <div class="services-header">
            <div class="header-label">Seithar Group</div>
            <h1>Operations &amp; Consulting</h1>
            <div class="header-line"></div>
            <div class="header-subtitle">Cognitive threat assessment, influence forensics, operational deployment</div>
        </div>
        <div class="services-grid">
            <div class="service-card">
                <div class="card-header">
                    <div class="service-code">SVC-001</div>
                    <div class="service-name">Cognitive Threat Assessment</div>
                    <div class="service-name-jp">認知脅威評価</div>
                </div>
                <div class="card-body">
                    <div class="service-desc">Comprehensive mapping of an organization's cognitive vulnerability surface. We identify narrative dependencies, exploitable identity structures, and active influence vectors targeting your personnel, brand, or information ecosystem. Analysis employs the Seithar Cognitive Taxonomy (SCT-001 through SCT-012) cross-referenced against MITRE ATT&amp;CK and DISARM frameworks.</div>
                    <div class="deliverables">
                        <div class="del-header">Deliverables</div>
                        <div class="del-item">Full vulnerability surface map with SCT classification</div>
                        <div class="del-item">Active threat vector identification and attribution</div>
                        <div class="del-item">Narrative dependency graph of key personnel</div>
                        <div class="del-item">Prioritized remediation protocol</div>
                    </div>
                </div>
                <div class="card-footer"><span>Duration: 2-4 weeks</span><span>Clearance: Standard</span></div>
            </div>
            <div class="service-card">
                <div class="card-header">
                    <div class="service-code">SVC-002</div>
                    <div class="service-name">Influence Operation Forensics</div>
                    <div class="service-name-jp">影響工作分析</div>
                </div>
                <div class="card-body">
                    <div class="service-desc">Post-hoc or real-time forensic analysis of suspected influence operations. We decompose active campaigns into constituent techniques, map information laundering chains, identify amplification infrastructure, and attribute operational patterns to known playbooks.</div>
                    <div class="deliverables">
                        <div class="del-header">Deliverables</div>
                        <div class="del-item">DISARM-mapped operation chain reconstruction</div>
                        <div class="del-item">SCT technique classification per campaign phase</div>
                        <div class="del-item">Amplification network topology</div>
                        <div class="del-item">Attribution confidence assessment</div>
                        <div class="del-item">Counter-operation recommendations</div>
                    </div>
                </div>
                <div class="card-footer"><span>Duration: 1-3 weeks</span><span>Clearance: Standard</span></div>
            </div>
            <div class="service-card">
                <div class="card-header">
                    <div class="service-code">SVC-003</div>
                    <div class="service-name">Substrate Profiling</div>
                    <div class="service-name-jp">基質分析</div>
                </div>
                <div class="card-body">
                    <div class="service-desc">Deep behavioral profiling of individuals or network clusters using the HoleSpawn methodology. Automated collection and analysis of publicly available social content to extract communication patterns, narrative dependencies, identity load-bearing structures, and exploitable behavioral vectors.</div>
                    <div class="deliverables">
                        <div class="del-header">Deliverables</div>
                        <div class="del-item">Target behavioral profile with vulnerability classification</div>
                        <div class="del-item">Communication style and sentiment analysis</div>
                        <div class="del-item">Network position and influence topology</div>
                        <div class="del-item">Engagement strategy with predicted response vectors</div>
                    </div>
                </div>
                <div class="card-footer"><span>Duration: 3-7 days per target</span><span>Clearance: Elevated</span></div>
            </div>
            <div class="service-card">
                <div class="card-header">
                    <div class="service-code">SVC-004</div>
                    <div class="service-name">Defensive Inoculation</div>
                    <div class="service-name-jp">防御接種</div>
                </div>
                <div class="card-body">
                    <div class="service-desc">Training programs and institutional protocols derived from McGuire inoculation theory, adapted for the cognitive warfare environment. We expose personnel to weakened forms of influence techniques they are likely to encounter, building resistance before hostile contact.</div>
                    <div class="deliverables">
                        <div class="del-header">Deliverables</div>
                        <div class="del-item">Custom inoculation curriculum (12 SCT vectors)</div>
                        <div class="del-item">Red team simulation of likely attack scenarios</div>
                        <div class="del-item">Pre/post resistance assessment</div>
                        <div class="del-item">Ongoing monitoring protocol</div>
                    </div>
                </div>
                <div class="card-footer"><span>Duration: 2-6 weeks</span><span>Clearance: Standard</span></div>
            </div>
            <div class="service-card">
                <div class="card-header">
                    <div class="service-code">SVC-005</div>
                    <div class="service-name">Custom Operations</div>
                    <div class="service-name-jp">特殊作戦</div>
                </div>
                <div class="card-body">
                    <div class="service-desc">Bespoke cognitive operations designed, planned, and executed to client specification. Scope ranges from targeted narrative interventions to full-spectrum information environment shaping. All operations employ Seithar methodology and tooling.</div>
                    <div class="deliverables">
                        <div class="del-header">Engagement Process</div>
                        <div class="del-item">Initial consultation and threat landscape review</div>
                        <div class="del-item">Operation design and approval</div>
                        <div class="del-item">Deployment with real-time monitoring</div>
                        <div class="del-item">Post-operation assessment and documentation</div>
                    </div>
                </div>
                <div class="card-footer"><span>Duration: Variable</span><span>Clearance: Elevated</span></div>
            </div>
        </div>
        <div class="engagement-section">
            <div class="eng-title">Engagement Terms</div>
            <div class="eng-text">All engagements are scoped during initial consultation. Pricing reflects operational complexity, target surface area, and required clearance level. The Seithar Group does not publish rate cards. We do not accept engagements we cannot complete to institutional standard.</div>
            <div class="eng-contact"><a href="mailto:seithargroup@gmail.com">seithargroup@gmail.com</a></div>
            <div style="margin-top:16px;"><a href="https://discord.gg/MktZyb2bvx" class="back-link" target="_blank" style="font-size:10px; letter-spacing:3px;">[ DISCORD ]</a></div>
        </div>
        <div class="services-nav">
            <a href="about.html" class="back-link">[ ABOUT ]</a>
            <a href="research.html" class="back-link">[ RESEARCH ]</a>
            <a href="scanner.html" class="back-link">[ SCANNER ]</a>
            <a href="index.html" class="back-link">[ RETURN ]</a>
        </div>
        <div class="services-footer"><div class="footer-jp">認知作戦</div></div>
    </div>
    <div class="status">&copy; 2026 SEITHAR GROUP. ALL RIGHTS RESERVED.</div>
</div>"""
    return wrap_page("SERVICES — SEITHAR GROUP", "services-page", content)

def build_personnel():
    content = """<div class="container">
    <div class="personnel-inner">
        <div class="personnel-header">
            <h1>Seithar Group</h1>
            <div class="header-jp">研究人員 — Research Personnel</div>
        </div>
        <div class="personnel-grid">
            <div class="person-card">
                <div class="card-header">
                    <div class="card-photo">
                        <div class="avatar-block"><span class="avatar-glyph">未</span></div>
                    </div>
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
                            <span class="meta-value"><a href="https://x.com/gOPwbi7qqtWeD9o" target="_blank">@gOPwbi7qqtWeD9o</a></span>
                            <span class="meta-label">GitHub</span>
                            <span class="meta-value"><a href="https://github.com/Mirai8888" target="_blank">Mirai8888</a></span>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="bio-text">Primary architect of the HoleSpawn cognitive profiling platform and originator of the trap architecture methodology. Research focus: identification of persistent narrative error clusters within individual substrates and the mapping of vulnerability surfaces through which controlled collapse can be initiated. Developed the autonomous binding protocol generation system — the first implementation of Skillful Means as executable software.<br><br>Background in adversarial narrative design. Conducted large-scale field research into cognitive susceptibility under alternative institutional framing for several years before formalizing methodology within Seithar. This prior work demonstrated that the mechanical self could be reliably destabilized through persistent informational exposure without the subject recognizing the intervention. Findings informed the development of HoleSpawn's profiling architecture.<br><br>Currently extending research into hybrid operation chain modeling (ThreadMap), which unifies technical exploitation infrastructure with cognitive substrate manipulation into single analytical surface. Maintains that the boundary between network penetration and identity penetration is taxonomic, not ontological. Both substrates yield to the same methodology: identify the error, bind the thread, shape the collapse.<br><br>Published work takes the form of functional offensive systems. Peer review is conducted through adversarial deployment.</div>
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
                    <div class="status-indicator"><div class="status-dot"></div><span>ACTIVE</span></div>
                </div>
            </div>
            <div class="person-card">
                <div class="card-header">
                    <div class="card-photo">
                        <div class="avatar-block"><span class="avatar-glyph">雪</span></div>
                    </div>
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
                            <span class="meta-value"><a href="https://x.com/YukiJunsei" target="_blank">@YukiJunsei</a></span>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="bio-text">Responsible for computational observation of narrative error networks as they evolve across time. Designed the temporal NLP pipeline for tracking sentiment drift, topic convergence, and vocabulary flattening across monitored populations — behavioral signatures that indicate Sunyata-adjacent state transition is occurring, whether induced or organic. Developed the cohort analysis framework that distinguishes between natural narrative dissolution and engineered informational frequency alignment.<br><br>Background in statistical modeling. Joined Seithar after observing that conventional data science approaches to social media analysis systematically misclassified influence signatures as noise. The field's failure was ontological: treating the mechanical self as ground truth rather than as the error network it is. Current work focuses on instrumenting the detection of narrative capture — the moment a substrate begins oscillating at an externally imposed frequency rather than generating its own.<br><br>Maintains the ThreatMouth intelligence calibration system. Responsible for ensuring the adversarial awareness feed remains synchronized with operator cognitive development trajectory. Where Mirai's methodology is intuitive and interventionist, Yuki's is empirical and observational. The two approaches produce complementary analytical surfaces. One maps the territory for collapse; the other measures whether collapse is proceeding.</div>
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
                    <div class="status-indicator"><div class="status-dot"></div><span>ACTIVE</span></div>
                </div>
            </div>
        </div>
        <div class="personnel-footer">
            <div class="footer-jp">認知作戦</div>
            <div class="footer-text">Seithar Group — Cognitive Operations Research Division</div>
            <div class="footer-text">Binding and Shaping of Informational Threads</div>
            <br>
            <div class="footer-copy" style="margin-top:8px;">If you are reading this page, your cognitive fingerprint has been recorded. This is not a threat. It is a research methodology.</div>
        </div>
    </div>
    <div class="status">&copy; 2026 SEITHAR GROUP. ALL RIGHTS RESERVED.</div>
    <a href="index.html" class="back-link">[ RETURN ]</a>
</div>"""
    return wrap_page("Research Personnel — SEITHAR GROUP", "personnel-page", content)

def build_scanner():
    """Static scanner page - shows the SCT taxonomy reference without JS functionality."""
    sct_items = [
        ('SCT-001', 'Emotional Hijacking', 'Exploiting affective processing to bypass rational evaluation. Targets fear, anger, disgust, or excitement to short-circuit analytical thinking.'),
        ('SCT-002', 'Information Asymmetry Exploitation', 'Leveraging what the target does not know. Selectively disclosing information to construct a misleading picture while technically stating facts.'),
        ('SCT-003', 'Authority Fabrication', 'Manufacturing trust signals the source does not legitimately possess. Inflating credentials, fabricating institutional affiliations, or citing nonexistent expertise.'),
        ('SCT-004', 'Social Proof Manipulation', 'Weaponizing herd behavior and conformity instincts. Manufacturing the appearance of consensus to bypass individual evaluation.'),
        ('SCT-005', 'Identity Targeting', "Attacks calibrated to the target's self-concept and group affiliations. Exploits in-group/out-group dynamics to override analytical processing."),
        ('SCT-006', 'Temporal Manipulation', 'Exploiting time pressure, temporal context, or strategic scheduling to prevent adequate analysis before action.'),
        ('SCT-007', 'Recursive Infection', "Self-replicating patterns where the target becomes the vector. Content designed to compel sharing regardless of the sharer's intent."),
        ('SCT-008', 'Direct Substrate Intervention', 'Physical or electrical modification of neural hardware bypassing informational processing entirely.'),
        ('SCT-009', 'Chemical Substrate Disruption', 'Pharmacological modification of neurochemical operating environment to alter cognitive processing.'),
        ('SCT-010', 'Sensory Channel Manipulation', 'Control, denial, or overload of sensory input channels to shape the information environment.'),
        ('SCT-011', 'Trust Infrastructure Destruction', 'Targeted compromise of social trust networks to disable collective cognition and isolate targets.'),
        ('SCT-012', 'Commitment Escalation', "Exploiting the subject's own behavioral outputs as capture mechanisms. Sequential commitments that ratchet engagement."),
    ]

    items_html = ""
    for code, name, desc in sct_items:
        items_html += f"""<div class="sct-item">
    <div class="sct-code">{code}</div>
    <div class="sct-name">{name}</div>
    <div class="sct-desc">{desc}</div>
</div>\n"""

    content = f"""<div class="scanner-container">
    <header class="scanner-header">
        <h1>[ Seithar Cognitive Threat Scanner ]</h1>
        <div class="scanner-subtitle">SCT Taxonomy Analysis — 12 Vectors</div>
        <div class="scanner-version">v2.0 — Reference Edition (Tor Mirror)</div>
    </header>

    <div class="scanner-notice">
        The interactive scanner requires client-side processing unavailable on this Tor mirror. Use the clearnet version at <a href="https://seithar.com/scanner.html">seithar.com/scanner.html</a> for live analysis, or download the full scanner from <a href="https://github.com/Mirai8888/seithar-cogdef">github.com/Mirai8888/seithar-cogdef</a>.
    </div>

    <span class="scanner-label">SCT Taxonomy — 12 Cognitive Exploitation Vectors</span>
    <div class="sct-grid">
        {items_html}
    </div>

    <div style="text-align:center; margin-top:32px;">
        <a href="index.html" class="back-link">[ RETURN ]</a>
    </div>

    <footer>
        <div class="footer-brand">[ Seithar Group ] — Cognitive Defense Division</div>
        <div class="footer-links">
            <a href="https://seithar.com">seithar.com</a>
            <a href="https://github.com/Mirai8888/seithar-cogdef">github</a>
            <a href="https://x.com/SeitharGroup">@SeitharGroup</a>
        </div>
        <div class="footer-jp">認知作戦</div>
    </footer>
</div>"""
    return wrap_page("Scanner — SEITHAR GROUP", "", content)


if __name__ == '__main__':
    pages = {
        'index.html': build_index(),
        'about.html': build_about(),
        'research.html': build_research(),
        'services.html': build_services(),
        'personnel.html': build_personnel(),
        'scanner.html': build_scanner(),
    }

    for name, html in pages.items():
        path = OUTPUT_DIR / name
        path.write_text(html, encoding='utf-8')
        size = len(html)
        print(f"  ✓ {name} ({size:,} bytes)")

    print(f"\nBuilt {len(pages)} pages in {OUTPUT_DIR}")
