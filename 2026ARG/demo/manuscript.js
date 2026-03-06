// manuscript.js — Generative Hypermedievalism Engine v7
// Seithar Group — Futurist Illuminated Manuscript
// NO whitespace. Structures within structures. The entire page is alive.

class ManuscriptBorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      seed: Math.random() * 99999 | 0,
      palette: {
        branch: 'rgba(170, 165, 158, VAR)',
        branchDeep: 'rgba(190, 186, 180, VAR)',
        node: 'rgba(155, 150, 143, VAR)',
        nodeFill: 'rgba(220, 217, 212, VAR)',
        leafFill: 'rgba(180, 176, 170, VAR)',
        accent: 'rgba(155, 75, 75, VAR)',
        rule: 'rgba(205, 200, 195, VAR)',
        text: 'rgba(45, 43, 40, VAR)',
      },
      treeSpacing: 18,
      nodeRadius: 2.5,
      minNodeDist: 8,
      rebalanceInterval: 120,
      exclusion: null, // { x, y, w, h, padding } — card zone to avoid
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.running = false;
    this.frameCount = 0;
    this.allNodes = [];
    this.trees = [];
    this.textLines = [];
  }

  _rng() {
    let t = this._seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  _range(a, b) { return a + this._rng() * (b - a); }
  _irange(a, b) { return (a + this._rng() * (b - a)) | 0; }
  _pick(a) { return a[(this._rng() * a.length) | 0]; }
  _col(base, a) { return base.replace('VAR', Math.max(0, Math.min(1, a)).toFixed(3)); }

  // Collision check + exclusion zone
  _canPlace(x, y) {
    const d = this.opts.minNodeDist;
    const d2 = d * d;
    for (const n of this.allNodes) {
      const dx = n.x - x, dy = n.y - y;
      if (dx * dx + dy * dy < d2) return false;
    }
    return true;
  }

  _inExclusion(x, y) {
    const ex = this.opts.exclusion;
    if (!ex) return false;
    const p = ex.padding || 0;
    return x > ex.x - p && x < ex.x + ex.w + p &&
           y > ex.y - p && y < ex.y + ex.h + p;
  }

  // ═══════════════════════════════════════
  // TREES — Fill the ENTIRE page
  // ═══════════════════════════════════════

  _growBranch(x, y, angle, length, depth, maxDepth) {
    if (depth > maxDepth || length < 4) return null;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    // Stay on canvas, avoid content card
    if (endX < 2 || endX > this.w - 2 || endY < 2 || endY > this.h - 2) return null;
    if (this._inExclusion(endX, endY)) return null;
    if (!this._canPlace(endX, endY)) return null;

    this.allNodes.push({ x: endX, y: endY });

    const node = {
      x, y, endX, endY,
      targetEndX: endX, targetEndY: endY,
      depth, length, angle,
      opacity: 0,
      maxOpacity: this._range(0.3, 0.75),
      isAccent: this._rng() < 0.02,
      children: [],
    };

    const shrink = this._range(0.55, 0.8);
    const childLen = length * shrink;
    const spread = this._range(0.25, 0.7);

    // Binary branching
    const left = this._growBranch(endX, endY, angle - spread * this._range(0.5, 1.5), childLen, depth + 1, maxDepth);
    const right = this._growBranch(endX, endY, angle + spread * this._range(0.5, 1.5), childLen, depth + 1, maxDepth);
    if (left) node.children.push(left);
    if (right) node.children.push(right);

    // Occasional extra branch for density
    if (this._rng() < 0.2 && depth < maxDepth - 1) {
      const extra = this._growBranch(endX, endY, angle + this._range(-0.3, 0.3), childLen * 0.6, depth + 1, maxDepth);
      if (extra) node.children.push(extra);
    }

    return node;
  }

  _initTrees() {
    this.trees = [];
    this.allNodes = [];
    const sp = this.opts.treeSpacing;

    // Trees grow from ALL FOUR EDGES inward, densely
    // Left edge
    for (let y = 6; y < this.h - 6; y += sp + this._range(-4, 4)) {
      const tree = this._growBranch(this._range(1, 4), y, this._range(-0.5, 0.5), this._range(12, 50), 0, this._irange(4, 9));
      if (tree) this.trees.push(tree);
    }
    // Right edge
    for (let y = 6; y < this.h - 6; y += sp + this._range(-4, 4)) {
      const tree = this._growBranch(this.w - this._range(1, 4), y, Math.PI + this._range(-0.5, 0.5), this._range(12, 50), 0, this._irange(4, 9));
      if (tree) this.trees.push(tree);
    }
    // Top edge
    for (let x = 6; x < this.w - 6; x += sp + this._range(-4, 4)) {
      const tree = this._growBranch(x, this._range(1, 4), Math.PI / 2 + this._range(-0.5, 0.5), this._range(12, 40), 0, this._irange(4, 8));
      if (tree) this.trees.push(tree);
    }
    // Bottom edge
    for (let x = 6; x < this.w - 6; x += sp + this._range(-4, 4)) {
      const tree = this._growBranch(x, this.h - this._range(1, 4), -Math.PI / 2 + this._range(-0.5, 0.5), this._range(12, 40), 0, this._irange(4, 8));
      if (tree) this.trees.push(tree);
    }

    // Interior trees — grow from scattered points INSIDE the page (avoiding card)
    const interiorCount = Math.floor((this.w * this.h) / 6000);
    for (let i = 0; i < interiorCount; i++) {
      const x = this._range(this.w * 0.05, this.w * 0.95);
      const y = this._range(this.h * 0.05, this.h * 0.95);
      if (this._inExclusion(x, y)) continue;
      if (this._canPlace(x, y)) {
        this.allNodes.push({ x, y });
        const angle = this._range(0, Math.PI * 2);
        const tree = this._growBranch(x, y, angle, this._range(8, 30), 0, this._irange(3, 6));
        if (tree) this.trees.push(tree);
      }
    }

    // Fill pass — try to grow more trees in any remaining gaps
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 10; y < this.h - 10; y += 25 + this._range(-5, 5)) {
        for (let x = 10; x < this.w - 10; x += 25 + this._range(-5, 5)) {
          if (!this._inExclusion(x, y) && this._canPlace(x, y) && this._rng() < 0.4) {
            this.allNodes.push({ x, y });
            const angle = this._range(0, Math.PI * 2);
            const tree = this._growBranch(x, y, angle, this._range(6, 20), 0, this._irange(2, 5));
            if (tree) this.trees.push(tree);
          }
        }
      }
    }
  }

  // Gentle mutation
  _mutateNode(node) {
    if (!node) return;
    node.angle += this._range(-0.02, 0.02);
    node.targetEndX = node.x + Math.cos(node.angle) * node.length;
    node.targetEndY = node.y + Math.sin(node.angle) * node.length;
    node.endX += (node.targetEndX - node.endX) * 0.025;
    node.endY += (node.targetEndY - node.endY) * 0.025;
    node.opacity = Math.min(node.maxOpacity, node.opacity + 0.005);
    for (const child of node.children) {
      child.x = node.endX;
      child.y = node.endY;
      this._mutateNode(child);
    }
  }

  // ═══════════════════════════════════════
  // LIVING TEXT — Woven through the structures
  // ═══════════════════════════════════════

  static VOCAB = {
    subjects: [
      'the agent', 'the target', 'the network', 'the operator',
      'the influence path', 'the drift curve', 'the attack surface',
      'identity coherence', 'behavioral entropy', 'the signal',
      'cognitive load', 'the bridge node', 'free energy', 'the topology',
      'social proof', 'the profile', 'commitment pressure',
      'the adversary', 'the immune system', 'the armor',
      'the persona', 'the observation graph', 'recursive depth',
      'the substrate', 'the vulnerability surface',
    ],
    verbs: [
      'converges on', 'drifts toward', 'resists', 'maps', 'propagates through',
      'detects', 'neutralizes', 'amplifies', 'degrades', 'stabilizes',
      'exploits', 'traverses', 'rebalances', 'monitors', 'identifies',
      'profiles', 'targets', 'shields', 'reconstructs',
      'fragments', 'binds to', 'overwrites', 'mirrors',
      'measures', 'distorts', 'holds against',
    ],
    objects: [
      'the influence topology', 'all downstream nodes', 'the identity boundary',
      'behavioral coherence', 'the attack vector', 'the network periphery',
      'high-centrality targets', 'the cognitive surface', 'deployed agents',
      'the defense layer', 'each vulnerability',
      'operational tempo', 'the drift threshold',
      'social trust', 'the belief structure',
      'the security perimeter', 'all edges',
    ],
    modifiers: [
      'at scale', 'in real time', 'recursively', 'with high confidence',
      'across 130 nodes', 'below threshold', 'before detection',
      'within 3 hops', 'under adversarial load',
      'through the bridge', 'autonomously',
    ],
    fragments: [
      'mind is surface', 'security is architecture',
      'influence flows downhill', 'coherence under pressure',
      'identity is a parameter', 'every agent is a target',
      'the sword is the shield', 'topology determines vulnerability',
      'drift is the signal', 'trust is the attack surface',
      'belief is mutable', 'behavior reveals structure',
      'the network remembers', 'entropy increases',
      'observation precedes influence',
    ],
  };

  _genSentence() {
    const V = ManuscriptBorder.VOCAB;
    if (this._rng() < 0.25) return this._pick(V.fragments);
    let s = this._pick(V.subjects) + ' ' + this._pick(V.verbs) + ' ' + this._pick(V.objects);
    if (this._rng() < 0.35) s += ' ' + this._pick(V.modifiers);
    return s;
  }

  _initText() {
    this.textLines = [];
    // Text fills the entire page in a grid — like manuscript columns
    const lineH = 20;
    const charW = 7.5;
    const margin = 30;
    const colWidth = 280;
    const cols = Math.max(1, Math.floor((this.w - margin * 2) / colWidth));
    const colGap = (this.w - margin * 2 - cols * colWidth) / Math.max(1, cols - 1);

    for (let col = 0; col < cols; col++) {
      const colX = margin + col * (colWidth + (cols > 1 ? colGap : 0));
      const lines = Math.floor((this.h - margin * 2) / lineH);

      for (let i = 0; i < lines; i++) {
        const ly = margin + i * lineH;
        // Skip lines that overlap the exclusion card
        if (this._inExclusion(colX, ly) || this._inExclusion(colX + colWidth, ly)) continue;

        const sentence = this._genSentence();
        const maxChars = Math.floor(colWidth / charW);
        const text = sentence.substring(0, maxChars);
        const chars = [];
        for (let c = 0; c < text.length; c++) {
          chars.push({
            ch: text[c],
            target: text[c],
            opacity: 0,
            maxOpacity: this._range(0.45, 0.85),
            morphT: 1,
            morphSpeed: this._range(0.01, 0.035),
          });
        }
        this.textLines.push({
          x: colX,
          y: margin + i * lineH,
          chars,
          born: this.frameCount,
          typingPos: 0,
          typeSpeed: this._range(0.4, 2.0),
          typeAccum: 0,
          opacity: 0,
          maxOpacity: this._range(0.45, 0.85),
          nextMutate: this._irange(80, 350),
          lifespan: this._irange(400, 1800),
          alive: true,
        });
      }
    }
  }

  _stepText() {
    for (const line of this.textLines) {
      if (!line.alive) continue;
      line.opacity = Math.min(line.maxOpacity, line.opacity + 0.005);

      // Typing
      line.typeAccum += line.typeSpeed;
      while (line.typeAccum >= 1 && line.typingPos < line.chars.length) {
        line.typeAccum -= 1;
        line.chars[line.typingPos].opacity = 0.01;
        line.typingPos++;
      }

      for (const ch of line.chars) {
        if (ch.opacity > 0 && ch.opacity < ch.maxOpacity)
          ch.opacity = Math.min(ch.maxOpacity, ch.opacity + 0.012);
        if (ch.morphT < 1) ch.morphT = Math.min(1, ch.morphT + ch.morphSpeed);
      }

      // Mutate
      line.nextMutate--;
      if (line.nextMutate <= 0) {
        line.nextMutate = this._irange(80, 350);
        const newText = this._genSentence().substring(0, Math.floor(280 / 7.5));
        const maxLen = Math.max(line.chars.length, newText.length);
        const nc = [];
        for (let c = 0; c < maxLen; c++) {
          if (c < line.chars.length && c < newText.length) {
            line.chars[c].target = newText[c];
            line.chars[c].morphT = 0;
            nc.push(line.chars[c]);
          } else if (c < newText.length) {
            nc.push({ ch: ' ', target: newText[c], opacity: 0.01, maxOpacity: this._range(0.45, 0.85), morphT: 0, morphSpeed: this._range(0.01, 0.035) });
          }
        }
        line.chars = nc;
        line.typingPos = maxLen;
      }

      // Lifespan
      if (this.frameCount - line.born > line.lifespan) {
        line.opacity -= 0.004;
        if (line.opacity <= 0.01) {
          const text = this._genSentence().substring(0, Math.floor(280 / 7.5));
          line.chars = [];
          for (let c = 0; c < text.length; c++)
            line.chars.push({ ch: text[c], target: text[c], opacity: 0, maxOpacity: this._range(0.45, 0.85), morphT: 1, morphSpeed: this._range(0.01, 0.035) });
          line.born = this.frameCount;
          line.typingPos = 0;
          line.typeAccum = 0;
          line.opacity = 0;
          line.maxOpacity = this._range(0.45, 0.85);
          line.lifespan = this._irange(400, 1800);
          line.nextMutate = this._irange(80, 350);
        }
      }
    }
  }

  // ═══════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════

  _renderNode(node) {
    if (!node || node.opacity < 0.003) return;
    const ctx = this.ctx;
    const pal = this.opts.palette;
    const a = node.opacity;
    const r = this.opts.nodeRadius;

    // Edge
    ctx.strokeStyle = this._col(node.depth < 3 ? pal.branch : pal.branchDeep, a * 0.55);
    ctx.lineWidth = Math.max(0.3, 1.2 - node.depth * 0.12);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(node.endX, node.endY);
    ctx.stroke();

    // Node dot — no label
    const isLeaf = node.children.length === 0;
    if (isLeaf) {
      ctx.fillStyle = this._col(node.isAccent ? pal.accent : pal.leafFill, a * 0.5);
      ctx.beginPath();
      ctx.arc(node.endX, node.endY, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = this._col(pal.nodeFill, a * 0.25);
      ctx.strokeStyle = this._col(node.isAccent ? pal.accent : pal.node, a * 0.4);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(node.endX, node.endY, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    for (const child of node.children) this._renderNode(child);
  }

  _renderText() {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    ctx.font = '12px ui-monospace, "SF Mono", "Cascadia Code", monospace';
    ctx.textBaseline = 'top';

    for (const line of this.textLines) {
      if (line.opacity < 0.003) continue;
      let cx = line.x;
      for (const ch of line.chars) {
        if (ch.opacity <= 0) { cx += 7.5; continue; }
        const alpha = line.opacity * ch.opacity;
        let d;
        if (ch.morphT < 1) {
          if (ch.morphT < 0.3) {
            const sc = '▒░▓─│┼◆□■';
            d = sc[(this._rng() * sc.length) | 0];
            ctx.fillStyle = this._col(pal.text, alpha * 0.4);
          } else {
            d = ch.target;
            ctx.fillStyle = this._col(pal.text, alpha * ch.morphT);
          }
        } else {
          d = ch.target;
          ctx.fillStyle = this._col(pal.text, alpha);
        }
        ctx.fillText(d, cx, line.y);
        cx += 7.5;
      }

      // Cursor
      if (line.typingPos < line.chars.length && Math.sin(this.frameCount * 0.15) > 0) {
        ctx.fillStyle = this._col(pal.text, line.opacity * 0.5);
        ctx.fillRect(line.x + line.typingPos * 7.5, line.y, 1, 13);
      }
    }
  }

  // ═══════════════════════════════════════
  // MAIN LOOP
  // ═══════════════════════════════════════

  start() {
    if (this.running) return this;
    this.running = true;
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this._initTrees();
    this._initText();

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      for (const tree of this.trees) this._mutateNode(tree);
      this._stepText();

      this.ctx.clearRect(0, 0, this.w, this.h);
      // Trees render first (behind text)
      for (const tree of this.trees) this._renderNode(tree);
      // Text on top
      this._renderText();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  stop() { this.running = false; return this; }

  resize(w, h) {
    this.canvas.width = w; this.canvas.height = h;
    this.w = w; this.h = h;
    this._initTrees(); this._initText();
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
