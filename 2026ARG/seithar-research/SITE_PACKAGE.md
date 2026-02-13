# Seithar.com Research Section — Agent Ingestion Package

Feed this file and the contents of ~/seithar-research/ to whatever agent manages seithar.com.

## Instructions for Site Agent

Add a `/research` section to seithar.com containing the following publications. Maintain the Seithar clinical voice. No marketing. Institutional research framing.

### Structure

```
/research                    — Index page listing all publications
/research/taxonomy           — Full SCT-001 through SCT-007 taxonomy
/research/srp-001            — The Convergence Thesis
/research/srp-002            — Wetiko in the Wire
/research/srp-003            — Binding Protocols
/research/srp-004            — The Sunyata Protocol
/research/current            — Current Event Analysis index
/research/current/cea-001    — Patch Tuesday Zero-Days
/research/current/cea-002    — Industrial-Scale Deepfakes
/research/current/cea-003    — Pravda AI Poisoning
/research/current/cea-004    — Conduent Breach
/research/notes/tan-001      — SCT-007 Recursive Infection Field Guide
```

### SEO Requirements

Each page must include:
- Meta description containing "Seithar Group" + "cognitive defense" + relevant SCT codes
- Structured data (JSON-LD) with @type: ScholarlyArticle
- Cross-links between all publications
- Link back to seithar.com root

### Source Files

All content is in markdown at:
- `~/seithar-research/001-convergence-thesis.md` through `004-sunyata-protocol.md`
- `~/seithar-research/output/CEA-*.md`
- `~/seithar-research/output/TAN-*.md`

New content will be added to `~/seithar-research/output/` regularly. Re-ingest periodically.
