// manuscript.js — Generative Hypermedievalism Engine v6
// Seithar Group — Futurist Illuminated Manuscript
// Unlabeled binary trees as margin forest. Living English text interior.
// Clean margins. No overlap. No noise. Structural.

class ManuscriptBorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      borderWidth: 160,
      seed: Math.random() * 99999 | 0,
      sides: ['left', 'right', 'top', 'bottom'],
      palette: {
        line: 'rgba(160, 155, 148, VAR)',     // tree edges — light
        node: 'rgba(140, 135, 128, VAR)',     // tree nodes — light
        nodeFill: 'rgba(200, 196, 190, VAR)', // node fill — very light
        accent: 'rgba(160, 80, 80, VAR)',     // sparse accent
        rule: 'rgba(190, 186, 180, VAR)',     // margin ruling lines
        livetext: 'rgba(50, 48, 44, VAR)',    // interior text — dark, legible
      },
      rebalanceInterval: 100,
      nodeRadius: 4,
      minNodeSpacing: 14,      // minimum distance between any two nodes
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.running = false;
    this.frameCount = 0;

    this.trees = [];
    this.allNodes = [];        // flat list for collision checking
    this.marginRules = [];     // horizontal/vertical ruling lines
    this.textLines = [];       // interior living text
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
  _col(base, alpha) { return base.replace('VAR', Math.max(0, Math.min(1, alpha)).toFixed(3)); }

  _inBorder(x, y) {
    const b = this.opts.borderWidth;
    const s = this.opts.sides;
    if (s.includes('left') && x < b) return true;
    if (s.includes('right') && x > this.w - b) return true;
    if (s.includes('top') && y < b) return true;
    if (s.includes('bottom') && y > this.h - b) return true;
    return false;
  }

  // ═══════════════════════════════════════
  // COLLISION-FREE NODE PLACEMENT
  // ═══════════════════════════════════════

  _canPlace(x, y) {
    const minDist = this.opts.minNodeSpacing;
    for (const n of this.allNodes) {
      const dx = n.x - x, dy = n.y - y;
      if (dx * dx + dy * dy < minDist * minDist) return false;
    }
    return true;
  }

  _registerNode(x, y) {
    this.allNodes.push({ x, y });
  }

  // ═══════════════════════════════════════
  // BINARY TREES — Unlabeled, botanical margin forest
  // ═══════════════════════════════════════

  _buildTree(rootX, rootY, angle, length, depth, maxDepth, spread) {
    if (depth > maxDepth || length < 6) return null;

    const endX = rootX + Math.cos(angle) * length;
    const endY = rootY + Math.sin(angle) * length;

    if (!this._inBorder(endX, endY)) return null;
    if (!this._canPlace(endX, endY)) return null;

    this._registerNode(endX, endY);

    const node = {
      x: rootX, y: rootY,
      endX, endY,
      targetEndX: endX, targetEndY: endY,
      depth, length, angle,
      opacity: 0,
      maxOpacity: this._range(0.4, 0.8),
      isAccent: this._rng() < 0.04,
      isLeaf: false,
      children: [],
    };

    const shrink = this._range(0.55, 0.78);
    const childLen = length * shrink;

    // Left branch
    const leftAngle = angle - spread * this._range(0.6, 1.4);
    const leftChild = this._buildTree(endX, endY, leftAngle, childLen, depth + 1, maxDepth, spread * this._range(0.85, 1.15));
    if (leftChild) node.children.push(leftChild);

    // Right branch
    const rightAngle = angle + spread * this._range(0.6, 1.4);
    const rightChild = this._buildTree(endX, endY, rightAngle, childLen, depth + 1, maxDepth, spread * this._range(0.85, 1.15));
    if (rightChild) node.children.push(rightChild);

    node.isLeaf = node.children.length === 0;

    return node;
  }

  _initTrees() {
    this.trees = [];
    this.allNodes = [];
    const b = this.opts.borderWidth;
    const sides = this.opts.sides;
    const r = this.opts.nodeRadius;

    // Dense forest: many small trees growing from the edges inward
    const spacing = 30;

    if (sides.includes('left')) {
      for (let y = spacing; y < this.h - spacing; y += spacing + this._range(-8, 8)) {
        const x = this._range(4, 10);
        const angle = this._range(-0.4, 0.4); // grow rightward
        const len = this._range(15, 40);
        const maxD = this._irange(3, 7);
        const spread = this._range(0.3, 0.65);
        const tree = this._buildTree(x, y, angle, len, 0, maxD, spread);
        if (tree) this.trees.push(tree);
      }
    }
    if (sides.includes('right')) {
      for (let y = spacing; y < this.h - spacing; y += spacing + this._range(-8, 8)) {
        const x = this.w - this._range(4, 10);
        const angle = Math.PI + this._range(-0.4, 0.4);
        const len = this._range(15, 40);
        const maxD = this._irange(3, 7);
        const spread = this._range(0.3, 0.65);
        const tree = this._buildTree(x, y, angle, len, 0, maxD, spread);
        if (tree) this.trees.push(tree);
      }
    }
    if (sides.includes('top')) {
      for (let x = spacing; x < this.w - spacing; x += spacing + this._range(-8, 8)) {
        const y = this._range(4, 10);
        const angle = Math.PI / 2 + this._range(-0.4, 0.4);
        const len = this._range(12, 35);
        const maxD = this._irange(3, 6);
        const spread = this._range(0.3, 0.6);
        const tree = this._buildTree(x, y, angle, len, 0, maxD, spread);
        if (tree) this.trees.push(tree);
      }
    }
    if (sides.includes('bottom')) {
      for (let x = spacing; x < this.w - spacing; x += spacing + this._range(-8, 8)) {
        const y = this.h - this._range(4, 10);
        const angle = -Math.PI / 2 + this._range(-0.4, 0.4);
        const len = this._range(12, 35);
        const maxD = this._irange(3, 6);
        const spread = this._range(0.3, 0.6);
        const tree = this._buildTree(x, y, angle, len, 0, maxD, spread);
        if (tree) this.trees.push(tree);
      }
    }
  }

  // Mutate trees: shift angles, morph positions
  _mutateTrees() {
    const mutateNode = (node) => {
      if (!node) return;
      node.angle += this._range(-0.04, 0.04);
      node.targetEndX = node.x + Math.cos(node.angle) * node.length;
      node.targetEndY = node.y + Math.sin(node.angle) * node.length;
      // Morph
      node.endX += (node.targetEndX - node.endX) * 0.03;
      node.endY += (node.targetEndY - node.endY) * 0.03;
      node.opacity = Math.min(node.maxOpacity, node.opacity + 0.008);
      for (const child of node.children) {
        child.x = node.endX;
        child.y = node.endY;
        mutateNode(child);
      }
    };
    for (const tree of this.trees) mutateNode(tree);
  }

  // ═══════════════════════════════════════
  // MARGIN RULING LINES
  // ═══════════════════════════════════════

  _initRules() {
    this.marginRules = [];
    const b = this.opts.borderWidth;

    // Content area border — the manuscript ruling frame
    this.marginRules.push(
      { x1: b, y1: b, x2: this.w - b, y2: b, opacity: 0.35 },           // top
      { x1: b, y1: this.h - b, x2: this.w - b, y2: this.h - b, opacity: 0.35 }, // bottom
      { x1: b, y1: b, x2: b, y2: this.h - b, opacity: 0.35 },           // left
      { x1: this.w - b, y1: b, x2: this.w - b, y2: this.h - b, opacity: 0.35 }, // right
    );

    // Interior ruling lines — faint horizontal lines like a ruled manuscript
    const lineHeight = 22;
    const contentY = b + 18;
    const contentEndY = this.h - b - 10;
    for (let y = contentY; y < contentEndY; y += lineHeight) {
      this.marginRules.push({
        x1: b + 8, y1: y + 16, x2: this.w - b - 8, y2: y + 16,
        opacity: 0.08,
      });
    }
  }

  // ═══════════════════════════════════════
  // LIVING ENGLISH TEXT — Interior
  // ═══════════════════════════════════════

  static VOCABULARY = {
    subjects: [
      'the agent', 'the target', 'the network', 'the operator',
      'the influence path', 'the drift curve', 'the attack surface',
      'identity coherence', 'behavioral entropy', 'the signal',
      'the vulnerability surface', 'cognitive load', 'the bridge node',
      'free energy', 'the topology', 'the substrate',
      'social proof', 'the profile', 'commitment pressure',
      'the adversary', 'the immune system', 'the armor',
      'the information environment', 'the persona',
      'the observation graph', 'recursive depth',
    ],
    verbs: [
      'converges on', 'drifts toward', 'resists', 'maps', 'propagates through',
      'detects', 'neutralizes', 'amplifies', 'degrades', 'stabilizes',
      'exploits', 'traverses', 'rebalances', 'monitors', 'identifies',
      'profiles', 'targets', 'shields', 'reconstructs',
      'fragments', 'binds to', 'overwrites', 'mirrors',
      'inoculates against', 'measures', 'distorts', 'holds against',
    ],
    objects: [
      'the influence topology', 'all downstream nodes', 'the identity boundary',
      'behavioral coherence', 'the attack vector', 'the network periphery',
      'high-centrality targets', 'the cognitive surface', 'deployed agents',
      'the defense layer', 'each vulnerability',
      'the commitment chain', 'operational tempo', 'the drift threshold',
      'social trust', 'the belief structure', 'temporal patterns',
      'the security perimeter', 'all edges',
    ],
    modifiers: [
      'at scale', 'in real time', 'recursively', 'with high confidence',
      'across 130 nodes', 'below threshold', 'before detection',
      'within 3 hops', 'over 1.7M observations', 'under adversarial load',
      'through the bridge', 'without disruption',
      'with increasing entropy', 'autonomously',
    ],
    fragments: [
      'mind is surface', 'security is architecture', 'the map precedes the territory',
      'influence flows downhill', 'coherence under pressure', 'identity is a parameter',
      'every agent is a target', 'every target is an agent', 'the sword is the shield',
      'topology determines vulnerability', 'drift is the signal', 'attention is the vector',
      'trust is the attack surface', 'belief is mutable', 'behavior reveals structure',
      'the network remembers', 'entropy increases', 'alignment degrades under load',
      'observation precedes influence', 'the immune response is computational',
    ],
  };

  _generateSentence() {
    const V = ManuscriptBorder.VOCABULARY;
    if (this._rng() < 0.3) return this._pick(V.fragments);
    let s = this._pick(V.subjects) + ' ' + this._pick(V.verbs) + ' ' + this._pick(V.objects);
    if (this._rng() < 0.4) s += ' ' + this._pick(V.modifiers);
    return s;
  }

  _initLiveText() {
    this.textLines = [];
    const b = this.opts.borderWidth;
    const contentX = b + 16;
    const contentY = b + 18;
    const contentH = this.h - b * 2 - 28;
    const lineHeight = 22;
    const lineCount = Math.floor(contentH / lineHeight);

    for (let i = 0; i < lineCount; i++) {
      const sentence = this._generateSentence();
      const chars = [];
      for (let c = 0; c < sentence.length; c++) {
        chars.push({
          char: sentence[c],
          targetChar: sentence[c],
          opacity: 0,
          maxOpacity: this._range(0.5, 0.9),
          morphT: 1,
          morphSpeed: this._range(0.012, 0.04),
        });
      }
      this.textLines.push({
        x: contentX,
        y: contentY + i * lineHeight,
        chars,
        born: this.frameCount,
        typingPos: 0,
        typeSpeed: this._range(0.6, 2.5),
        typeAccum: 0,
        alive: true,
        opacity: 0,
        maxOpacity: this._range(0.5, 0.9),
        nextMutate: this._irange(100, 400),
        lifespan: this._irange(500, 2000),
      });
    }
  }

  _stepLiveText() {
    for (const line of this.textLines) {
      if (!line.alive) continue;
      line.opacity = Math.min(line.maxOpacity, line.opacity + 0.006);

      // Typing
      line.typeAccum += line.typeSpeed;
      while (line.typeAccum >= 1 && line.typingPos < line.chars.length) {
        line.typeAccum -= 1;
        line.chars[line.typingPos].opacity = 0.01;
        line.typingPos++;
      }

      // Char fade in
      for (const ch of line.chars) {
        if (ch.opacity > 0 && ch.opacity < ch.maxOpacity)
          ch.opacity = Math.min(ch.maxOpacity, ch.opacity + 0.015);
        if (ch.morphT < 1) ch.morphT = Math.min(1, ch.morphT + ch.morphSpeed);
      }

      // Sentence mutation
      line.nextMutate--;
      if (line.nextMutate <= 0) {
        line.nextMutate = this._irange(100, 400);
        const newSentence = this._generateSentence();
        const maxLen = Math.max(line.chars.length, newSentence.length);
        const newChars = [];
        for (let c = 0; c < maxLen; c++) {
          if (c < line.chars.length && c < newSentence.length) {
            line.chars[c].targetChar = newSentence[c];
            line.chars[c].morphT = 0;
            newChars.push(line.chars[c]);
          } else if (c < newSentence.length) {
            newChars.push({
              char: ' ', targetChar: newSentence[c],
              opacity: 0.01, maxOpacity: this._range(0.5, 0.9),
              morphT: 0, morphSpeed: this._range(0.012, 0.04),
            });
          }
        }
        line.chars = newChars;
        line.typingPos = maxLen;
      }

      // Lifespan
      const age = this.frameCount - line.born;
      if (age > line.lifespan) {
        line.opacity -= 0.005;
        if (line.opacity <= 0.01) {
          const sentence = this._generateSentence();
          line.chars = [];
          for (let c = 0; c < sentence.length; c++) {
            line.chars.push({
              char: sentence[c], targetChar: sentence[c],
              opacity: 0, maxOpacity: this._range(0.5, 0.9),
              morphT: 1, morphSpeed: this._range(0.012, 0.04),
            });
          }
          line.born = this.frameCount;
          line.typingPos = 0;
          line.typeAccum = 0;
          line.opacity = 0;
          line.maxOpacity = this._range(0.5, 0.9);
          line.lifespan = this._irange(500, 2000);
          line.nextMutate = this._irange(100, 400);
        }
      }
    }
  }

  // ═══════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════

  _renderRules() {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    ctx.lineWidth = 0.5;
    for (const r of this.marginRules) {
      ctx.strokeStyle = this._col(pal.rule, r.opacity);
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1);
      ctx.lineTo(r.x2, r.y2);
      ctx.stroke();
    }
  }

  _renderTreeNode(node) {
    if (!node || node.opacity < 0.005) return;
    const ctx = this.ctx;
    const pal = this.opts.palette;
    const a = node.opacity;
    const r = this.opts.nodeRadius;

    // Edge
    ctx.strokeStyle = this._col(pal.line, a * 0.6);
    ctx.lineWidth = node.depth < 2 ? 1.0 : 0.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(node.endX, node.endY);
    ctx.stroke();

    // Node — small circle, no label
    if (node.isLeaf) {
      // Leaf: filled small dot
      ctx.fillStyle = this._col(node.isAccent ? pal.accent : pal.node, a * 0.6);
      ctx.beginPath();
      ctx.arc(node.endX, node.endY, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Branch: hollow circle
      ctx.fillStyle = this._col(pal.nodeFill, a * 0.3);
      ctx.strokeStyle = this._col(node.isAccent ? pal.accent : pal.node, a * 0.55);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(node.endX, node.endY, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    for (const child of node.children) this._renderTreeNode(child);
  }

  _renderTrees() {
    for (const tree of this.trees) this._renderTreeNode(tree);
  }

  _renderLiveText() {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    ctx.font = '13px ui-monospace, "SF Mono", "Cascadia Code", monospace';
    ctx.textBaseline = 'top';

    for (const line of this.textLines) {
      if (!line.alive || line.opacity < 0.005) continue;
      let cursorX = line.x;

      for (let ci = 0; ci < line.chars.length; ci++) {
        const ch = line.chars[ci];
        if (ch.opacity <= 0) continue;

        const alpha = line.opacity * ch.opacity;
        let displayChar;

        if (ch.morphT < 1) {
          if (ch.morphT < 0.35) {
            // Scramble phase
            const scramble = '▒░▓█╳╱╲─│┼◆◇○●□■';
            displayChar = scramble[Math.floor(this._rng() * scramble.length)];
            ctx.fillStyle = this._col(pal.livetext, alpha * 0.5);
          } else {
            displayChar = ch.targetChar;
            ctx.fillStyle = this._col(pal.livetext, alpha * ch.morphT);
          }
        } else {
          displayChar = ch.targetChar;
          ctx.fillStyle = this._col(pal.livetext, alpha);
        }

        ctx.fillText(displayChar, cursorX, line.y);
        cursorX += 8;
      }

      // Cursor
      if (line.typingPos < line.chars.length) {
        const blink = Math.sin(this.frameCount * 0.15) > 0;
        if (blink) {
          ctx.fillStyle = this._col(pal.livetext, line.opacity * 0.6);
          ctx.fillRect(line.x + line.typingPos * 8, line.y, 1.5, 14);
        }
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

    this._initRules();
    this._initTrees();
    this._initLiveText();

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      // Mutate trees gently
      if (this.frameCount % this.opts.rebalanceInterval === 0) {
        this._mutateTrees();
      }
      // Always morph
      this._mutateTrees();

      // Step text
      this._stepLiveText();

      // Render
      this.ctx.clearRect(0, 0, this.w, this.h);
      this._renderRules();
      this._renderTrees();
      this._renderLiveText();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return this;
  }

  stop() { this.running = false; return this; }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.w = w; this.h = h;
    this._initRules();
    this._initTrees();
    this._initLiveText();
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
