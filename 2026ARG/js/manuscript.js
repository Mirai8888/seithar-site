// manuscript.js — Generative Hypermedievalism Engine v3
// Seithar Group — Futurist Illuminated Manuscript
// Algorithmic structures. Living Enochian. Continuous mutation.
// Reference: CLRS cover (Calder mobile), computational geometry, recursive subdivision

class ManuscriptBorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      borderWidth: 140,
      seed: Math.random() * 99999 | 0,
      sides: ['left', 'right', 'top', 'bottom'],
      palette: {
        line: 'rgba(80, 78, 74, VAR)',
        node: 'rgba(90, 87, 82, VAR)',
        nodeHollow: 'rgba(120, 116, 110, VAR)',
        text: 'rgba(70, 67, 62, VAR)',
        textFaint: 'rgba(110, 106, 100, VAR)',
        accent: 'rgba(160, 50, 50, VAR)',    // sparse red accents like Calder
        grid: 'rgba(180, 175, 168, VAR)',
      },
      // Structural params
      treeCount: 6,
      maxTreeDepth: 8,
      voronoiCells: 25,
      mutationRate: 0.006,
      textDensity: 0.7,
      rebalanceInterval: 180,   // frames between tree rebalancing
      morphDuration: 60,        // frames for a morph transition
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.running = false;
    this.frameCount = 0;

    // Living structures
    this.trees = [];
    this.textBlocks = [];
    this.gridLines = [];
    this.voronoiPts = [];
    this.floatingNodes = [];
    this.connections = [];

    // Morph state
    this.morphing = [];
  }

  // PRNG
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
  // ENOCHIAN GLYPHS
  // ═══════════════════════════════════════
  static ENOCHIAN = [
    [[[0,0],[0,1],[0.6,1]],[[0.3,0],[0.3,0.6]]],
    [[[0,0],[0.5,0.5],[0,1]],[[0.5,0.5],[1,0.5]]],
    [[[0.5,0],[0,0.5],[0.5,1],[1,0.5],[0.5,0]]],
    [[[0,1],[0.5,0],[1,1]],[[0.2,0.6],[0.8,0.6]]],
    [[[0.5,0],[0.5,1]],[[0,0.5],[1,0.5]],[[0.2,0.2],[0.8,0.8]]],
    [[[0,0.7],[0.5,0],[1,0.7]],[[0.5,0],[0.5,1]]],
    [[[0,0],[1,1]],[[1,0],[0,1]],[[0.5,0],[0.5,0.25]]],
    [[[0,0],[0,1]],[[0,0],[0.7,0]],[[0,0.5],[0.5,0.5]]],
    [[[0,1],[0.25,0],[0.5,0.6],[0.75,0],[1,1]]],
    [[[0,1],[0.5,0],[1,1]]],
    [[[0,0],[0,1]],[[0,0],[0.7,0.5]],[[0,1],[0.7,0.5]]],
    [[[0,0.5],[0.5,0],[1,0.5],[0.5,1],[0,0.5]],[[0.5,0.3],[0.5,0.7]]],
    [[[0,0],[0,1],[1,1],[1,0]]],
    [[[0,0],[0.5,1],[1,0]],[[0.25,0.5],[0.75,0.5]]],
    [[[0,0],[0,0.5],[0.6,0.5],[0.6,1]]],
    [[[0,1],[0.3,0],[0.7,0],[1,1]],[[0.15,0.5],[0.85,0.5]]],
    [[[0,0],[1,1]],[[0,1],[1,0]],[[0.5,0.3],[0.5,0]]],
    [[[0,0.5],[0.5,0],[1,0.5]],[[0.5,0.5],[0.5,1]],[[0.2,1],[0.8,1]]],
    [[[0,1],[0.3,0],[0.7,0.6],[1,0]]],
    [[[0,0],[0.3,1],[0.5,0.3],[0.7,1],[1,0]]],
    [[[0,0],[1,0],[1,1],[0,1],[0,0]],[[0,0],[1,1]]],
  ];

  // ═══════════════════════════════════════
  // ALGORITHMIC TREES — Binary/recursive structures
  // ═══════════════════════════════════════

  _buildTree(rootX, rootY, angle, length, depth, maxDepth, spread) {
    if (depth > maxDepth || length < 3) return null;

    const endX = rootX + Math.cos(angle) * length;
    const endY = rootY + Math.sin(angle) * length;

    const node = {
      x: rootX, y: rootY,
      endX, endY,
      targetX: rootX, targetY: rootY,
      targetEndX: endX, targetEndY: endY,
      depth,
      length,
      angle,
      opacity: 0,
      maxOpacity: Math.max(0.15, 0.7 - depth * 0.07),
      nodeSize: Math.max(1.5, 4 - depth * 0.4),
      lineWidth: Math.max(0.4, 2.2 - depth * 0.25),
      isAccent: this._rng() < 0.06,  // rare red accent nodes
      children: [],
    };

    // Binary branching with slight asymmetry
    const shrink = this._range(0.6, 0.8);
    const leftAngle = angle - spread * this._range(0.7, 1.3);
    const rightAngle = angle + spread * this._range(0.7, 1.3);

    const leftChild = this._buildTree(endX, endY, leftAngle, length * shrink, depth + 1, maxDepth, spread * this._range(0.85, 1.1));
    const rightChild = this._buildTree(endX, endY, rightAngle, length * shrink, depth + 1, maxDepth, spread * this._range(0.85, 1.1));

    if (leftChild) node.children.push(leftChild);
    if (rightChild) node.children.push(rightChild);

    // Occasional ternary branch
    if (this._rng() < 0.15 && depth < maxDepth - 2) {
      const midAngle = angle + this._range(-0.2, 0.2);
      const midChild = this._buildTree(endX, endY, midAngle, length * shrink * 0.7, depth + 1, maxDepth, spread);
      if (midChild) node.children.push(midChild);
    }

    return node;
  }

  _initTrees() {
    this.trees = [];
    const b = this.opts.borderWidth;
    const sides = this.opts.sides;

    const spawn = (x, y, angle) => {
      const len = this._range(25, 65);
      const depth = this._irange(4, this.opts.maxTreeDepth);
      const spread = this._range(0.3, 0.7);
      const tree = this._buildTree(x, y, angle, len, 0, depth, spread);
      if (tree) this.trees.push(tree);
    };

    // Distribute trees along borders
    const spacing = 60 + this._range(-15, 15);
    if (sides.includes('left')) {
      for (let y = 20; y < this.h - 20; y += spacing + this._range(-20, 20)) {
        spawn(this._range(5, 15), y, this._range(-0.3, 0.3));
      }
    }
    if (sides.includes('right')) {
      for (let y = 20; y < this.h - 20; y += spacing + this._range(-20, 20)) {
        spawn(this.w - this._range(5, 15), y, Math.PI + this._range(-0.3, 0.3));
      }
    }
    if (sides.includes('top')) {
      for (let x = 20; x < this.w - 20; x += spacing + this._range(-20, 20)) {
        spawn(x, this._range(5, 15), Math.PI / 2 + this._range(-0.3, 0.3));
      }
    }
    if (sides.includes('bottom')) {
      for (let x = 20; x < this.w - 20; x += spacing + this._range(-20, 20)) {
        spawn(x, this.h - this._range(5, 15), -Math.PI / 2 + this._range(-0.3, 0.3));
      }
    }
  }

  // Rebalance: mutate tree structure
  _rebalanceTree(node) {
    if (!node) return;

    // Mutate angles slightly
    node.angle += this._range(-0.12, 0.12);
    const newEndX = node.x + Math.cos(node.angle) * node.length;
    const newEndY = node.y + Math.sin(node.angle) * node.length;

    // Set morph targets
    node.targetEndX = newEndX;
    node.targetEndY = newEndY;

    // Occasionally prune or grow
    if (this._rng() < 0.08 && node.children.length > 0) {
      // Prune a random child
      node.children.splice(this._irange(0, node.children.length), 1);
    }
    if (this._rng() < 0.1 && node.children.length < 3 && node.depth < this.opts.maxTreeDepth - 1) {
      // Grow new branch
      const angle = node.angle + this._range(-0.8, 0.8);
      const child = this._buildTree(node.endX, node.endY, angle, node.length * 0.65, node.depth + 1, this.opts.maxTreeDepth, this._range(0.3, 0.6));
      if (child) node.children.push(child);
    }

    // Toggle accent
    if (this._rng() < 0.03) node.isAccent = !node.isAccent;

    // Recurse
    for (const child of node.children) {
      child.x = node.endX;
      child.y = node.endY;
      child.targetX = node.targetEndX;
      child.targetY = node.targetEndY;
      this._rebalanceTree(child);
    }
  }

  // Interpolate tree positions toward targets
  _morphTree(node, t) {
    if (!node) return;
    const ease = t;
    node.endX += (node.targetEndX - node.endX) * ease;
    node.endY += (node.targetEndY - node.endY) * ease;
    node.x += (node.targetX - node.x) * ease;
    node.y += (node.targetY - node.y) * ease;
    node.opacity = Math.min(node.maxOpacity, node.opacity + 0.008);

    for (const child of node.children) {
      child.x = node.endX;
      child.y = node.endY;
      child.targetX = node.endX;
      child.targetY = node.endY;
      this._morphTree(child, t);
    }
  }

  // ═══════════════════════════════════════
  // GRID UNDERLAY — Faint construction lines
  // ═══════════════════════════════════════

  _initGrid() {
    this.gridLines = [];
    const b = this.opts.borderWidth;

    // Horizontal ruling lines in border regions
    for (let y = 8; y < this.h; y += this._range(12, 22)) {
      if (y < b || y > this.h - b) {
        this.gridLines.push({
          x1: 0, y1: y, x2: this.w, y2: y,
          opacity: this._range(0.04, 0.1),
          dashed: this._rng() > 0.6,
        });
      }
    }
    // Vertical
    for (let x = 8; x < this.w; x += this._range(12, 22)) {
      if (x < b || x > this.w - b) {
        this.gridLines.push({
          x1: x, y1: 0, x2: x, y2: this.h,
          opacity: this._range(0.04, 0.1),
          dashed: this._rng() > 0.6,
        });
      }
    }
  }

  // ═══════════════════════════════════════
  // FLOATING GEOMETRIC NODES — Calder-like
  // ═══════════════════════════════════════

  _initFloatingNodes() {
    this.floatingNodes = [];
    const b = this.opts.borderWidth;
    const count = this._irange(15, 35);

    for (let i = 0; i < count; i++) {
      const side = this._pick(this.opts.sides);
      let x, y;
      if (side === 'left') { x = this._range(8, b - 8); y = this._range(8, this.h - 8); }
      else if (side === 'right') { x = this.w - this._range(8, b - 8); y = this._range(8, this.h - 8); }
      else if (side === 'top') { x = this._range(8, this.w - 8); y = this._range(8, b - 8); }
      else { x = this._range(8, this.w - 8); y = this.h - this._range(8, b - 8); }

      this.floatingNodes.push({
        x, y,
        targetX: x, targetY: y,
        size: this._range(2, 7),
        shape: this._pick(['circle', 'diamond', 'square', 'triangle']),
        filled: this._rng() > 0.5,
        isAccent: this._rng() < 0.12,
        opacity: 0,
        maxOpacity: this._range(0.2, 0.6),
        driftAngle: this._range(0, Math.PI * 2),
        driftSpeed: this._range(0.002, 0.008),
        driftRadius: this._range(2, 10),
        baseX: x, baseY: y,
      });
    }

    // Create connections between nearby nodes
    this._updateConnections();
  }

  _updateConnections() {
    this.connections = [];
    const nodes = this.floatingNodes;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && this._rng() < 0.4) {
          this.connections.push({
            a: i, b: j,
            opacity: Math.max(0.05, 0.2 - dist * 0.002),
            dashed: this._rng() > 0.5,
          });
        }
      }
    }
  }

  _stepFloatingNodes() {
    for (const node of this.floatingNodes) {
      node.opacity = Math.min(node.maxOpacity, node.opacity + 0.005);
      // Gentle drift
      node.driftAngle += node.driftSpeed;
      node.x = node.baseX + Math.cos(node.driftAngle) * node.driftRadius;
      node.y = node.baseY + Math.sin(node.driftAngle * 0.7) * node.driftRadius;
    }

    // Periodically re-establish connections
    if (this.frameCount % 300 === 0) this._updateConnections();

    // Occasionally mutate a node
    if (this._rng() < this.opts.mutationRate) {
      const node = this._pick(this.floatingNodes);
      node.shape = this._pick(['circle', 'diamond', 'square', 'triangle']);
      node.filled = !node.filled;
      if (this._rng() < 0.15) node.isAccent = !node.isAccent;
    }
  }

  // ═══════════════════════════════════════
  // LIVING ENOCHIAN TEXT — Types, morphs, restructures
  // ═══════════════════════════════════════

  _spawnTextBlock() {
    const b = this.opts.borderWidth;
    const side = this._pick(this.opts.sides);
    let x, y, dir, lineDir;

    if (side === 'left') {
      x = this._range(6, b * 0.75);
      y = this._range(15, this.h - 15);
      dir = Math.PI / 2;
      lineDir = 0;
    } else if (side === 'right') {
      x = this.w - this._range(6, b * 0.75);
      y = this._range(15, this.h - 15);
      dir = Math.PI / 2;
      lineDir = Math.PI;
    } else if (side === 'top') {
      x = this._range(15, this.w - 15);
      y = this._range(6, b * 0.75);
      dir = 0;
      lineDir = Math.PI / 2;
    } else {
      x = this._range(15, this.w - 15);
      y = this.h - this._range(6, b * 0.75);
      dir = 0;
      lineDir = -Math.PI / 2;
    }

    const lineCount = this._irange(2, 10);
    const lines = [];
    for (let l = 0; l < lineCount; l++) {
      const charCount = this._irange(3, 14);
      const chars = [];
      for (let c = 0; c < charCount; c++) {
        chars.push({
          glyph: this._irange(0, ManuscriptBorder.ENOCHIAN.length),
          targetGlyph: this._irange(0, ManuscriptBorder.ENOCHIAN.length),
          morphT: 1,
          morphSpeed: this._range(0.005, 0.02),
          visible: false,
          visibleT: 0,
        });
      }
      lines.push(chars);
    }

    this.textBlocks.push({
      x, y, dir, lineDir, side, lines,
      charSize: this._range(6, 10),
      charSpacing: this._range(7, 11),
      lineSpacing: this._range(9, 14),
      opacity: 0,
      maxOpacity: this._range(0.25, 0.55),
      born: this.frameCount,
      typingLine: 0, typingChar: 0,
      typeSpeed: this._range(0.4, 2.0),
      typeAccum: 0,
      alive: true,
      morphCycle: this._irange(150, 400),
      lastMorph: 0,
      lifespan: this._irange(800, 2500),
    });
  }

  _stepTextBlocks() {
    for (const block of this.textBlocks) {
      if (!block.alive) continue;
      block.opacity = Math.min(block.maxOpacity, block.opacity + 0.005);

      // Typing
      block.typeAccum += block.typeSpeed;
      while (block.typeAccum >= 1 && block.typingLine < block.lines.length) {
        block.typeAccum -= 1;
        const line = block.lines[block.typingLine];
        if (block.typingChar < line.length) {
          line[block.typingChar].visible = true;
          block.typingChar++;
        } else {
          block.typingLine++;
          block.typingChar = 0;
        }
      }

      // Morph wave
      if (this.frameCount - block.lastMorph > block.morphCycle) {
        block.lastMorph = this.frameCount;
        for (const line of block.lines) {
          for (const ch of line) {
            if (ch.visible && this._rng() < 0.35) {
              ch.glyph = ch.targetGlyph;
              ch.targetGlyph = this._irange(0, ManuscriptBorder.ENOCHIAN.length);
              ch.morphT = 0;
            }
          }
        }
      }

      for (const line of block.lines) {
        for (const ch of line) {
          if (ch.visible) {
            ch.visibleT = Math.min(1, ch.visibleT + 0.04);
            if (ch.morphT < 1) ch.morphT = Math.min(1, ch.morphT + ch.morphSpeed);
          }
        }
      }

      // Lifespan
      const age = this.frameCount - block.born;
      if (age > block.lifespan) {
        block.opacity -= 0.004;
        if (block.opacity <= 0) block.alive = false;
      }
    }
    this.textBlocks = this.textBlocks.filter(b => b.alive);
  }

  // ═══════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════

  _renderGrid() {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    for (const line of this.gridLines) {
      ctx.strokeStyle = this._col(pal.grid, line.opacity);
      ctx.lineWidth = 0.3;
      if (line.dashed) ctx.setLineDash([2, 6]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  _renderTreeNode(node) {
    if (!node || node.opacity < 0.005) return;
    const ctx = this.ctx;
    const pal = this.opts.palette;
    const a = node.opacity;

    // Clamp to border
    if (!this._inBorder(node.endX, node.endY) && !this._inBorder(node.x, node.y)) return;

    // Line
    ctx.strokeStyle = node.isAccent ?
      this._col(pal.accent, a * 0.7) :
      this._col(pal.line, a * 0.6);
    ctx.lineWidth = node.lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(node.endX, node.endY);
    ctx.stroke();

    // Node at endpoint
    const s = node.nodeSize;
    ctx.fillStyle = node.isAccent ?
      this._col(pal.accent, a * 0.8) :
      this._col(pal.node, a * 0.5);

    if (node.children.length === 0) {
      // Leaf nodes: filled circles
      ctx.beginPath();
      ctx.arc(node.endX, node.endY, s, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Branch nodes: hollow circles
      ctx.strokeStyle = node.isAccent ?
        this._col(pal.accent, a * 0.6) :
        this._col(pal.nodeHollow, a * 0.5);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(node.endX, node.endY, s * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Recurse
    for (const child of node.children) this._renderTreeNode(child);
  }

  _renderFloatingNodes() {
    const ctx = this.ctx;
    const pal = this.opts.palette;

    // Connections first
    for (const conn of this.connections) {
      const a = this.floatingNodes[conn.a];
      const b = this.floatingNodes[conn.b];
      const alpha = Math.min(a.opacity, b.opacity) * conn.opacity;
      ctx.strokeStyle = this._col(pal.line, alpha);
      ctx.lineWidth = 0.5;
      if (conn.dashed) ctx.setLineDash([1, 4]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Nodes
    for (const node of this.floatingNodes) {
      if (node.opacity < 0.01) continue;
      const a = node.opacity;
      const s = node.size;

      if (node.isAccent) {
        ctx.fillStyle = this._col(pal.accent, a * 0.7);
        ctx.strokeStyle = this._col(pal.accent, a * 0.5);
      } else {
        ctx.fillStyle = this._col(pal.node, a * (node.filled ? 0.5 : 0.1));
        ctx.strokeStyle = this._col(pal.node, a * 0.5);
      }
      ctx.lineWidth = 0.7;

      ctx.beginPath();
      switch (node.shape) {
        case 'circle':
          ctx.arc(node.x, node.y, s, 0, Math.PI * 2);
          break;
        case 'diamond':
          ctx.moveTo(node.x, node.y - s);
          ctx.lineTo(node.x + s, node.y);
          ctx.lineTo(node.x, node.y + s);
          ctx.lineTo(node.x - s, node.y);
          ctx.closePath();
          break;
        case 'square':
          ctx.rect(node.x - s, node.y - s, s * 2, s * 2);
          break;
        case 'triangle':
          ctx.moveTo(node.x, node.y - s);
          ctx.lineTo(node.x + s, node.y + s * 0.7);
          ctx.lineTo(node.x - s, node.y + s * 0.7);
          ctx.closePath();
          break;
      }
      if (node.filled) ctx.fill();
      ctx.stroke();
    }
  }

  _renderTextBlocks() {
    const ctx = this.ctx;
    const pal = this.opts.palette;

    for (const block of this.textBlocks) {
      if (block.opacity < 0.005) continue;

      for (let li = 0; li < block.lines.length; li++) {
        const line = block.lines[li];
        for (let ci = 0; ci < line.length; ci++) {
          const ch = line[ci];
          if (!ch.visible) continue;

          const along = ci * block.charSpacing;
          const across = li * block.lineSpacing;
          const gx = block.x + Math.cos(block.dir) * along + Math.cos(block.lineDir) * across;
          const gy = block.y + Math.sin(block.dir) * along + Math.sin(block.lineDir) * across;

          if (!this._inBorder(gx, gy)) continue;

          const alpha = block.opacity * ch.visibleT;

          if (ch.morphT < 1) {
            this._drawGlyph(gx, gy, ch.glyph, block.dir, block.charSize, alpha * (1 - ch.morphT), pal.text);
            this._drawGlyph(gx, gy, ch.targetGlyph, block.dir, block.charSize, alpha * ch.morphT, pal.text);
          } else {
            const g = ch.morphT >= 1 ? ch.targetGlyph : ch.glyph;
            this._drawGlyph(gx, gy, g, block.dir, block.charSize, alpha, pal.text);
          }
        }
      }

      // Cursor
      if (block.typingLine < block.lines.length) {
        const blink = Math.sin(this.frameCount * 0.12) > 0;
        if (blink) {
          const along = block.typingChar * block.charSpacing;
          const across = block.typingLine * block.lineSpacing;
          const cx = block.x + Math.cos(block.dir) * along + Math.cos(block.lineDir) * across;
          const cy = block.y + Math.sin(block.dir) * along + Math.sin(block.lineDir) * across;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(block.dir);
          ctx.fillStyle = this._col(pal.text, block.opacity * 0.7);
          ctx.fillRect(0, 0, 1.2, block.charSize * 0.75);
          ctx.restore();
        }
      }
    }
  }

  _drawGlyph(x, y, idx, angle, size, alpha, palKey) {
    const glyph = ManuscriptBorder.ENOCHIAN[idx % ManuscriptBorder.ENOCHIAN.length];
    if (!glyph) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = this._col(palKey, alpha);
    ctx.lineWidth = 0.6;
    ctx.lineCap = 'round';
    for (const stroke of glyph) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0][0] * size, stroke[0][1] * size);
      for (let i = 1; i < stroke.length; i++)
        ctx.lineTo(stroke[i][0] * size, stroke[i][1] * size);
      ctx.stroke();
    }
    ctx.restore();
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
    this._initTrees();
    this._initFloatingNodes();

    // Initial text blocks
    for (let i = 0; i < 12; i++) this._spawnTextBlock();

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      // Tree mutation cycle
      if (this.frameCount % this.opts.rebalanceInterval === 0) {
        for (const tree of this.trees) this._rebalanceTree(tree);
      }

      // Morph trees toward targets
      for (const tree of this.trees) this._morphTree(tree, 0.03);

      // Step floating nodes
      this._stepFloatingNodes();

      // Step text
      this._stepTextBlocks();

      // Spawn new text blocks
      if (this.frameCount % 90 === 0 && this.textBlocks.length < 40) {
        this._spawnTextBlock();
      }

      // Render
      this.ctx.clearRect(0, 0, this.w, this.h);

      this._renderGrid();
      for (const tree of this.trees) this._renderTreeNode(tree);
      this._renderFloatingNodes();
      this._renderTextBlocks();

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
    // Reinitialize structures
    this._initGrid();
    this._initTrees();
    this._initFloatingNodes();
    this.textBlocks = [];
    for (let i = 0; i < 12; i++) this._spawnTextBlock();
  }

  // Static render
  generate() {
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this._initGrid();
    this._initTrees();
    this._initFloatingNodes();
    for (let i = 0; i < 15; i++) this._spawnTextBlock();

    // Simulate
    for (let f = 0; f < 600; f++) {
      this.frameCount++;
      if (f % this.opts.rebalanceInterval === 0) {
        for (const tree of this.trees) this._rebalanceTree(tree);
      }
      for (const tree of this.trees) this._morphTree(tree, 0.05);
      this._stepFloatingNodes();
      this._stepTextBlocks();
      if (f % 60 === 0 && this.textBlocks.length < 35) this._spawnTextBlock();
    }

    this.ctx.clearRect(0, 0, this.w, this.h);
    this._renderGrid();
    for (const tree of this.trees) this._renderTreeNode(tree);
    this._renderFloatingNodes();
    this._renderTextBlocks();
    return this;
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
