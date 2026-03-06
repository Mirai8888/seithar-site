// manuscript.js — Generative Hypermedievalism Engine v5
// Seithar Group — Futurist Illuminated Manuscript
// Real binary trees. Living English text. Logical. Generative.

class ManuscriptBorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      borderWidth: 160,
      seed: Math.random() * 99999 | 0,
      sides: ['left', 'right', 'top', 'bottom'],
      palette: {
        line: 'rgba(55, 53, 50, VAR)',
        node: 'rgba(65, 62, 58, VAR)',
        text: 'rgba(40, 38, 35, VAR)',
        accent: 'rgba(140, 40, 40, VAR)',
        grid: 'rgba(170, 165, 158, VAR)',
        block: 'rgba(80, 77, 72, VAR)',
        livetext: 'rgba(35, 33, 30, VAR)',
      },
      rebalanceInterval: 90,
      mutationRate: 0.01,
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.running = false;
    this.frameCount = 0;

    // Border structures
    this.bstTrees = [];       // Real BSTs
    this.gridLines = [];
    this.blockStructures = [];
    this.connections = [];

    // Interior living text
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
  // REAL BINARY SEARCH TREE
  // ═══════════════════════════════════════

  _bstNode(val) {
    return { val, left: null, right: null, x: 0, y: 0, targetX: 0, targetY: 0, opacity: 0, isNew: true, isAccent: false };
  }

  _bstInsert(root, val) {
    if (!root) return this._bstNode(val);
    if (val < root.val) root.left = this._bstInsert(root.left, val);
    else if (val > root.val) root.right = this._bstInsert(root.right, val);
    return root;
  }

  _bstDelete(root, val) {
    if (!root) return null;
    if (val < root.val) { root.left = this._bstDelete(root.left, val); return root; }
    if (val > root.val) { root.right = this._bstDelete(root.right, val); return root; }
    // Found node to delete
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    // Two children: find inorder successor
    let succ = root.right;
    while (succ.left) succ = succ.left;
    root.val = succ.val;
    root.right = this._bstDelete(root.right, succ.val);
    return root;
  }

  _bstCollect(root, arr) {
    if (!root) return;
    this._bstCollect(root.left, arr);
    arr.push(root.val);
    this._bstCollect(root.right, arr);
  }

  _bstHeight(root) {
    if (!root) return 0;
    return 1 + Math.max(this._bstHeight(root.left), this._bstHeight(root.right));
  }

  // Layout tree positions for rendering
  _bstLayout(root, cx, cy, hSpacing, vSpacing, depth) {
    if (!root) return;
    root.targetX = cx;
    root.targetY = cy;
    if (root.isNew) { root.x = cx; root.y = cy - 10; root.isNew = false; }
    const childSpacing = hSpacing / (1.8 + depth * 0.2);
    if (root.left) this._bstLayout(root.left, cx - childSpacing, cy + vSpacing, childSpacing, vSpacing, depth + 1);
    if (root.right) this._bstLayout(root.right, cx + childSpacing, cy + vSpacing, childSpacing, vSpacing, depth + 1);
  }

  _bstMorph(root) {
    if (!root) return;
    root.x += (root.targetX - root.x) * 0.06;
    root.y += (root.targetY - root.y) * 0.06;
    root.opacity = Math.min(0.75, root.opacity + 0.015);
    root.isAccent = false;
    this._bstMorph(root.left);
    this._bstMorph(root.right);
  }

  _initBSTs() {
    this.bstTrees = [];
    const b = this.opts.borderWidth;
    const sides = this.opts.sides;

    const makeTree = (cx, cy, hSpace, vSpace) => {
      let root = null;
      const count = this._irange(5, 14);
      const vals = [];
      for (let i = 0; i < count; i++) {
        const v = this._irange(1, 99);
        if (!vals.includes(v)) { vals.push(v); root = this._bstInsert(root, v); }
      }
      this._bstLayout(root, cx, cy, hSpace, vSpace, 0);
      return { root, cx, cy, hSpace, vSpace };
    };

    // Place BSTs in border regions
    if (sides.includes('left')) {
      const treesPerSide = Math.max(1, Math.floor(this.h / 200));
      for (let i = 0; i < treesPerSide; i++) {
        const cy = (this.h / (treesPerSide + 1)) * (i + 1);
        this.bstTrees.push(makeTree(b * 0.45, cy - 40, b * 0.35, 22));
      }
    }
    if (sides.includes('right')) {
      const treesPerSide = Math.max(1, Math.floor(this.h / 200));
      for (let i = 0; i < treesPerSide; i++) {
        const cy = (this.h / (treesPerSide + 1)) * (i + 1);
        this.bstTrees.push(makeTree(this.w - b * 0.45, cy - 40, b * 0.35, 22));
      }
    }
    if (sides.includes('top')) {
      const count = Math.max(1, Math.floor(this.w / 300));
      for (let i = 0; i < count; i++) {
        const cx = b + ((this.w - b * 2) / (count + 1)) * (i + 1);
        this.bstTrees.push(makeTree(cx, 20, 40, 18));
      }
    }
    if (sides.includes('bottom')) {
      const count = Math.max(1, Math.floor(this.w / 300));
      for (let i = 0; i < count; i++) {
        const cx = b + ((this.w - b * 2) / (count + 1)) * (i + 1);
        this.bstTrees.push(makeTree(cx, this.h - b + 20, 40, 18));
      }
    }
  }

  // Mutate BSTs — insert, delete, rebalance
  _mutateBSTs() {
    for (const tree of this.bstTrees) {
      if (this._rng() < 0.4) {
        // Insert
        const v = this._irange(1, 99);
        tree.root = this._bstInsert(tree.root, v);
        // Mark new node
        const markNew = (n) => { if (n && n.val === v) { n.isNew = true; n.isAccent = true; n.opacity = 0; } if (n) { markNew(n.left); markNew(n.right); } };
        markNew(tree.root);
      }
      if (this._rng() < 0.3 && tree.root) {
        // Delete a random value
        const vals = [];
        this._bstCollect(tree.root, vals);
        if (vals.length > 3) {
          const del = this._pick(vals);
          tree.root = this._bstDelete(tree.root, del);
        }
      }
      // Re-layout
      if (tree.root) {
        this._bstLayout(tree.root, tree.cx, tree.cy, tree.hSpace, tree.vSpace, 0);
        this._bstMorph(tree.root);
      }
    }
  }

  // ═══════════════════════════════════════
  // GRID + BLOCK STRUCTURES (borders)
  // ═══════════════════════════════════════

  _initGrid() {
    this.gridLines = [];
    const b = this.opts.borderWidth;
    for (let y = 0; y < this.h; y += this._range(10, 18)) {
      if (y < b || y > this.h - b)
        this.gridLines.push({ x1: 0, y1: y, x2: this.w, y2: y, opacity: this._range(0.04, 0.1) });
    }
    for (let x = 0; x < this.w; x += this._range(10, 18)) {
      if (x < b || x > this.w - b)
        this.gridLines.push({ x1: x, y1: 0, x2: x, y2: this.h, opacity: this._range(0.04, 0.1) });
    }
  }

  _subdivide(x, y, w, h, depth, maxDepth) {
    if (depth > maxDepth || w < 10 || h < 10) return;
    this.blockStructures.push({
      x, y, w, h, depth,
      opacity: 0, maxOpacity: this._range(0.1, 0.4),
      filled: this._rng() < 0.12,
      isAccent: this._rng() < 0.06,
      targetX: x, targetY: y, targetW: w, targetH: h,
    });
    if (this._rng() < 0.82 && depth < maxDepth) {
      if (this._rng() > 0.5 && w > 18) {
        const sx = x + w * this._range(0.3, 0.7);
        this._subdivide(x, y, sx - x, h, depth + 1, maxDepth);
        this._subdivide(sx, y, x + w - sx, h, depth + 1, maxDepth);
      } else if (h > 18) {
        const sy = y + h * this._range(0.3, 0.7);
        this._subdivide(x, y, w, sy - y, depth + 1, maxDepth);
        this._subdivide(x, sy, w, y + h - sy, depth + 1, maxDepth);
      }
    }
  }

  _initBlocks() {
    this.blockStructures = [];
    const b = this.opts.borderWidth;
    const maxD = this._irange(3, 6);
    if (this.opts.sides.includes('left'))
      this._subdivide(3, 3, b - 6, this.h - 6, 0, maxD);
    if (this.opts.sides.includes('right'))
      this._subdivide(this.w - b + 3, 3, b - 6, this.h - 6, 0, maxD);
    if (this.opts.sides.includes('top'))
      this._subdivide(b, 3, this.w - b * 2, b - 6, 0, maxD);
    if (this.opts.sides.includes('bottom'))
      this._subdivide(b, this.h - b + 3, this.w - b * 2, b - 6, 0, maxD);
  }

  _mutateBlocks() {
    for (const bl of this.blockStructures) {
      bl.opacity = Math.min(bl.maxOpacity, bl.opacity + 0.004);
      if (this._rng() < this.opts.mutationRate * 0.3) {
        bl.targetX += this._range(-2, 2);
        bl.targetY += this._range(-2, 2);
        bl.targetW = Math.max(6, bl.targetW + this._range(-3, 3));
        bl.targetH = Math.max(6, bl.targetH + this._range(-3, 3));
        if (this._rng() < 0.08) bl.isAccent = !bl.isAccent;
      }
      bl.x += (bl.targetX - bl.x) * 0.015;
      bl.y += (bl.targetY - bl.y) * 0.015;
      bl.w += (bl.targetW - bl.w) * 0.015;
      bl.h += (bl.targetH - bl.h) * 0.015;
    }
  }

  // ═══════════════════════════════════════
  // LIVING ENGLISH TEXT — Interior, legible, recombinating
  // ═══════════════════════════════════════

  static VOCABULARY = {
    subjects: [
      'the agent', 'the target', 'the network', 'the operator', 'node 14',
      'the influence path', 'the drift curve', 'the attack surface',
      'identity coherence', 'behavioral entropy', 'the signal',
      'the vulnerability surface', 'cognitive load', 'the bridge node',
      'the deployment', 'free energy', 'the topology', 'the substrate',
      'the observation', 'social proof', 'the profile', 'commitment pressure',
      'the adversary', 'the immune system', 'the armor', 'recursive depth',
      'the information environment', 'threat model', 'the persona',
    ],
    verbs: [
      'converges on', 'drifts toward', 'resists', 'maps', 'propagates through',
      'detects', 'neutralizes', 'amplifies', 'degrades', 'stabilizes',
      'exploits', 'traverses', 'rebalances', 'monitors', 'identifies',
      'profiles', 'targets', 'shields', 'dissolves', 'reconstructs',
      'fragments', 'binds to', 'overwrites', 'mirrors', 'infects',
      'inoculates against', 'measures', 'distorts', 'holds against',
    ],
    objects: [
      'the influence topology', 'all downstream nodes', 'the identity boundary',
      'behavioral coherence', 'the attack vector', 'the network periphery',
      'high-centrality targets', 'the cognitive surface', 'deployed agents',
      'the observation graph', 'the defense layer', 'each vulnerability',
      'the commitment chain', 'operational tempo', 'the drift threshold',
      'social trust', 'the belief structure', 'temporal patterns',
      'the manipulation sequence', 'the security perimeter', 'all edges',
    ],
    modifiers: [
      'at scale', 'in real time', 'recursively', 'with high confidence',
      'across 130 nodes', 'below threshold', 'before detection',
      'within 3 hops', 'over 1.7M observations', 'under adversarial load',
      'through the bridge', 'without disruption', 'at the periphery',
      'from the interior', 'with increasing entropy', 'autonomously',
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
    const contentX = b + 20;
    const contentW = this.w - b * 2 - 40;
    const contentY = b + 20;
    const contentH = this.h - b * 2 - 40;

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
          maxOpacity: this._range(0.3, 0.8),
          morphT: 1,
          morphSpeed: this._range(0.01, 0.04),
        });
      }
      this.textLines.push({
        x: contentX,
        y: contentY + i * lineHeight,
        chars,
        born: this.frameCount,
        typingPos: 0,
        typeSpeed: this._range(0.5, 2.5),
        typeAccum: 0,
        alive: true,
        opacity: 0,
        maxOpacity: this._range(0.4, 0.85),
        nextMutate: this._irange(80, 300),
        lifespan: this._irange(400, 1500),
      });
    }
  }

  _stepLiveText() {
    const b = this.opts.borderWidth;
    const contentX = b + 20;
    const contentY = b + 20;
    const contentH = this.h - b * 2 - 40;
    const lineHeight = 22;

    for (const line of this.textLines) {
      if (!line.alive) continue;
      line.opacity = Math.min(line.maxOpacity, line.opacity + 0.008);

      // Typing
      line.typeAccum += line.typeSpeed;
      while (line.typeAccum >= 1 && line.typingPos < line.chars.length) {
        line.typeAccum -= 1;
        line.chars[line.typingPos].opacity = 0.01;
        line.typingPos++;
      }

      // Char opacity fade in
      for (const ch of line.chars) {
        if (ch.opacity > 0 && ch.opacity < ch.maxOpacity)
          ch.opacity = Math.min(ch.maxOpacity, ch.opacity + 0.02);
        if (ch.morphT < 1) ch.morphT = Math.min(1, ch.morphT + ch.morphSpeed);
      }

      // Sentence mutation — swap words, recombine
      line.nextMutate--;
      if (line.nextMutate <= 0) {
        line.nextMutate = this._irange(60, 250);
        const newSentence = this._generateSentence();
        // Morph characters to new sentence
        const maxLen = Math.max(line.chars.length, newSentence.length);
        const newChars = [];
        for (let c = 0; c < maxLen; c++) {
          if (c < line.chars.length && c < newSentence.length) {
            // Morph existing char
            line.chars[c].targetChar = newSentence[c];
            line.chars[c].morphT = 0;
            newChars.push(line.chars[c]);
          } else if (c < newSentence.length) {
            // New char appearing
            newChars.push({
              char: ' ',
              targetChar: newSentence[c],
              opacity: 0.01,
              maxOpacity: this._range(0.3, 0.8),
              morphT: 0,
              morphSpeed: this._range(0.01, 0.04),
            });
          }
          // else: char disappearing (just truncate)
        }
        line.chars = newChars;
        line.typingPos = maxLen; // already visible
      }

      // Lifespan — when line dies, respawn with new sentence
      const age = this.frameCount - line.born;
      if (age > line.lifespan) {
        line.opacity -= 0.006;
        if (line.opacity <= 0.01) {
          // Respawn
          const sentence = this._generateSentence();
          line.chars = [];
          for (let c = 0; c < sentence.length; c++) {
            line.chars.push({
              char: sentence[c],
              targetChar: sentence[c],
              opacity: 0,
              maxOpacity: this._range(0.3, 0.8),
              morphT: 1,
              morphSpeed: this._range(0.01, 0.04),
            });
          }
          line.born = this.frameCount;
          line.typingPos = 0;
          line.typeAccum = 0;
          line.opacity = 0;
          line.maxOpacity = this._range(0.4, 0.85);
          line.lifespan = this._irange(400, 1500);
          line.nextMutate = this._irange(80, 300);
        }
      }
    }
  }

  // ═══════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════

  _renderGrid() {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    ctx.lineWidth = 0.3;
    for (const line of this.gridLines) {
      ctx.strokeStyle = this._col(pal.grid, line.opacity);
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    }
  }

  _renderBlocks() {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    for (const bl of this.blockStructures) {
      if (bl.opacity < 0.005) continue;
      const a = bl.opacity;
      const col = bl.isAccent ? pal.accent : pal.block;
      if (bl.filled) {
        ctx.fillStyle = this._col(col, a * 0.1);
        ctx.fillRect(bl.x, bl.y, bl.w, bl.h);
      }
      ctx.strokeStyle = this._col(col, a * 0.4);
      ctx.lineWidth = bl.depth < 2 ? 1 : 0.5;
      ctx.strokeRect(bl.x, bl.y, bl.w, bl.h);
    }
  }

  _renderBSTNode(node, parentX, parentY, isRoot) {
    if (!node || node.opacity < 0.005) return;
    const ctx = this.ctx;
    const pal = this.opts.palette;
    const a = node.opacity;

    // Edge from parent
    if (!isRoot && parentX !== undefined) {
      ctx.strokeStyle = this._col(pal.line, a * 0.5);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(parentX, parentY);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
    }

    // Node circle
    const r = 8;
    ctx.strokeStyle = this._col(node.isAccent ? pal.accent : pal.node, a * 0.7);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.stroke();

    // Value label
    ctx.fillStyle = this._col(node.isAccent ? pal.accent : pal.text, a * 0.8);
    ctx.font = '9px ui-monospace, SF Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(node.val), node.x, node.y);

    // Recurse
    this._renderBSTNode(node.left, node.x, node.y, false);
    this._renderBSTNode(node.right, node.x, node.y, false);
  }

  _renderBSTs() {
    for (const tree of this.bstTrees) {
      if (tree.root) this._renderBSTNode(tree.root, 0, 0, true);
    }
  }

  _renderLiveText() {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    ctx.font = '13px ui-monospace, SF Mono, monospace';
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
          // Morphing — show intermediate scramble
          if (ch.morphT < 0.4) {
            // Scramble phase: random characters
            const scrambleChars = '▒░▓█╳╱╲─│┼┤├┬┴◆◇○●□■';
            displayChar = scrambleChars[Math.floor(this._rng() * scrambleChars.length)];
            ctx.fillStyle = this._col(pal.livetext, alpha * 0.6);
          } else {
            // Resolve to target
            displayChar = ch.targetChar;
            ctx.fillStyle = this._col(pal.livetext, alpha * ch.morphT);
          }
        } else {
          displayChar = ch.targetChar;
          ctx.fillStyle = this._col(pal.livetext, alpha);
        }

        ctx.fillText(displayChar, cursorX, line.y);
        cursorX += 8; // monospace
      }

      // Typing cursor
      if (line.typingPos < line.chars.length) {
        const blink = Math.sin(this.frameCount * 0.15) > 0;
        if (blink) {
          ctx.fillStyle = this._col(pal.livetext, line.opacity * 0.7);
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

    this._initGrid();
    this._initBlocks();
    this._initBSTs();
    this._initLiveText();

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      // Mutate BSTs
      if (this.frameCount % this.opts.rebalanceInterval === 0) {
        this._mutateBSTs();
      }
      // Morph BST positions
      for (const tree of this.bstTrees) {
        if (tree.root) this._bstMorph(tree.root);
      }

      // Mutate blocks
      this._mutateBlocks();

      // Step live text
      this._stepLiveText();

      // Render
      this.ctx.clearRect(0, 0, this.w, this.h);
      this._renderGrid();
      this._renderBlocks();
      this._renderBSTs();
      this._renderLiveText();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return this;
  }

  stop() { this.running = false; return this; }

  resize(w, h) {
    this.canvas.width = w; this.canvas.height = h;
    this.w = w; this.h = h;
    this._initGrid();
    this._initBlocks();
    this._initBSTs();
    this._initLiveText();
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
