// manuscript.js — Generative Hypermedievalism Engine v10
// Horror Vacui L-system marginalia. Intaglio etching. Ink on parchment.
// Real L-system grammars. Dendritic growth. Every pixel filled.

class ManuscriptBorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      seed: Math.random() * 99999 | 0,
      exclusion: null,
      growthRate: 6,
      segmentSpeed: 0.08,
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.running = false;
    this.frameCount = 0;

    // Spatial grid for density checking
    this.gridSize = 3;
    this.grid = null;

    this.segments = [];
    this.activeSegs = [];
    this.growQueue = [];
  }

  _rng() {
    let t = this._seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  _range(a, b) { return a + this._rng() * (b - a); }
  _irange(a, b) { return (a + this._rng() * (b - a)) | 0; }

  // Spatial hash for fast density queries
  _initGrid() {
    const gs = this.gridSize;
    this.gridW = Math.ceil(this.w / gs);
    this.gridH = Math.ceil(this.h / gs);
    this.grid = new Uint8Array(this.gridW * this.gridH);
  }

  _markCell(x, y) {
    const gs = this.gridSize;
    const gx = (x / gs) | 0;
    const gy = (y / gs) | 0;
    if (gx >= 0 && gx < this.gridW && gy >= 0 && gy < this.gridH) {
      const idx = gy * this.gridW + gx;
      if (this.grid[idx] < 255) this.grid[idx]++;
    }
  }

  _getDensity(x, y) {
    const gs = this.gridSize;
    const gx = (x / gs) | 0;
    const gy = (y / gs) | 0;
    if (gx < 0 || gx >= this.gridW || gy < 0 || gy >= this.gridH) return 99;
    return this.grid[gy * this.gridW + gx];
  }

  _canPlace(x, y) {
    if (x < 1 || x > this.w - 1 || y < 1 || y > this.h - 1) return false;
    const ex = this.opts.exclusion;
    if (ex) {
      const p = ex.padding || 0;
      if (x > ex.x - p && x < ex.x + ex.w + p && y > ex.y - p && y < ex.y + ex.h + p) return false;
    }
    return this._getDensity(x, y) < 2;
  }

  // ═══════════════════════════════════════
  // L-SYSTEM GRAMMARS
  // ═══════════════════════════════════════

  // Each grammar: { axiom, rules, angle, iterations, lengthScale }
  static GRAMMARS = [
    // 0: Classic plant
    { axiom: 'X', rules: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' }, angle: 25, iterations: 5, lengthScale: 0.5 },
    // 1: Bush
    { axiom: 'F', rules: { F: 'FF+[+F-F-F]-[-F+F+F]' }, angle: 22, iterations: 4, lengthScale: 0.5 },
    // 2: Fern
    { axiom: 'X', rules: { X: 'F-[[X]+X]+F[+FX]-X', F: 'FF' }, angle: 22, iterations: 5, lengthScale: 0.45 },
    // 3: Weed
    { axiom: 'F', rules: { F: 'F[+F]F[-F]F' }, angle: 25.7, iterations: 4, lengthScale: 0.35 },
    // 4: Stochastic tree
    { axiom: 'F', rules: { F: 'F[+F][-F]' }, angle: 30, iterations: 6, lengthScale: 0.55 },
    // 5: Dendritic / coral
    { axiom: 'X', rules: { X: 'F[+X][-X]FX', F: 'FF' }, angle: 28, iterations: 5, lengthScale: 0.42 },
    // 6: Skeletal
    { axiom: 'X', rules: { X: 'F[-X][+X]', F: 'FF' }, angle: 35, iterations: 6, lengthScale: 0.48 },
    // 7: Dense fractal
    { axiom: 'X', rules: { X: 'F+[X+F]-[X-F]', F: 'FF' }, angle: 20, iterations: 5, lengthScale: 0.5 },
  ];

  // Expand L-system string
  _expandLSystem(grammar, stochastic) {
    let str = grammar.axiom;
    for (let i = 0; i < grammar.iterations; i++) {
      let next = '';
      for (const ch of str) {
        if (grammar.rules[ch]) {
          // Stochastic variation
          if (stochastic && this._rng() < 0.15) {
            // Occasionally skip or modify
            next += this._rng() < 0.5 ? grammar.rules[ch] : ch;
          } else {
            next += grammar.rules[ch];
          }
        } else {
          next += ch;
        }
      }
      str = next;
      if (str.length > 5000) break; // safety
    }
    return str;
  }

  // Convert L-system string into growth queue entries
  _lsystemToSegments(str, startX, startY, startAngle, baseLength, grammar) {
    const angleRad = grammar.angle * Math.PI / 180;
    const entries = [];
    const stack = [];
    let x = startX, y = startY, a = startAngle, len = baseLength;
    let depth = 0;

    for (const ch of str) {
      switch (ch) {
        case 'F': {
          const endX = x + Math.cos(a) * len;
          const endY = y + Math.sin(a) * len;
          entries.push({ x, y, endX, endY, depth, len });
          x = endX;
          y = endY;
          break;
        }
        case '+':
          a += angleRad + this._range(-0.05, 0.05);
          break;
        case '-':
          a -= angleRad + this._range(-0.05, 0.05);
          break;
        case '[':
          stack.push({ x, y, a, len, depth });
          depth++;
          len *= grammar.lengthScale + this._range(-0.05, 0.05);
          break;
        case ']':
          if (stack.length) {
            const s = stack.pop();
            x = s.x; y = s.y; a = s.a; len = s.len; depth = s.depth;
          }
          break;
        // X is just a placeholder, no drawing
      }
    }

    return entries;
  }

  // ═══════════════════════════════════════
  // SEED GROWTH
  // ═══════════════════════════════════════

  _seedTrees() {
    this.growQueue = [];
    const grammars = ManuscriptBorder.GRAMMARS;

    const seed = (x, y, angle, baseLen) => {
      const g = grammars[this._irange(0, grammars.length)];
      const str = this._expandLSystem(g, true);
      const segs = this._lsystemToSegments(str, x, y, angle, baseLen, g);
      // Filter and enqueue
      for (const s of segs) {
        this.growQueue.push(s);
      }
    };

    // Dense edge seeding
    const sp = 6;
    for (let y = 2; y < this.h - 2; y += sp + this._range(-2, 2)) {
      seed(this._range(0, 3), y, this._range(-0.5, 0.5), this._range(3, 8));
      seed(this.w - this._range(0, 3), y, Math.PI + this._range(-0.5, 0.5), this._range(3, 8));
    }
    for (let x = 2; x < this.w - 2; x += sp + this._range(-2, 2)) {
      seed(x, this._range(0, 3), Math.PI/2 + this._range(-0.5, 0.5), this._range(3, 7));
      seed(x, this.h - this._range(0, 3), -Math.PI/2 + this._range(-0.5, 0.5), this._range(3, 7));
    }

    // Interior seeds — scattered
    const count = Math.floor((this.w * this.h) / 3000);
    for (let i = 0; i < count; i++) {
      const x = this._range(this.w * 0.05, this.w * 0.95);
      const y = this._range(this.h * 0.05, this.h * 0.95);
      seed(x, y, this._range(0, Math.PI * 2), this._range(2, 5));
    }

    // Shuffle for even visual distribution
    for (let i = this.growQueue.length - 1; i > 0; i--) {
      const j = (this._rng() * (i + 1)) | 0;
      [this.growQueue[i], this.growQueue[j]] = [this.growQueue[j], this.growQueue[i]];
    }
  }

  // ═══════════════════════════════════════
  // GROWTH PROCESSING
  // ═══════════════════════════════════════

  _processGrowth() {
    let budget = this.opts.growthRate;

    while (budget > 0 && this.growQueue.length > 0) {
      const job = this.growQueue.shift();
      const { x, y, endX, endY, depth, len } = job;

      if (!this._canPlace(endX, endY)) continue;

      // Mark spatial grid along the segment
      const steps = Math.max(1, Math.ceil(len / this.gridSize));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        this._markCell(x + (endX - x) * t, y + (endY - y) * t);
      }

      this.activeSegs.push({
        x, y, endX, endY, depth,
        progress: 0,
        lineWidth: Math.max(0.15, 1.2 - depth * 0.08),
      });

      budget--;
    }

    // Continuous: when queue empties, reseed
    if (this.growQueue.length === 0 && this.activeSegs.every(s => s.progress >= 1)) {
      this._seed = (this._seed + 13) | 0;
      this.segments = [];
      this.activeSegs = [];
      this._initGrid();
      this._seedTrees();
    }
  }

  _stepSegments() {
    const speed = this.opts.segmentSpeed;
    const done = [];
    const still = [];
    for (const seg of this.activeSegs) {
      if (seg.progress < 1) {
        seg.progress = Math.min(1, seg.progress + speed);
        if (seg.progress >= 1) done.push(seg); else still.push(seg);
      } else {
        done.push(seg);
      }
    }
    this.segments.push(...done);
    this.activeSegs = still;
  }

  // ═══════════════════════════════════════
  // RENDERING — Intaglio etching aesthetic
  // ═══════════════════════════════════════

  _drawSeg(seg) {
    const ctx = this.ctx;
    const p = seg.progress;
    const curX = seg.x + (seg.endX - seg.x) * p;
    const curY = seg.y + (seg.endY - seg.y) * p;

    // Primary stroke — ink black
    const alpha = seg.depth < 2 ? 0.85 : seg.depth < 5 ? 0.65 : 0.45;
    ctx.strokeStyle = `rgba(20, 18, 15, ${alpha})`;
    ctx.lineWidth = seg.lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(seg.x, seg.y);
    ctx.lineTo(curX, curY);
    ctx.stroke();
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
    this._seedTrees();

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      this._processGrowth();
      this._stepSegments();

      this.ctx.clearRect(0, 0, this.w, this.h);

      for (const seg of this.segments) this._drawSeg(seg);
      for (const seg of this.activeSegs) this._drawSeg(seg);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  stop() { this.running = false; return this; }

  resize(w, h) {
    this.canvas.width = w; this.canvas.height = h;
    this.w = w; this.h = h;
    this.segments = [];
    this.activeSegs = [];
    this._initGrid();
    this._seedTrees();
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
