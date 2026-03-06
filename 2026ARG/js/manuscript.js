// manuscript.js — Generative Hypermedievalism Engine v4
// Seithar Group — Futurist Illuminated Manuscript
// Algorithmic. Blocky. Dense. Living Enochian. Continuous mutation.

class ManuscriptBorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      borderWidth: 180,
      seed: Math.random() * 99999 | 0,
      sides: ['left', 'right', 'top', 'bottom'],
      palette: {
        line: 'rgba(60, 58, 54, VAR)',
        node: 'rgba(70, 67, 62, VAR)',
        text: 'rgba(55, 52, 48, VAR)',
        accent: 'rgba(140, 40, 40, VAR)',
        grid: 'rgba(160, 155, 148, VAR)',
        block: 'rgba(90, 87, 82, VAR)',
      },
      mutationRate: 0.008,
      rebalanceInterval: 140,
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.running = false;
    this.frameCount = 0;

    this.structures = [];    // algorithmic block structures
    this.textBlocks = [];    // living Enochian
    this.gridLines = [];
    this.nodes = [];
    this.connections = [];
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
  // ENOCHIAN GLYPHS — drawn larger, bolder
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
  // DENSE GRID UNDERLAY
  // ═══════════════════════════════════════

  _initGrid() {
    this.gridLines = [];
    const b = this.opts.borderWidth;
    // Dense horizontal + vertical ruling
    for (let y = 0; y < this.h; y += this._range(8, 16)) {
      if (y < b || y > this.h - b) {
        this.gridLines.push({ x1: 0, y1: y, x2: this.w, y2: y, opacity: this._range(0.05, 0.14) });
      }
    }
    for (let x = 0; x < this.w; x += this._range(8, 16)) {
      if (x < b || x > this.w - b) {
        this.gridLines.push({ x1: x, y1: 0, x2: x, y2: this.h, opacity: this._range(0.05, 0.14) });
      }
    }
  }

  // ═══════════════════════════════════════
  // BLOCK STRUCTURES — Recursive subdivision, circuit-like
  // ═══════════════════════════════════════

  _subdivide(x, y, w, h, depth, maxDepth) {
    if (depth > maxDepth || w < 8 || h < 8) return;

    const block = {
      x, y, w, h, depth,
      opacity: 0,
      maxOpacity: this._range(0.15, 0.55),
      filled: this._rng() < 0.15,
      isAccent: this._rng() < 0.08,
      hasNode: this._rng() < 0.3,
      nodeShape: this._pick(['circle', 'diamond', 'square']),
      born: this.frameCount,
      targetX: x, targetY: y, targetW: w, targetH: h,
    };
    this.structures.push(block);

    // Recursive subdivision — horizontal or vertical split
    if (this._rng() < 0.85 && depth < maxDepth) {
      if (this._rng() > 0.5 && w > 16) {
        // Vertical split
        const splitX = x + w * this._range(0.3, 0.7);
        this._subdivide(x, y, splitX - x, h, depth + 1, maxDepth);
        this._subdivide(splitX, y, x + w - splitX, h, depth + 1, maxDepth);
      } else if (h > 16) {
        // Horizontal split
        const splitY = y + h * this._range(0.3, 0.7);
        this._subdivide(x, y, w, splitY - y, depth + 1, maxDepth);
        this._subdivide(x, splitY, w, y + h - splitY, depth + 1, maxDepth);
      }
    }
  }

  _initStructures() {
    this.structures = [];
    const b = this.opts.borderWidth;
    const sides = this.opts.sides;
    const maxD = this._irange(4, 7);

    if (sides.includes('left'))
      this._subdivide(4, 4, b - 8, this.h - 8, 0, maxD);
    if (sides.includes('right'))
      this._subdivide(this.w - b + 4, 4, b - 8, this.h - 8, 0, maxD);
    if (sides.includes('top'))
      this._subdivide(b, 4, this.w - b * 2, b - 8, 0, maxD);
    if (sides.includes('bottom'))
      this._subdivide(b, this.h - b + 4, this.w - b * 2, b - 8, 0, maxD);
  }

  _mutateStructures() {
    for (const block of this.structures) {
      if (this._rng() < this.opts.mutationRate) {
        // Shift dimensions slightly
        block.targetX = block.x + this._range(-3, 3);
        block.targetY = block.y + this._range(-3, 3);
        block.targetW = Math.max(6, block.w + this._range(-4, 4));
        block.targetH = Math.max(6, block.h + this._range(-4, 4));
        if (this._rng() < 0.1) block.isAccent = !block.isAccent;
        if (this._rng() < 0.15) block.filled = !block.filled;
        if (this._rng() < 0.1) block.nodeShape = this._pick(['circle', 'diamond', 'square']);
      }
      // Morph toward targets
      block.x += (block.targetX - block.x) * 0.02;
      block.y += (block.targetY - block.y) * 0.02;
      block.w += (block.targetW - block.w) * 0.02;
      block.h += (block.targetH - block.h) * 0.02;
      block.opacity = Math.min(block.maxOpacity, block.opacity + 0.006);
    }
  }

  // ═══════════════════════════════════════
  // CONNECTOR LINES — between blocks
  // ═══════════════════════════════════════

  _initConnections() {
    this.connections = [];
    const structs = this.structures.filter(s => s.hasNode);
    for (let i = 0; i < structs.length; i++) {
      for (let j = i + 1; j < structs.length; j++) {
        const a = structs[i], b = structs[j];
        const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
        const bx = b.x + b.w / 2, by = b.y + b.h / 2;
        const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
        if (dist < 120 && this._rng() < 0.25) {
          this.connections.push({
            ai: this.structures.indexOf(a),
            bi: this.structures.indexOf(b),
            opacity: this._range(0.08, 0.25),
            orthogonal: this._rng() > 0.4, // right-angle routing like circuits
          });
        }
      }
    }
  }

  // ═══════════════════════════════════════
  // LIVING ENOCHIAN TEXT — Dense, filling, typing, morphing
  // ═══════════════════════════════════════

  _spawnTextBlock() {
    const b = this.opts.borderWidth;
    const side = this._pick(this.opts.sides);
    let x, y, dir, lineDir;

    if (side === 'left') {
      x = this._range(4, b - 10);
      y = this._range(8, this.h - 8);
      dir = Math.PI / 2;
      lineDir = 0;
    } else if (side === 'right') {
      x = this.w - this._range(4, b - 10);
      y = this._range(8, this.h - 8);
      dir = Math.PI / 2;
      lineDir = Math.PI;
    } else if (side === 'top') {
      x = this._range(8, this.w - 8);
      y = this._range(4, b - 10);
      dir = 0;
      lineDir = Math.PI / 2;
    } else {
      x = this._range(8, this.w - 8);
      y = this.h - this._range(4, b - 10);
      dir = 0;
      lineDir = -Math.PI / 2;
    }

    const lineCount = this._irange(3, 15);
    const lines = [];
    for (let l = 0; l < lineCount; l++) {
      const charCount = this._irange(4, 18);
      const chars = [];
      for (let c = 0; c < charCount; c++) {
        chars.push({
          glyph: this._irange(0, ManuscriptBorder.ENOCHIAN.length),
          targetGlyph: this._irange(0, ManuscriptBorder.ENOCHIAN.length),
          morphT: 1,
          morphSpeed: this._range(0.008, 0.03),
          visible: false,
          visibleT: 0,
        });
      }
      lines.push(chars);
    }

    this.textBlocks.push({
      x, y, dir, lineDir, side, lines,
      charSize: this._range(8, 13),
      charSpacing: this._range(9, 14),
      lineSpacing: this._range(11, 16),
      opacity: 0,
      maxOpacity: this._range(0.35, 0.7),
      born: this.frameCount,
      typingLine: 0, typingChar: 0,
      typeSpeed: this._range(0.8, 3.0),
      typeAccum: 0,
      alive: true,
      morphCycle: this._irange(100, 300),
      lastMorph: 0,
      lifespan: this._irange(600, 2000),
    });
  }

  _stepTextBlocks() {
    for (const block of this.textBlocks) {
      if (!block.alive) continue;
      block.opacity = Math.min(block.maxOpacity, block.opacity + 0.008);

      // Typing — faster
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
            if (ch.visible && this._rng() < 0.4) {
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
            ch.visibleT = Math.min(1, ch.visibleT + 0.06);
            if (ch.morphT < 1) ch.morphT = Math.min(1, ch.morphT + ch.morphSpeed);
          }
        }
      }

      const age = this.frameCount - block.born;
      if (age > block.lifespan) {
        block.opacity -= 0.005;
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
    ctx.lineWidth = 0.3;
    for (const line of this.gridLines) {
      ctx.strokeStyle = this._col(pal.grid, line.opacity);
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
    }
  }

  _renderStructures() {
    const ctx = this.ctx;
    const pal = this.opts.palette;

    for (const block of this.structures) {
      if (block.opacity < 0.005) continue;
      const a = block.opacity;

      const col = block.isAccent ? pal.accent : pal.block;

      if (block.filled) {
        ctx.fillStyle = this._col(col, a * 0.12);
        ctx.fillRect(block.x, block.y, block.w, block.h);
      }

      // Border
      ctx.strokeStyle = this._col(col, a * 0.5);
      ctx.lineWidth = block.depth < 2 ? 1.2 : 0.6;
      ctx.strokeRect(block.x, block.y, block.w, block.h);

      // Node at center
      if (block.hasNode) {
        const cx = block.x + block.w / 2;
        const cy = block.y + block.h / 2;
        const s = Math.min(block.w, block.h) * 0.15;

        ctx.fillStyle = this._col(block.isAccent ? pal.accent : pal.node, a * 0.6);
        ctx.beginPath();
        switch (block.nodeShape) {
          case 'circle':
            ctx.arc(cx, cy, s, 0, Math.PI * 2);
            break;
          case 'diamond':
            ctx.moveTo(cx, cy - s);
            ctx.lineTo(cx + s, cy);
            ctx.lineTo(cx, cy + s);
            ctx.lineTo(cx - s, cy);
            ctx.closePath();
            break;
          case 'square':
            ctx.rect(cx - s, cy - s, s * 2, s * 2);
            break;
        }
        ctx.fill();
      }
    }

    // Connections — orthogonal routing
    for (const conn of this.connections) {
      const a = this.structures[conn.ai];
      const b = this.structures[conn.bi];
      if (!a || !b) continue;
      const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
      const bx = b.x + b.w / 2, by = b.y + b.h / 2;
      const alpha = Math.min(a.opacity, b.opacity) * conn.opacity;

      ctx.strokeStyle = this._col(this.opts.palette.line, alpha);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      if (conn.orthogonal) {
        // Right-angle routing
        const midX = (ax + bx) / 2;
        ctx.lineTo(midX, ay);
        ctx.lineTo(midX, by);
        ctx.lineTo(bx, by);
      } else {
        ctx.lineTo(bx, by);
      }
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
            this._drawGlyph(gx, gy, ch.glyph, block.dir, block.charSize, alpha * (1 - ch.morphT));
            this._drawGlyph(gx, gy, ch.targetGlyph, block.dir, block.charSize, alpha * ch.morphT);
          } else {
            this._drawGlyph(gx, gy, ch.morphT >= 1 ? ch.targetGlyph : ch.glyph, block.dir, block.charSize, alpha);
          }
        }
      }

      // Typing cursor
      if (block.typingLine < block.lines.length) {
        const blink = Math.sin(this.frameCount * 0.15) > 0;
        if (blink) {
          const along = block.typingChar * block.charSpacing;
          const across = block.typingLine * block.lineSpacing;
          const cx = block.x + Math.cos(block.dir) * along + Math.cos(block.lineDir) * across;
          const cy = block.y + Math.sin(block.dir) * along + Math.sin(block.lineDir) * across;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(block.dir);
          ctx.fillStyle = this._col(pal.text, block.opacity * 0.8);
          ctx.fillRect(0, 0, 1.5, block.charSize * 0.8);
          ctx.restore();
        }
      }
    }
  }

  _drawGlyph(x, y, idx, angle, size, alpha) {
    const glyph = ManuscriptBorder.ENOCHIAN[idx % ManuscriptBorder.ENOCHIAN.length];
    if (!glyph || alpha < 0.01) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = this._col(this.opts.palette.text, alpha);
    ctx.lineWidth = 1.0;
    ctx.lineCap = 'square'; // blocky
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
    this._initStructures();
    this._initConnections();

    // Dense initial text
    for (let i = 0; i < 25; i++) this._spawnTextBlock();

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      // Mutate structures
      if (this.frameCount % this.opts.rebalanceInterval === 0) {
        this._mutateStructures();
        if (this._rng() < 0.1) this._initConnections();
      }
      this._mutateStructures();

      // Step text
      this._stepTextBlocks();

      // Spawn new text blocks — keep it dense
      if (this.frameCount % 50 === 0 && this.textBlocks.length < 60) {
        this._spawnTextBlock();
      }

      // Render
      this.ctx.clearRect(0, 0, this.w, this.h);
      this._renderGrid();
      this._renderStructures();
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
    this._initGrid();
    this._initStructures();
    this._initConnections();
    this.textBlocks = [];
    for (let i = 0; i < 25; i++) this._spawnTextBlock();
  }

  generate() {
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this._initGrid();
    this._initStructures();
    this._initConnections();
    for (let i = 0; i < 30; i++) this._spawnTextBlock();
    for (let f = 0; f < 500; f++) {
      this.frameCount++;
      this._mutateStructures();
      this._stepTextBlocks();
      if (f % 30 === 0 && this.textBlocks.length < 50) this._spawnTextBlock();
    }
    this.ctx.clearRect(0, 0, this.w, this.h);
    this._renderGrid();
    this._renderStructures();
    this._renderTextBlocks();
    return this;
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
