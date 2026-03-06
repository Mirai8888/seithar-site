// manuscript.js — Generative Hypermedievalism Engine v2
// Seithar Group — Continuous procedural illuminated manuscript borders
// Living text. Breathing vines. Algorithmic ornamentation.

class ManuscriptBorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      borderWidth: 120,
      density: 0.9,
      seed: Math.random() * 99999 | 0,
      growthRate: 1.8,
      fadeRate: 0.002,
      maxVines: 300,
      cycleTime: 45000,
      sides: ['left', 'right', 'top', 'bottom'],
      enochianDensity: 0.6,
      palette: {
        vine: 'rgba(130, 125, 118, VAR)',
        leaf: 'rgba(145, 140, 132, VAR)',
        flower: 'rgba(130, 125, 118, VAR)',
        berry: 'rgba(115, 110, 105, VAR)',
        enochian: 'rgba(100, 95, 88, VAR)',
        tendril: 'rgba(150, 145, 138, VAR)',
        creature: 'rgba(120, 115, 108, VAR)',
      }
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.vines = [];
    this.drawn = [];
    this.textBlocks = [];   // living Enochian text blocks
    this.running = false;
    this.frameCount = 0;
    this._grid = null;
    this._initGrid();
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

  _initGrid() {
    const cs = 8;
    this._cs = cs;
    this._gcols = Math.ceil(this.w / cs);
    this._grows = Math.ceil(this.h / cs);
    this._grid = new Float32Array(this._gcols * this._grows);
  }

  _gridDensity(x, y) {
    const gx = (x / this._cs) | 0;
    const gy = (y / this._cs) | 0;
    if (gx < 0 || gx >= this._gcols || gy < 0 || gy >= this._grows) return 99;
    return this._grid[gy * this._gcols + gx];
  }

  _gridMark(x, y, v) {
    const gx = (x / this._cs) | 0;
    const gy = (y / this._cs) | 0;
    if (gx >= 0 && gx < this._gcols && gy >= 0 && gy < this._grows)
      this._grid[gy * this._gcols + gx] += v;
  }

  _gridDecay() {
    for (let i = 0; i < this._grid.length; i++) this._grid[i] *= 0.995;
  }

  _inBorder(x, y) {
    const b = this.opts.borderWidth;
    const s = this.opts.sides;
    if (s.includes('left') && x < b) return true;
    if (s.includes('right') && x > this.w - b) return true;
    if (s.includes('top') && y < b) return true;
    if (s.includes('bottom') && y > this.h - b) return true;
    return false;
  }

  _borderDepth(x, y) {
    // How deep into the border region (0 = edge of content, 1 = edge of page)
    const b = this.opts.borderWidth;
    let d = 1;
    if (x < b) d = Math.min(d, 1 - x / b);
    if (x > this.w - b) d = Math.min(d, 1 - (this.w - x) / b);
    if (y < b) d = Math.min(d, 1 - y / b);
    if (y > this.h - b) d = Math.min(d, 1 - (this.h - y) / b);
    return Math.max(0, Math.min(1, d));
  }

  _noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + this._seed * 0.001) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  _col(base, alpha) { return base.replace('VAR', Math.max(0, alpha).toFixed(3)); }

  // ═══════════════════════════════════════
  // ENOCHIAN GLYPH DEFINITIONS
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
  // LIVING TEXT BLOCKS — Enochian that types, morphs, breathes
  // ═══════════════════════════════════════

  _spawnTextBlock() {
    const b = this.opts.borderWidth;
    const side = this._pick(this.opts.sides);
    let x, y, dir, lineDir;

    // Text blocks fill vertical columns in left/right borders, horizontal rows in top/bottom
    if (side === 'left') {
      x = this._range(8, b * 0.7);
      y = this._range(20, this.h - 20);
      dir = Math.PI / 2; // text flows downward
      lineDir = 0; // lines go right
    } else if (side === 'right') {
      x = this.w - this._range(8, b * 0.7);
      y = this._range(20, this.h - 20);
      dir = Math.PI / 2;
      lineDir = Math.PI;
    } else if (side === 'top') {
      x = this._range(20, this.w - 20);
      y = this._range(8, b * 0.7);
      dir = 0; // text flows rightward
      lineDir = Math.PI / 2;
    } else {
      x = this._range(20, this.w - 20);
      y = this.h - this._range(8, b * 0.7);
      dir = 0;
      lineDir = -Math.PI / 2;
    }

    // Generate the "text" — array of glyph indices per line
    const lineCount = this._irange(3, 12);
    const lines = [];
    for (let l = 0; l < lineCount; l++) {
      const charCount = this._irange(4, 16);
      const chars = [];
      for (let c = 0; c < charCount; c++) {
        chars.push({
          glyph: this._irange(0, ManuscriptBorder.ENOCHIAN.length),
          targetGlyph: this._irange(0, ManuscriptBorder.ENOCHIAN.length),
          morphT: 0,
          morphSpeed: this._range(0.003, 0.012),
          morphDelay: this._range(0, 500),
          visible: false,
          visibleT: 0,
        });
      }
      lines.push(chars);
    }

    this.textBlocks.push({
      x, y, dir, lineDir, side,
      lines,
      charSize: this._range(7, 11),
      charSpacing: this._range(8, 12),
      lineSpacing: this._range(10, 15),
      opacity: 0,
      maxOpacity: this._range(0.2, 0.45),
      born: this.frameCount,
      typingLine: 0,
      typingChar: 0,
      typeSpeed: this._range(0.3, 1.5), // chars per frame
      typeAccum: 0,
      alive: true,
      morphCycle: this._range(200, 600), // frames between morph waves
      lastMorph: 0,
    });
  }

  _stepTextBlocks() {
    for (const block of this.textBlocks) {
      if (!block.alive) continue;

      // Fade in
      block.opacity = Math.min(block.maxOpacity, block.opacity + 0.004);

      // Typing effect — reveal characters one at a time
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

      // Morph wave — periodically mutate glyphs
      if (this.frameCount - block.lastMorph > block.morphCycle) {
        block.lastMorph = this.frameCount;
        // Pick a random subset of visible chars to morph
        for (const line of block.lines) {
          for (const ch of line) {
            if (ch.visible && this._rng() < 0.3) {
              ch.glyph = ch.targetGlyph;
              ch.targetGlyph = this._irange(0, ManuscriptBorder.ENOCHIAN.length);
              ch.morphT = 0;
            }
          }
        }
      }

      // Advance morph transitions
      for (const line of block.lines) {
        for (const ch of line) {
          if (ch.visible) {
            ch.visibleT = Math.min(1, ch.visibleT + 0.03);
            if (ch.morphT < 1) ch.morphT = Math.min(1, ch.morphT + ch.morphSpeed);
          }
        }
      }
    }

    // Fade out old blocks
    const maxAge = this.opts.cycleTime / 16;
    for (const block of this.textBlocks) {
      const age = this.frameCount - block.born;
      if (age > maxAge) block.opacity -= this.opts.fadeRate * 1.5;
      if (block.opacity <= 0.005) block.alive = false;
    }
    this.textBlocks = this.textBlocks.filter(b => b.alive);
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

          // Position: flow along dir, offset along lineDir
          const along = ci * block.charSpacing;
          const across = li * block.lineSpacing;
          const gx = block.x + Math.cos(block.dir) * along + Math.cos(block.lineDir) * across;
          const gy = block.y + Math.sin(block.dir) * along + Math.sin(block.lineDir) * across;

          if (!this._inBorder(gx, gy)) continue;

          const alpha = block.opacity * ch.visibleT;

          // Morphing: interpolate between current and target glyph
          if (ch.morphT < 1 && ch.morphT > 0) {
            // Draw current fading out
            this._drawGlyph(gx, gy, ch.glyph, block.dir, block.charSize, alpha * (1 - ch.morphT), pal);
            // Draw target fading in
            this._drawGlyph(gx, gy, ch.targetGlyph, block.dir, block.charSize, alpha * ch.morphT, pal);
          } else {
            const g = ch.morphT >= 1 ? ch.targetGlyph : ch.glyph;
            this._drawGlyph(gx, gy, g, block.dir, block.charSize, alpha, pal);
          }
        }
      }

      // Typing cursor — blinking line at current typing position
      if (block.typingLine < block.lines.length) {
        const cursorBlink = Math.sin(this.frameCount * 0.15) > 0;
        if (cursorBlink) {
          const along = block.typingChar * block.charSpacing;
          const across = block.typingLine * block.lineSpacing;
          const cx = block.x + Math.cos(block.dir) * along + Math.cos(block.lineDir) * across;
          const cy = block.y + Math.sin(block.dir) * along + Math.sin(block.lineDir) * across;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(block.dir);
          ctx.fillStyle = this._col(pal.enochian, block.opacity * 0.8);
          ctx.fillRect(0, -block.charSize * 0.1, 1.5, block.charSize * 0.8);
          ctx.restore();
        }
      }
    }
  }

  _drawGlyph(x, y, glyphIdx, angle, size, alpha, pal) {
    const glyph = ManuscriptBorder.ENOCHIAN[glyphIdx % ManuscriptBorder.ENOCHIAN.length];
    if (!glyph) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = this._col(pal.enochian, alpha);
    ctx.lineWidth = 0.7;
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
  // VINE SYSTEM
  // ═══════════════════════════════════════

  _spawnVine() {
    const b = this.opts.borderWidth;
    const side = this._pick(this.opts.sides);
    let x, y, angle;
    if (side === 'left') { x = this._range(2, b * 0.3); y = this._range(5, this.h - 5); angle = this._range(-0.6, 0.6); }
    else if (side === 'right') { x = this.w - this._range(2, b * 0.3); y = this._range(5, this.h - 5); angle = Math.PI + this._range(-0.6, 0.6); }
    else if (side === 'top') { x = this._range(5, this.w - 5); y = this._range(2, b * 0.3); angle = Math.PI / 2 + this._range(-0.6, 0.6); }
    else { x = this._range(5, this.w - 5); y = this.h - this._range(2, b * 0.3); angle = -Math.PI / 2 + this._range(-0.6, 0.6); }

    if (this._gridDensity(x, y) > 2) return;

    this.vines.push({
      x, y, angle,
      thickness: this._range(1, 3),
      maxLength: this._range(50, 250),
      traveled: 0,
      depth: 0,
      maxDepth: this._irange(3, 7),
      pts: [{ x, y }],
      alive: true,
      born: this.frameCount,
      opacity: 0,
      children: [],
      side,
      branchAngle: this._range(0.35, 0.95),
      branchRatio: this._range(0.5, 0.75),
      branchSpacing: this._irange(10, 22),
      nextBranch: this._irange(6, 16),
      curveBias: this._range(-0.07, 0.07),
      symmetry: this._rng() > 0.4,
    });
  }

  _stepVine(vine) {
    if (!vine.alive) return;
    vine.opacity = Math.min(0.85, vine.opacity + 0.025);

    const step = this.opts.growthRate;
    const periodic = Math.sin(vine.traveled * 0.07) * 0.1;
    const n = this._noise(vine.x * 0.012, vine.y * 0.012) * 0.1;
    vine.angle += vine.curveBias + periodic + n;

    const nx = vine.x + Math.cos(vine.angle) * step;
    const ny = vine.y + Math.sin(vine.angle) * step;

    if (!this._inBorder(nx, ny)) {
      const toBorder = Math.atan2(vine.pts[0].y - ny, vine.pts[0].x - nx);
      vine.angle += (toBorder - vine.angle) * 0.2;
      vine.traveled += step;
      if (vine.traveled > vine.maxLength * 0.4) vine.alive = false;
      return;
    }

    if (this._gridDensity(nx, ny) > 3.5) { vine.alive = false; return; }

    vine.x = nx; vine.y = ny;
    vine.pts.push({ x: nx, y: ny });
    vine.traveled += step;
    this._gridMark(nx, ny, 0.4);

    // L-system branching
    vine.nextBranch--;
    if (vine.nextBranch <= 0 && vine.depth < vine.maxDepth) {
      vine.nextBranch = vine.branchSpacing + this._irange(-2, 2);
      const sides = vine.symmetry ? [-1, 1] : [this._pick([-1, 1])];
      for (const s of sides) {
        this.vines.push({
          x: nx, y: ny,
          angle: vine.angle + vine.branchAngle * s,
          thickness: vine.thickness * vine.branchRatio,
          maxLength: vine.maxLength * vine.branchRatio,
          traveled: 0, depth: vine.depth + 1, maxDepth: vine.maxDepth,
          pts: [{ x: nx, y: ny }], alive: true, born: this.frameCount,
          opacity: 0, children: [], side: vine.side,
          branchAngle: vine.branchAngle * this._range(0.8, 1.15),
          branchRatio: vine.branchRatio,
          branchSpacing: vine.branchSpacing + this._irange(-2, 2),
          nextBranch: this._irange(5, 12),
          curveBias: vine.curveBias * this._range(-1.1, 1.1),
          symmetry: vine.symmetry && this._rng() > 0.35,
        });
      }
    }

    // Attachments
    const t = vine.traveled;
    if (t % 14 < step && vine.depth > 0) {
      this.drawn.push({ type: 'leaf', x: nx, y: ny,
        angle: vine.angle + this._pick([-1, 1]) * this._range(0.4, 1.3),
        size: this._range(3, 13) * (1 - vine.depth * 0.1),
        opacity: 0, maxOpacity: this._range(0.2, 0.5), born: this.frameCount });
    }
    if (t % 38 < step && vine.depth > 0 && this._rng() < 0.5) {
      this.drawn.push({ type: 'flower', x: nx, y: ny,
        size: this._range(4, 15), petals: this._irange(5, 9),
        opacity: 0, maxOpacity: this._range(0.18, 0.4), born: this.frameCount });
    }
    if (t % 24 < step && vine.depth > 1 && this._rng() < 0.4) {
      this.drawn.push({ type: 'berries', x: nx, y: ny,
        count: this._irange(3, 7), spread: this._range(3, 8),
        opacity: 0, maxOpacity: this._range(0.3, 0.55), born: this.frameCount });
    }
    if (vine.traveled >= vine.maxLength * 0.9) {
      this.drawn.push({ type: 'tendril', x: nx, y: ny,
        angle: vine.angle, turns: this._range(1.5, 3.5), size: this._range(5, 13),
        opacity: 0, maxOpacity: this._range(0.2, 0.4), born: this.frameCount });
    }
    if (vine.traveled >= vine.maxLength) vine.alive = false;
  }

  // ═══════════════════════════════════════
  // CREATURES
  // ═══════════════════════════════════════

  _maybeSpawnCreature() {
    if (this._rng() > 0.0008) return;
    const b = this.opts.borderWidth;
    const side = this._pick(this.opts.sides);
    let x, y;
    if (side === 'left') { x = this._range(12, b - 12); y = this._range(30, this.h - 30); }
    else if (side === 'right') { x = this.w - this._range(12, b - 12); y = this._range(30, this.h - 30); }
    else if (side === 'top') { x = this._range(30, this.w - 30); y = this._range(12, b - 12); }
    else { x = this._range(30, this.w - 30); y = this.h - this._range(12, b - 12); }
    this.drawn.push({
      type: this._pick(['bird', 'snail', 'serpent']),
      x, y, size: this._range(10, 20),
      angle: this._range(0, Math.PI * 2), flip: this._rng() > 0.5,
      opacity: 0, maxOpacity: this._range(0.25, 0.45), born: this.frameCount
    });
  }

  // ═══════════════════════════════════════
  // RENDERING — Vines & Elements
  // ═══════════════════════════════════════

  _renderVines() {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    for (const vine of this.vines) {
      const pts = vine.pts;
      if (pts.length < 2) continue;
      const a = vine.opacity * (vine.alive ? 1 : 0.6);
      const depthFade = vine.depth === 0 ? 0.8 : vine.depth <= 2 ? 0.55 : 0.35;
      ctx.strokeStyle = this._col(pal.vine, a * depthFade);
      ctx.lineWidth = Math.max(0.3, vine.thickness * (1 - vine.depth * 0.12));
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  }

  _renderElement(el) {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    const a = el.opacity;
    switch (el.type) {
      case 'leaf': {
        ctx.save(); ctx.translate(el.x, el.y); ctx.rotate(el.angle);
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.bezierCurveTo(el.size*0.3, -el.size*0.4, el.size*0.8, -el.size*0.3, el.size, 0);
        ctx.bezierCurveTo(el.size*0.8, el.size*0.3, el.size*0.3, el.size*0.4, 0, 0);
        ctx.fillStyle = this._col(pal.leaf, a * 0.35); ctx.fill();
        ctx.strokeStyle = this._col(pal.leaf, a * 0.65); ctx.lineWidth = 0.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(el.size*0.08, 0); ctx.lineTo(el.size*0.85, 0);
        ctx.strokeStyle = this._col(pal.leaf, a * 0.4); ctx.lineWidth = 0.3; ctx.stroke();
        for (let v = 0.25; v < 0.8; v += 0.17) {
          ctx.beginPath();
          ctx.moveTo(el.size*v, 0); ctx.lineTo(el.size*(v+0.1), -el.size*0.12);
          ctx.moveTo(el.size*v, 0); ctx.lineTo(el.size*(v+0.1), el.size*0.12);
          ctx.stroke();
        }
        ctx.restore(); break;
      }
      case 'flower': {
        ctx.save(); ctx.translate(el.x, el.y);
        for (let p = 0; p < el.petals; p++) {
          ctx.save(); ctx.rotate((p / el.petals) * Math.PI * 2);
          ctx.beginPath();
          ctx.ellipse(el.size*0.3, 0, el.size*0.3, el.size*0.12, 0, 0, Math.PI*2);
          ctx.fillStyle = this._col(pal.flower, a * 0.2); ctx.fill();
          ctx.strokeStyle = this._col(pal.flower, a * 0.45); ctx.lineWidth = 0.4; ctx.stroke();
          ctx.restore();
        }
        ctx.beginPath(); ctx.arc(0, 0, el.size*0.1, 0, Math.PI*2);
        ctx.fillStyle = this._col(pal.berry, a * 0.55); ctx.fill();
        ctx.restore(); break;
      }
      case 'berries': {
        for (let i = 0; i < el.count; i++) {
          const ba = (i / el.count) * Math.PI * 2 + el.born * 0.1;
          ctx.beginPath();
          ctx.arc(el.x + Math.cos(ba) * el.spread, el.y + Math.sin(ba) * el.spread,
            1.5 + (i % 2), 0, Math.PI * 2);
          ctx.fillStyle = this._col(pal.berry, a * 0.55); ctx.fill();
        }
        break;
      }
      case 'tendril': {
        ctx.strokeStyle = this._col(pal.tendril, a * 0.45);
        ctx.lineWidth = 0.5; ctx.beginPath();
        let tx = el.x, ty = el.y, ta = el.angle;
        ctx.moveTo(tx, ty);
        for (let i = 0; i < 25; i++) {
          const t = i / 25;
          ta += (el.turns * Math.PI * 2 / 25) * 0.15;
          const r = el.size * (1 - t * 0.75) * 0.15;
          tx += Math.cos(ta) * r; ty += Math.sin(ta) * r;
          ctx.lineTo(tx, ty);
        }
        ctx.stroke(); break;
      }
      case 'bird': {
        ctx.save(); ctx.translate(el.x, el.y); ctx.rotate(el.angle);
        if (el.flip) ctx.scale(-1, 1);
        const s = el.size;
        ctx.strokeStyle = this._col(pal.creature, a * 0.55);
        ctx.fillStyle = this._col(pal.creature, a * 0.12);
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.ellipse(0, 0, s*0.45, s*0.25, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(s*0.4, -s*0.12, s*0.14, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s*0.52,-s*0.12); ctx.lineTo(s*0.7,-s*0.08); ctx.lineTo(s*0.52,-s*0.04); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-s*0.05,-s*0.08);
        ctx.bezierCurveTo(-s*0.15,-s*0.4, s*0.15,-s*0.4, s*0.05,-s*0.08); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-s*0.4,0);
        ctx.bezierCurveTo(-s*0.6,-s*0.15,-s*0.7,s*0.05,-s*0.55,s*0.1); ctx.stroke();
        ctx.restore(); break;
      }
      case 'snail': {
        ctx.save(); ctx.translate(el.x, el.y); ctx.rotate(el.angle);
        if (el.flip) ctx.scale(-1, 1);
        const s = el.size;
        ctx.strokeStyle = this._col(pal.creature, a * 0.55);
        ctx.fillStyle = this._col(pal.creature, a * 0.1);
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.arc(0, -s*0.08, s*0.28, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        for (let sa = 0; sa < Math.PI*3.5; sa += 0.2) {
          const r = s*0.25*(1-sa/(Math.PI*4.5)); if(r<0.5)break;
          const px=Math.cos(sa)*r, py=-s*0.08+Math.sin(sa)*r;
          sa===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        }
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-s*0.25,s*0.12);
        ctx.bezierCurveTo(-s*0.05,s*0.2,s*0.25,s*0.2,s*0.4,s*0.12); ctx.stroke();
        ctx.restore(); break;
      }
      case 'serpent': {
        ctx.save(); ctx.translate(el.x, el.y); ctx.rotate(el.angle);
        if (el.flip) ctx.scale(-1, 1);
        const s = el.size;
        ctx.strokeStyle = this._col(pal.creature, a * 0.55);
        ctx.lineWidth = s*0.06; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(-s*0.5,s*0.15);
        ctx.bezierCurveTo(-s*0.25,-s*0.3,s*0.1,s*0.3,s*0.35,-s*0.08); ctx.stroke();
        ctx.lineWidth=0.7; ctx.beginPath();
        ctx.arc(s*0.35,-s*0.08,s*0.06,0,Math.PI*2);
        ctx.fillStyle=this._col(pal.creature,a*0.45); ctx.fill();
        ctx.beginPath(); ctx.moveTo(s*0.4,-s*0.08); ctx.lineTo(s*0.5,-s*0.12);
        ctx.moveTo(s*0.4,-s*0.08); ctx.lineTo(s*0.48,-s*0.03);
        ctx.lineWidth=0.4; ctx.stroke();
        ctx.restore(); break;
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

    // Seed initial vines
    for (let i = 0; i < 20; i++) this._spawnVine();
    // Seed initial text blocks
    for (let i = 0; i < 8; i++) this._spawnTextBlock();

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      // Spawn vines
      const activeVines = this.vines.filter(v => v.alive).length;
      if (activeVines < this.opts.maxVines && this.frameCount % 5 === 0) this._spawnVine();

      // Spawn text blocks periodically
      if (this.frameCount % 120 === 0 && this.textBlocks.length < 30) this._spawnTextBlock();

      // Step vines
      for (const v of this.vines) if (v.alive) this._stepVine(v);

      // Step text
      this._stepTextBlocks();

      // Fade in elements
      for (const el of this.drawn) {
        if (el.opacity < el.maxOpacity) el.opacity = Math.min(el.maxOpacity, el.opacity + 0.01);
      }

      // Creatures
      this._maybeSpawnCreature();

      // Grid decay
      if (this.frameCount % 45 === 0) this._gridDecay();

      // Element lifecycle
      const age = this.opts.cycleTime / 16;
      for (const el of this.drawn) {
        if (this.frameCount - el.born > age) el.opacity -= this.opts.fadeRate;
      }
      for (const vine of this.vines) {
        if (!vine.alive && this.frameCount - vine.born > age * 0.4) vine.opacity -= this.opts.fadeRate * 0.6;
      }

      // Cleanup
      this.drawn = this.drawn.filter(e => e.opacity > 0.005);
      this.vines = this.vines.filter(v => v.opacity > 0.005 || v.alive);

      // Render
      this.ctx.clearRect(0, 0, this.w, this.h);
      this._renderVines();
      for (const el of this.drawn) this._renderElement(el);
      this._renderTextBlocks();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return this;
  }

  stop() { this.running = false; return this; }

  resize(w, h) {
    this.canvas.width = w; this.canvas.height = h;
    this.w = w; this.h = h; this._initGrid();
  }

  // Static render
  generate() {
    this.w = this.canvas.width; this.h = this.canvas.height;
    this._initGrid();
    for (let i = 0; i < 25; i++) this._spawnVine();
    for (let i = 0; i < 10; i++) this._spawnTextBlock();
    for (let f = 0; f < 1000; f++) {
      this.frameCount++;
      const active = this.vines.filter(v => v.alive).length;
      if (active < this.opts.maxVines && f % 4 === 0) this._spawnVine();
      if (f % 80 === 0 && this.textBlocks.length < 25) this._spawnTextBlock();
      for (const v of this.vines) if (v.alive) this._stepVine(v);
      this._stepTextBlocks();
      for (const el of this.drawn) {
        if (el.opacity < el.maxOpacity) el.opacity = Math.min(el.maxOpacity, el.opacity + 0.025);
      }
      this._maybeSpawnCreature();
      if (f % 30 === 0) this._gridDecay();
    }
    this.ctx.clearRect(0, 0, this.w, this.h);
    this._renderVines();
    for (const el of this.drawn) this._renderElement(el);
    this._renderTextBlocks();
    return this;
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
