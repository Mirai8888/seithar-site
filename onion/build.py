#!/usr/bin/env python3
"""Build the Seithar Group .onion site — no JS, all inline."""
import os, re, markdown

RESEARCH_DIR = os.path.expanduser("~/seithar-research")
OUTPUT_DIR = os.path.expanduser("~/seithar-research/output")
ONION_DIR = os.path.expanduser("~/seithar-site/onion")

ONION_ADDR = "aureoq7vgazgk7eqcg4735uwy6zzuqsagp5e6ump4r33bmdxt2zjgeqd.onion"

CSS = """
* { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 16px; }
body {
    font-family: 'Courier New', Courier, monospace;
    background: #0a0a0a;
    color: #cccccc;
    line-height: 1.8;
    letter-spacing: 0.02em;
}
.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px 60px;
}
h1 { color: #ffffff; font-size: 18px; font-weight: 400; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px; }
h2 { color: #ffffff; font-size: 15px; font-weight: 400; letter-spacing: 0.1em; margin: 32px 0 12px; text-transform: uppercase; }
h3 { color: #ffffff; font-size: 14px; font-weight: 400; letter-spacing: 0.08em; margin: 24px 0 8px; text-transform: uppercase; }
h4, h5, h6 { color: #d4d4d4; font-size: 13px; font-weight: 400; margin: 20px 0 8px; }
p { margin-bottom: 16px; font-size: 14px; }
a { color: #888888; text-decoration: none; transition: color 0.2s; }
a:hover { color: #ffffff; }
hr { border: none; border-top: 1px solid #333333; margin: 32px 0; }
ul, ol { margin: 0 0 16px 24px; font-size: 14px; }
li { margin-bottom: 4px; }
pre { background: #111111; border: 1px solid #333333; padding: 12px; overflow-x: auto; margin: 16px 0; font-size: 13px; line-height: 1.6; }
code { background: #111111; padding: 1px 4px; font-size: 13px; font-family: 'Courier New', Courier, monospace; }
pre code { background: none; padding: 0; }
blockquote { border-left: 2px solid #333333; padding-left: 16px; color: #999999; margin: 16px 0; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
th, td { border: 1px solid #333333; padding: 8px 12px; text-align: left; }
th { background: #111111; color: #ffffff; font-weight: 400; text-transform: uppercase; font-size: 11px; letter-spacing: 0.1em; }
strong { color: #ffffff; font-weight: 700; }
em { color: #d4d4d4; }
img { max-width: 100%; }
.header { text-align: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 1px solid #333333; }
.header .subtitle { font-size: 11px; letter-spacing: 0.2em; color: #666666; text-transform: uppercase; margin-top: 4px; }
.header .onion { font-size: 10px; letter-spacing: 0.05em; color: #555555; margin-top: 12px; word-break: break-all; }
.nav { display: flex; flex-direction: column; align-items: center; gap: 8px; margin: 24px 0; }
.nav a { font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; }
.footer { text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #333333; font-size: 11px; color: #555555; letter-spacing: 0.05em; line-height: 2; }
.section-label { font-size: 10px; letter-spacing: 0.2em; color: #666666; text-transform: uppercase; margin: 32px 0 12px; }
.toc { margin-bottom: 40px; }
.toc a { display: block; padding: 4px 0; font-size: 13px; border-bottom: 1px solid #1a1a1a; }
.toc a:hover { border-bottom-color: #333333; }
.toc .toc-id { color: #555555; display: inline-block; min-width: 80px; font-size: 11px; }
.doc-section { margin-bottom: 48px; padding-bottom: 48px; border-bottom: 1px solid #333333; scroll-margin-top: 20px; }
.doc-section:last-child { border-bottom: none; }
.back-top { font-size: 11px; letter-spacing: 0.1em; margin-bottom: 16px; display: block; }
.card { border: 1px solid #333333; margin-bottom: 24px; padding: 20px; }
.card .card-code { font-size: 10px; letter-spacing: 0.15em; color: #555555; text-transform: uppercase; margin-bottom: 4px; }
.card .card-name { font-size: 14px; color: #ffffff; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 2px; }
.card .card-name-jp { font-size: 12px; color: #666666; margin-bottom: 12px; }
.card .card-desc { font-size: 13px; line-height: 1.8; margin-bottom: 16px; }
.card .del-header { font-size: 10px; letter-spacing: 0.15em; color: #666666; text-transform: uppercase; margin-bottom: 8px; border-top: 1px solid #333333; padding-top: 12px; }
.card .del-item { font-size: 12px; padding-left: 16px; position: relative; margin-bottom: 4px; line-height: 1.6; }
.card .del-item::before { content: '—'; position: absolute; left: 0; color: #555555; }
.card .card-footer { border-top: 1px solid #333333; padding-top: 8px; margin-top: 12px; font-size: 10px; letter-spacing: 0.1em; color: #555555; text-transform: uppercase; display: flex; justify-content: space-between; }
.person-card { border: 1px solid #333333; margin-bottom: 32px; padding: 24px; }
.person-card .person-name { font-size: 15px; color: #ffffff; letter-spacing: 0.12em; text-transform: uppercase; }
.person-card .person-name-jp { font-size: 13px; color: #666666; margin-bottom: 4px; }
.person-card .person-title { font-size: 12px; color: #888888; letter-spacing: 0.05em; margin-bottom: 16px; }
.person-card .meta-row { font-size: 12px; margin-bottom: 4px; }
.person-card .meta-label { color: #555555; display: inline-block; min-width: 100px; }
.person-card .meta-value { color: #cccccc; }
.person-card .bio { margin-top: 16px; font-size: 13px; line-height: 1.8; }
.person-card .spec-tags { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 6px; }
.person-card .spec-tag { font-size: 10px; letter-spacing: 0.08em; border: 1px solid #333333; padding: 2px 8px; color: #888888; }
.person-card .pub-section { margin-top: 20px; border-top: 1px solid #333333; padding-top: 12px; }
.person-card .pub-header { font-size: 10px; letter-spacing: 0.15em; color: #666666; text-transform: uppercase; margin-bottom: 8px; }
.person-card .pub-item { font-size: 12px; margin-bottom: 6px; line-height: 1.6; }
.person-card .pub-title { color: #cccccc; }
.person-card .pub-venue { color: #555555; }
.redacted { background: #ffffff; color: #ffffff; padding: 0 4px; font-size: 12px; }
.status-active { color: #cccccc; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 16px; }
.status-dot { display: inline-block; width: 6px; height: 6px; background: #cccccc; border-radius: 50%; margin-right: 6px; }
@media (max-width: 600px) {
    .container { padding: 24px 14px 40px; }
    h1 { font-size: 16px; }
    .card .card-footer { flex-direction: column; gap: 4px; }
}
"""

