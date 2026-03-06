// manuscript.js — Generative Hypermedievalism Engine v8
// Seithar Group — Algorithmic Forest. Monochrome. Dense. Diverse.
// Trees only — no text in the generative field. Text lives on the content card.

class ManuscriptBorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      seed: Math.random() * 99999 | 0,
      palette: {
        branch: 'rgba(50, 50, 50, VAR)',
        branchLight: 'rgba(90, 90, 90, VAR)',
        node: 'rgba(40, 40, 40, VAR)',
        nodeFill: 'rgba(120, 120, 120, VAR)',
        leafFill: 'rgba(60, 60, 60, VAR)',
        accent: 'rgba(140, 50, 50, VAR)',
      },
      treeSpacing: 8,
      nodeRadius: 1.6,
      minNodeDist: 4,
      rebalanceInterval: 140,
      exclusion: null,
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.running = false;
    this.frameCount = 0;
    this.allNodes = [];
    this.trees = [];
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
  // DIVERSE TREE TYPES
  // ═══════════════════════════════════════

  // Type 0: Standard binary — clean forking
  // Type 1: Bushy — 3-4 children, wider spread
  // Type 2: Weeping — long, drooping branches
  // Type 3: Spire — mostly straight with small side shoots
  // Type 4: Fractal — very regular, geometric

  _growBranch(x, y, angle, length, depth, maxDepth, treeType) {
    if (depth > maxDepth || length < 2.5) return null;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    if (endX < 1 || endX > this.w - 1 || endY < 1 || endY > this.h - 1) return null;
    if (this._inExclusion(endX, endY)) return null;
    if (!this._canPlace(endX, endY)) return null;

    this.allNodes.push({ x: endX, y: endY });

    const node = {
      x, y, endX, endY,
      targetEndX: endX, targetEndY: endY,
      depth, length, angle, treeType,
      opacity: 0,
      maxOpacity: this._range(0.5, 0.95),
      isAccent: this._rng() < 0.015,
      children: [],
    };

    const nextDepth = depth + 1;

    switch (treeType) {
      case 0: { // Standard binary
        const shrink = this._range(0.6, 0.8);
        const spread = this._range(0.3, 0.7);
        const l = this._growBranch(endX, endY, angle - spread, length * shrink, nextDepth, maxDepth, treeType);
        const r = this._growBranch(endX, endY, angle + spread, length * shrink, nextDepth, maxDepth, treeType);
        if (l) node.children.push(l);
        if (r) node.children.push(r);
        break;
      }
      case 1: { // Bushy — more children
        const count = this._irange(2, 5);
        const totalSpread = this._range(0.8, 1.6);
        for (let i = 0; i < count; i++) {
          const a = angle - totalSpread / 2 + (totalSpread / (count - 1 || 1)) * i + this._range(-0.1, 0.1);
          const child = this._growBranch(endX, endY, a, length * this._range(0.5, 0.75), nextDepth, maxDepth, treeType);
          if (child) node.children.push(child);
        }
        break;
      }
      case 2: { // Weeping — long droopy
        const shrink = this._range(0.7, 0.9);
        const gravity = 0.15;
        const l = this._growBranch(endX, endY, angle - this._range(0.15, 0.4) + gravity, length * shrink, nextDepth, maxDepth, treeType);
        const r = this._growBranch(endX, endY, angle + this._range(0.15, 0.4) + gravity, length * shrink, nextDepth, maxDepth, treeType);
        if (l) node.children.push(l);
        if (r) node.children.push(r);
        // Extra droop branch
        if (this._rng() < 0.3) {
          const d = this._growBranch(endX, endY, angle + gravity * 2, length * shrink * 0.7, nextDepth, maxDepth, treeType);
          if (d) node.children.push(d);
        }
        break;
      }
      case 3: { // Spire — mostly straight, small side shoots
        // Main continuation
        const main = this._growBranch(endX, endY, angle + this._range(-0.08, 0.08), length * this._range(0.8, 0.95), nextDepth, maxDepth, treeType);
        if (main) node.children.push(main);
        // Small side shoot
        if (this._rng() < 0.5) {
          const side = this._rng() > 0.5 ? 1 : -1;
          const shoot = this._growBranch(endX, endY, angle + side * this._range(0.6, 1.2), length * this._range(0.25, 0.45), nextDepth, maxDepth, treeType);
          if (shoot) node.children.push(shoot);
        }
        break;
      }
      case 4: { // Fractal — regular geometric
        const shrink = 0.65;
        const spread = 0.52;
        const l = this._growBranch(endX, endY, angle - spread, length * shrink, nextDepth, maxDepth, treeType);
        const r = this._growBranch(endX, endY, angle + spread, length * shrink, nextDepth, maxDepth, treeType);
        if (l) node.children.push(l);
        if (r) node.children.push(r);
        break;
      }
    }

    return node;
  }

  _initTrees() {
    this.trees = [];
    this.allNodes = [];
    const sp = this.opts.treeSpacing;

    const spawn = (x, y, angle, lenMin, lenMax, depthMin, depthMax) => {
      const treeType = this._irange(0, 5);
      const tree = this._growBranch(x, y, angle, this._range(lenMin, lenMax), 0, this._irange(depthMin, depthMax), treeType);
      if (tree) this.trees.push(tree);
    };

    // EDGE TREES — multiple layers, dense
    for (let layer = 0; layer < 4; layer++) {
      const offset = layer * 6;
      // Left
      for (let y = 3; y < this.h - 3; y += sp + this._range(-2, 2)) {
        spawn(this._range(1, 3 + offset), y, this._range(-0.7, 0.7), 12, 70, 5, 12);
      }
      // Right
      for (let y = 3; y < this.h - 3; y += sp + this._range(-2, 2)) {
        spawn(this.w - this._range(1, 3 + offset), y, Math.PI + this._range(-0.7, 0.7), 12, 70, 5, 12);
      }
      // Top
      for (let x = 3; x < this.w - 3; x += sp + this._range(-2, 2)) {
        spawn(x, this._range(1, 3 + offset), Math.PI/2 + this._range(-0.7, 0.7), 10, 60, 5, 11);
      }
      // Bottom
      for (let x = 3; x < this.w - 3; x += sp + this._range(-2, 2)) {
        spawn(x, this.h - this._range(1, 3 + offset), -Math.PI/2 + this._range(-0.7, 0.7), 10, 60, 5, 11);
      }
    }

    // Interior fill
    const interiorCount = Math.floor((this.w * this.h) / 1500);
    for (let i = 0; i < interiorCount; i++) {
      const x = this._range(this.w * 0.02, this.w * 0.98);
      const y = this._range(this.h * 0.02, this.h * 0.98);
      if (this._inExclusion(x, y)) continue;
      if (this._canPlace(x, y)) {
        this.allNodes.push({ x, y });
        spawn(x, y, this._range(0, Math.PI * 2), 5, 35, 3, 8);
      }
    }

    // Aggressive fill — 8 passes
    for (let pass = 0; pass < 8; pass++) {
      const step = 6 + pass * 2;
      for (let y = 3; y < this.h - 3; y += step) {
        for (let x = 3; x < this.w - 3; x += step) {
          if (!this._inExclusion(x, y) && this._canPlace(x, y) && this._rng() < 0.7) {
            this.allNodes.push({ x, y });
            spawn(x, y, this._range(0, Math.PI * 2), 3, 15, 2, 5);
          }
        }
      }
    }
  }

  // Gentle mutation — trees sway
  _mutateNode(node) {
    if (!node) return;
    node.angle += this._range(-0.012, 0.012);
    node.targetEndX = node.x + Math.cos(node.angle) * node.length;
    node.targetEndY = node.y + Math.sin(node.angle) * node.length;
    node.endX += (node.targetEndX - node.endX) * 0.02;
    node.endY += (node.targetEndY - node.endY) * 0.02;
    node.opacity = Math.min(node.maxOpacity, node.opacity + 0.006);
    for (const child of node.children) {
      child.x = node.endX;
      child.y = node.endY;
      this._mutateNode(child);
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
    const edgeAlpha = a * (node.depth < 3 ? 0.7 : 0.5);
    ctx.strokeStyle = this._col(node.depth < 3 ? pal.branch : pal.branchLight, edgeAlpha);
    ctx.lineWidth = Math.max(0.2, 1.4 - node.depth * 0.1);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(node.endX, node.endY);
    ctx.stroke();

    // Node
    const isLeaf = node.children.length === 0;
    if (isLeaf) {
      ctx.fillStyle = this._col(node.isAccent ? pal.accent : pal.leafFill, a * 0.7);
      ctx.beginPath();
      ctx.arc(node.endX, node.endY, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (node.depth < 4) {
      ctx.fillStyle = this._col(pal.nodeFill, a * 0.2);
      ctx.strokeStyle = this._col(node.isAccent ? pal.accent : pal.node, a * 0.5);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(node.endX, node.endY, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    for (const child of node.children) this._renderNode(child);
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

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      for (const tree of this.trees) this._mutateNode(tree);

      this.ctx.clearRect(0, 0, this.w, this.h);
      for (const tree of this.trees) this._renderNode(tree);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  stop() { this.running = false; return this; }

  resize(w, h) {
    this.canvas.width = w; this.canvas.height = h;
    this.w = w; this.h = h;
    this._initTrees();
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