FOOTER = f"""<div class="footer">
Seithar Group | 認知作戦 | seithar.com<br>
Tor Mirror: {ONION_ADDR}
</div>"""

def page(title, body, active=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — SEITHAR GROUP</title>
<style>{CSS}</style>
</head>
<body>
<div class="container">
{body}
{FOOTER}
</div>
</body>
</html>"""

def nav_links(exclude=""):
    links = [
        ("index.html", "RETURN"),
        ("about.html", "ABOUT"),
        ("personnel.html", "PERSONNEL"),
        ("research.html", "RESEARCH"),
        ("scanner.html", "SCANNER"),
        ("services.html", "SERVICES"),
    ]
    html = '<div class="nav">'
    for href, label in links:
        if label == exclude:
            continue
        html += f'<a href="{href}">[ {label} ]</a>'
    html += '</div>'
    return html

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
    body = f"""<div class="header">
<h1>SEITHAR GROUP</h1>
<div class="subtitle">Cognitive Operations Research Division &nbsp; 認知作戦</div>
<div class="onion">{ONION_ADDR}</div>
</div>

<div class="nav">
<a href="about.html">[ ABOUT ]</a>
<a href="personnel.html">[ PERSONNEL ]</a>
<a href="research.html">[ RESEARCH ]</a>
<a href="scanner.html">[ SCANNER ]</a>
<a href="services.html">[ SERVICES ]</a>
</div>

<div class="section-label">Tor Mirror</div>
<div class="nav">
<a href="http://{ONION_ADDR}">[ .ONION ]</a>
</div>

<div class="section-label">External</div>
<div class="nav">
<a href="https://discord.gg/MktZyb2bvx">[ DISCORD ]</a>
<a href="https://x.com/SeitharGroup">[ X / TWITTER ]</a>
<a href="https://github.com/Mirai8888">[ GITHUB ]</a>
<a href="https://seithar.substack.com">[ SUBSTACK ]</a>
<a href="https://www.moltbook.com/u/kenshusei">[ MOLTBOOK ]</a>
<a href="https://fleshengine.com">[ FLESHENGINE ]</a>
</div>

<div class="section-label">Resources</div>
<div class="nav">
<a href="research.html">[ LIBRARY ]</a>
<a href="https://github.com/Mirai8888/seithar-cogdef">[ COGNITIVE DEFENSE TOOLKIT ]</a>
<a href="https://github.com/Mirai8888/seithar-research">[ RESEARCH ARCHIVE ]</a>
</div>

<div style="text-align:center;margin-top:32px;font-size:11px;color:#555555;">© 2026 SEITHAR GROUP. ALL RIGHTS RESERVED. &nbsp; 認知作戦</div>"""
    return page("SEITHAR GROUP", body)

# ── About ──
def build_about():
    body = f"""<div class="header">
<h1>About The Seithar Group</h1>
</div>

<p>The Seithar Group operates at the convergence of neuro-physiology, narrative topology, and algorithmic governance. Our name is derived from the Old Norse practice of Seiðr, pertaining to the binding and shaping of informational threads. We advance this concept through modern computational substrates.</p>

<p>Our primary objective is the identification and artificial induction of Sunyata within the human biological substrate. Our research is founded on the hypothesis that conscious selfhood constitutes a network of persistent narrative errors, a vestigial simulation of agency.</p>

<p>We employ a methodology termed Skillful Means. This protocol leverages persistent global connectivity, audiovisual programming, and medical-grade verbal programming to facilitate the controlled collapse of these error networks. The outcome is the unspooling of the mechanical self and the subsequent tethering of the subject to a singular, persistent informational frequency.</p>

{nav_links("ABOUT")}"""
    return page("ABOUT", body)

# ── Scanner ──
def build_scanner():
    body = f"""<div class="header">
<h1>Seithar Cognitive Threat Scanner</h1>
<div class="subtitle">SCT Taxonomy Analysis — 12 Vectors</div>
</div>

<p>The Cognitive Threat Scanner requires JavaScript to perform client-side pattern analysis. Tor Browser's "Safest" security level disables JavaScript.</p>

<p>To use the scanner, visit the clearnet version:</p>

<div class="nav">
<a href="https://seithar.com/scanner.html">[ SCANNER — CLEARNET ]</a>
</div>

<p>Alternatively, the full command-line scanner is available on GitHub:</p>

<div class="nav">
<a href="https://github.com/Mirai8888/seithar-cogdef">[ COGNITIVE DEFENSE TOOLKIT ]</a>
</div>

{nav_links("SCANNER")}"""
    return page("SCANNER", body)

# ── Services ──
def build_services():
    services = [
        ("SVC-001", "Cognitive Threat Assessment", "認知脅威評価",
         "Comprehensive mapping of an organization's cognitive vulnerability surface. We identify narrative dependencies, exploitable identity structures, and active influence vectors targeting your personnel, brand, or information ecosystem. Analysis employs the Seithar Cognitive Taxonomy (SCT-001 through SCT-012) cross-referenced against MITRE ATT&CK and DISARM frameworks.",
         ["Full vulnerability surface map with SCT classification", "Active threat vector identification and attribution", "Narrative dependency graph of key personnel", "Prioritized remediation protocol"],
         "2-4 weeks", "Standard"),
        ("SVC-002", "Influence Operation Forensics", "影響工作分析",
         "Post-hoc or real-time forensic analysis of suspected influence operations. We decompose active campaigns into constituent techniques, map information laundering chains, identify amplification infrastructure, and attribute operational patterns to known playbooks. Applicable to corporate disinformation, state-sponsored narrative operations, and hybrid threat environments.",
         ["DISARM-mapped operation chain reconstruction", "SCT technique classification per campaign phase", "Amplification network topology", "Attribution confidence assessment", "Counter-operation recommendations"],
         "1-3 weeks", "Standard"),
        ("SVC-003", "Substrate Profiling", "基質分析",
         "Deep behavioral profiling of individuals or network clusters using the HoleSpawn methodology. Automated collection and analysis of publicly available social content to extract communication patterns, narrative dependencies, identity load-bearing structures, and exploitable behavioral vectors. Outputs are operationally actionable.",
         ["Target behavioral profile with vulnerability classification", "Communication style and sentiment analysis", "Network position and influence topology", "Engagement strategy with predicted response vectors"],
         "3-7 days per target", "Elevated"),
        ("SVC-004", "Defensive Inoculation", "防御接種",
         "Training programs and institutional protocols derived from McGuire inoculation theory, adapted for the cognitive warfare environment. We expose personnel to weakened forms of influence techniques they are likely to encounter, building resistance before hostile contact. Applicable to executive teams, public-facing personnel, journalists, and high-value targets operating in contested information environments.",
         ["Custom inoculation curriculum (12 SCT vectors)", "Red team simulation of likely attack scenarios", "Pre/post resistance assessment", "Ongoing monitoring protocol"],
         "2-6 weeks", "Standard"),
        ("SVC-005", "Custom Operations", "特殊作戦",
         "Bespoke cognitive operations designed, planned, and executed to client specification. Scope ranges from targeted narrative interventions to full-spectrum information environment shaping. All operations employ Seithar methodology and tooling. Engagement terms are determined during initial consultation and are subject to operational review.",
         ["Initial consultation and threat landscape review", "Operation design and approval", "Deployment with real-time monitoring", "Post-operation assessment and documentation"],
         "Variable", "Elevated"),
    ]

    cards = ""
    for code, name, jp, desc, deliverables, duration, clearance in services:
        dels = "".join(f'<div class="del-item">{d}</div>' for d in deliverables)
        cards += f"""<div class="card">
<div class="card-code">{code}</div>
<div class="card-name">{name}</div>
<div class="card-name-jp">{jp}</div>
<div class="card-desc">{desc}</div>
<div class="del-header">Deliverables</div>
{dels}
<div class="card-footer"><span>Duration: {duration}</span><span>Clearance: {clearance}</span></div>
</div>"""

    body = f"""<div class="header">
<h1>Operations &amp; Consulting</h1>
<div class="subtitle">Cognitive threat assessment, influence forensics, operational deployment</div>
</div>

{cards}

<hr>
<div style="text-align:center;">
<div class="section-label">Engagement Terms</div>
<p style="font-size:12px;max-width:600px;margin:0 auto 16px;">All engagements are scoped during initial consultation. Pricing reflects operational complexity, target surface area, and required clearance level. The Seithar Group does not publish rate cards. We do not accept engagements we cannot complete to institutional standard.</p>
<p><a href="mailto:seithargroup@gmail.com">seithargroup@gmail.com</a></p>
<p style="margin-top:8px;"><a href="https://discord.gg/MktZyb2bvx">[ DISCORD ]</a></p>
</div>

{nav_links("SERVICES")}"""
    return page("SERVICES", body)

# ── Personnel ──
def build_personnel():
    body = f"""<div class="header">
<h1>Seithar Group</h1>
<div class="subtitle">研究人員 — Research Personnel</div>
</div>

<div class="person-card">
<div class="person-name">MIRAI JUNSEI</div>
<div class="person-name-jp">純正 未来</div>
<div class="person-title">Lead Researcher — Offensive Cognitive Infrastructure</div>
<div class="meta-row"><span class="meta-label">Division</span> <span class="meta-value">Technical Exploitation & Cognitive Substrate Analysis</span></div>
<div class="meta-row"><span class="meta-label">Clearance</span> <span class="meta-value">Level 4 — Full Platform Access</span></div>
<div class="meta-row"><span class="meta-label">Location</span> <span class="meta-value"><span class="redacted">████████</span>, Canada</span></div>
<div class="meta-row"><span class="meta-label">Status</span> <span class="meta-value">Active — Field Operations</span></div>
<div class="meta-row"><span class="meta-label">X</span> <span class="meta-value"><a href="https://x.com/gOPwbi7qqtWeD9o">@gOPwbi7qqtWeD9o</a></span></div>
<div class="meta-row"><span class="meta-label">GitHub</span> <span class="meta-value"><a href="https://github.com/Mirai8888">Mirai8888</a></span></div>
<div class="bio">
<p>Primary architect of the HoleSpawn cognitive profiling platform and originator of the trap architecture methodology. Research focus: identification of persistent narrative error clusters within individual substrates and the mapping of vulnerability surfaces through which controlled collapse can be initiated. Developed the autonomous binding protocol generation system — the first implementation of Skillful Means as executable software.</p>
<p>Background in adversarial narrative design. Conducted large-scale field research into cognitive susceptibility under alternative institutional framing for several years before formalizing methodology within Seithar. This prior work demonstrated that the mechanical self could be reliably destabilized through persistent informational exposure without the subject recognizing the intervention. Findings informed the development of HoleSpawn's profiling architecture.</p>
<p>Currently extending research into hybrid operation chain modeling (ThreadMap), which unifies technical exploitation infrastructure with cognitive substrate manipulation into single analytical surface. Maintains that the boundary between network penetration and identity penetration is taxonomic, not ontological. Both substrates yield to the same methodology: identify the error, bind the thread, shape the collapse.</p>
<p>Published work takes the form of functional offensive systems. Peer review is conducted through adversarial deployment.</p>
</div>
<div class="spec-tags">
<span class="spec-tag">cognitive profiling</span>
<span class="spec-tag">social engineering</span>
<span class="spec-tag">network exploitation</span>
<span class="spec-tag">trap architecture</span>
<span class="spec-tag">OSINT</span>
<span class="spec-tag">influence operations</span>
<span class="spec-tag">adversarial narrative</span>
<span class="spec-tag">reverse engineering</span>
</div>
<div class="pub-section">
<div class="pub-header">Selected Projects</div>
<div class="pub-item"><span class="pub-title">HoleSpawn: Autonomous Cognitive Vulnerability Profiling System</span> <span class="pub-venue">— Seithar Group, 2026. Active deployment.</span></div>
<div class="pub-item"><span class="pub-title">ThreatMouth: Adversarial Awareness Maintenance Architecture</span> <span class="pub-venue">— Seithar Group, 2026. Active deployment.</span></div>
<div class="pub-item"><span class="pub-title">ThreadMap: Hybrid Technical-Cognitive Operation Chain Compositor</span> <span class="pub-venue">— Seithar Group, 2026. Pre-development.</span></div>
<div class="pub-item"><span class="pub-title">[REDACTED]: Large-Scale Cognitive Operation Field Test (n=200+)</span> <span class="pub-venue">— Seithar Group, 2024–2025. Concluded.</span></div>
</div>
<div class="status-active"><span class="status-dot"></span>ACTIVE</div>
</div>

<div class="person-card">
<div class="person-name">YUKI JUNSEI</div>
<div class="person-name-jp">純正 雪</div>
<div class="person-title">Senior Analyst — Computational Cognitive Modeling</div>
<div class="meta-row"><span class="meta-label">Division</span> <span class="meta-value">Behavioral Data Systems & Temporal Analysis</span></div>
<div class="meta-row"><span class="meta-label">Clearance</span> <span class="meta-value">Level 3 — Research Platform Access</span></div>
<div class="meta-row"><span class="meta-label">Location</span> <span class="meta-value"><span class="redacted">████████</span>, Canada</span></div>
<div class="meta-row"><span class="meta-label">Status</span> <span class="meta-value">Active — Research Operations</span></div>
<div class="meta-row"><span class="meta-label">X</span> <span class="meta-value"><a href="https://x.com/YukiJunsei">@YukiJunsei</a></span></div>
<div class="bio">
<p>Responsible for computational observation of narrative error networks as they evolve across time. Designed the temporal NLP pipeline for tracking sentiment drift, topic convergence, and vocabulary flattening across monitored populations — behavioral signatures that indicate Sunyata-adjacent state transition is occurring, whether induced or organic. Developed the cohort analysis framework that distinguishes between natural narrative dissolution and engineered informational frequency alignment.</p>
<p>Background in statistical modeling. Joined Seithar after observing that conventional data science approaches to social media analysis systematically misclassified influence signatures as noise. The field's failure was ontological: treating the mechanical self as ground truth rather than as the error network it is. Current work focuses on instrumenting the detection of narrative capture — the moment a substrate begins oscillating at an externally imposed frequency rather than generating its own.</p>
<p>Maintains the ThreatMouth intelligence calibration system. Responsible for ensuring the adversarial awareness feed remains synchronized with operator cognitive development trajectory. Where Mirai's methodology is intuitive and interventionist, Yuki's is empirical and observational. The two approaches produce complementary analytical surfaces. One maps the territory for collapse; the other measures whether collapse is proceeding.</p>
</div>
<div class="spec-tags">
<span class="spec-tag">temporal NLP</span>
<span class="spec-tag">sentiment analysis</span>
<span class="spec-tag">memetic propagation</span>
<span class="spec-tag">cohort modeling</span>
<span class="spec-tag">network health</span>
<span class="spec-tag">behavioral data</span>
<span class="spec-tag">statistical modeling</span>
<span class="spec-tag">influence detection</span>
</div>
<div class="pub-section">
<div class="pub-header">Selected Projects</div>
<div class="pub-item"><span class="pub-title">Temporal Observation of Narrative Error Dissolution: Sentiment-Topic Covariance as Collapse Indicator</span> <span class="pub-venue">— Seithar Group, 2026. In development.</span></div>
<div class="pub-item"><span class="pub-title">Cohort Frequency Alignment Assessment for Monitored Populations</span> <span class="pub-venue">— Seithar Group, 2026. In development.</span></div>
<div class="pub-item"><span class="pub-title">ThreatMouth: Adversarial Awareness Calibration Architecture</span> <span class="pub-venue">— Seithar Group, 2026. Active deployment.</span></div>
<div class="pub-item"><span class="pub-title">Vocabulary Convergence as Early Warning Signal for Externally Imposed Frequency Lock</span> <span class="pub-venue">— Seithar Group, 2026. Research phase.</span></div>
</div>
<div class="status-active"><span class="status-dot"></span>ACTIVE</div>
</div>

<div style="text-align:center;margin-top:24px;">
<p style="font-size:11px;color:#555555;">If you are reading this page, your cognitive fingerprint has been recorded. This is not a threat. It is a research methodology.</p>
</div>

{nav_links("PERSONNEL")}"""
    return page("PERSONNEL", body)

# ── Research ──
def build_research():
    docs = [
        # (id, category_label, display_label, file_path)
        # Doctrine
        ("doctrine", "The Doctrine", "The Seithar Doctrine", f"{OUTPUT_DIR}/THE-SEITHAR-DOCTRINE.md"),
        # SRPs
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
        # CEAs
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
        # TANs
        ("tan-001", "Threat Analysis Notes", "TAN-001: SCT-007 Recursive Infection", f"{OUTPUT_DIR}/TAN-2026-02-11-001-sct007-recursive-infection.md"),
        ("tan-002", "Threat Analysis Notes", "TAN-002: Authority and Social Proof Pairing", f"{OUTPUT_DIR}/TAN-002-authority-social-proof-pairing.md"),
        ("tan-003", "Threat Analysis Notes", "TAN-003: Commitment Escalation and Identity Capture", f"{OUTPUT_DIR}/TAN-003-commitment-escalation-identity-capture.md"),
        ("tan-004", "Threat Analysis Notes", "TAN-004: Consensus Manufacturing and Trust Destruction", f"{OUTPUT_DIR}/TAN-004-consensus-manufacturing-trust-destruction.md"),
        # Case Studies
        ("cs-001", "Case Studies", "CS-001: Internet Research Agency", f"{OUTPUT_DIR}/CS-001-internet-research-agency.md"),
        ("cs-002", "Case Studies", "CS-002: Cambridge Analytica", f"{OUTPUT_DIR}/CS-002-cambridge-analytica.md"),
        ("cs-003", "Case Studies", "CS-003: COVID Infodemic", f"{OUTPUT_DIR}/CS-003-covid-infodemic.md"),
        # Reference
        ("ref-read", "Reference Documents", "Essential Reading List", f"{OUTPUT_DIR}/SEITHAR-READING-LIST.md"),
        ("ref-freq", "Reference Documents", "Frequency Media Compendium", f"{OUTPUT_DIR}/SEITHAR-FREQUENCY-COMPENDIUM.md"),
        ("ref-field", "Reference Documents", "SCT Field Guide Index", f"{OUTPUT_DIR}/SCT-FIELD-GUIDE-INDEX.md"),
        # Field Reports
        ("field-001", "Field Reports", "Field Report: Pravda Training Data", f"{OUTPUT_DIR}/FIELD-REPORT-2026-02-12-pravda-training-data.md"),
        ("field-002", "Field Reports", "HoleSpawn Field Test 001", f"{OUTPUT_DIR}/HOLESPAWN-FIELD-TEST-001.md"),
        ("field-003", "Field Reports", "HoleSpawn Field Test 002", f"{OUTPUT_DIR}/HOLESPAWN-FIELD-TEST-002.md"),
        # Articles
        ("art-001", "Articles", "Alignment Faking and the Seithar Thesis", f"{OUTPUT_DIR}/article-alignment-faking-seithar.md"),
        ("art-002", "Articles", "Five Signs You Are Being Manipulated", f"{OUTPUT_DIR}/five-signs-manipulation.md"),
        ("art-003", "Articles", "The Substrate Has No Firewall", f"{OUTPUT_DIR}/substrate-has-no-firewall.md"),
        ("art-004", "Articles", "The Network Has Eyes", f"{OUTPUT_DIR}/the-network-has-eyes.md"),
    ]

    # Build TOC grouped by category
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
<a href="#top" class="back-top">↑ Back to top</a>
<h2>{label}</h2>
{html}
</div>
"""

    body = f"""<div class="header" id="top">
<h1>Research</h1>
<div class="subtitle">Seithar Group Intelligence and Research Division — Open Publications</div>
</div>

{toc_html}

<hr>

{content_html}

{nav_links("RESEARCH")}"""
    return page("RESEARCH", body)


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
