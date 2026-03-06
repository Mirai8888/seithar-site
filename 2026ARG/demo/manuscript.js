// manuscript.js — Generative Hypermedievalism Engine v11
// Illuminated manuscript vine scrollwork. Silver filigree. Luminous.
// Structured organic marginalia building in real time.

class ManuscriptBorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      seed: Math.random() * 99999 | 0,
      exclusion: null,
      growthRate: 4,
      palette: {
        vine: 'rgba(160, 158, 152, VAR)',       // silver vine stems
        vineDark: 'rgba(130, 128, 122, VAR)',    // darker stems
        leaf: 'rgba(175, 172, 166, VAR)',         // silver leaves
        leafLight: 'rgba(195, 192, 188, VAR)',   // lighter leaf fill
        tendril: 'rgba(180, 178, 172, VAR)',     // thin curling tendrils
        dot: 'rgba(150, 148, 142, VAR)',         // berry/bud dots
        frame: 'rgba(170, 168, 162, VAR)',       // frame lines
      },
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.running = false;
    this.frameCount = 0;

    this.gridSize = 5;
    this.grid = null;

    this.drawnSegs = [];       // completed
    this.activeSegs = [];      // animating
    this.growQueue = [];       // pending vine growth
    this.leaves = [];          // leaf/flower decorations to draw
    this.drawnLeaves = [];
  }

  _rng() {
    let t = this._seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  _range(a, b) { return a + this._rng() * (b - a); }
  _irange(a, b) { return (a + this._rng() * (b - a)) | 0; }
  _col(base, a) { return base.replace('VAR', Math.max(0, Math.min(1, a)).toFixed(3)); }

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
  // VINE SCROLLWORK GENERATION
  // ═══════════════════════════════════════

  // A vine is a main curving stem that produces:
  // - Branches (smaller vines, recursive)
  // - Leaves (acanthus-style at branch points)
  // - Tendrils (thin spiraling curls)
  // - Buds/berries (small dots at terminals)

  _generateVine(startX, startY, startAngle, length, depth, maxDepth) {
    if (depth > maxDepth || length < 4) return;

    // Main stem: a smooth curve via multiple short segments
    const segsCount = Math.max(2, Math.ceil(length / 6));
    const segLen = length / segsCount;
    let x = startX, y = startY, angle = startAngle;
    let prevX = x, prevY = y;

    for (let i = 0; i < segsCount; i++) {
      // Gentle curve — vine-like organic flow
      angle += this._range(-0.25, 0.25);

      const endX = x + Math.cos(angle) * segLen;
      const endY = y + Math.sin(angle) * segLen;

      if (!this._canPlace(endX, endY)) break;

      this.growQueue.push({
        type: 'vine',
        x, y, endX, endY, depth,
        lineWidth: Math.max(0.4, 2.2 - depth * 0.3),
      });

      // Mark grid
      const steps = Math.max(1, Math.ceil(segLen / this.gridSize));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        this._markCell(x + (endX - x) * t, y + (endY - y) * t);
      }

      prevX = x; prevY = y;
      x = endX; y = endY;

      // Branch points — spawn sub-vines, leaves, tendrils
      if (i > 0 && this._rng() < 0.45 && depth < maxDepth) {
        // Sub-vine branch
        const branchAngle = angle + (this._rng() > 0.5 ? 1 : -1) * this._range(0.5, 1.2);
        const branchLen = length * this._range(0.3, 0.6);
        this._generateVine(x, y, branchAngle, branchLen, depth + 1, maxDepth);
      }

      // Leaf at branch point
      if (this._rng() < 0.35) {
        const leafAngle = angle + (this._rng() > 0.5 ? 1 : -1) * this._range(0.4, 1.0);
        const leafSize = this._range(4, 12) * (1 - depth * 0.1);
        if (leafSize > 2) {
          this.leaves.push({
            x, y, angle: leafAngle, size: leafSize, depth,
            type: this._rng() < 0.7 ? 'acanthus' : 'round',
          });
        }
      }

      // Tendril
      if (this._rng() < 0.2) {
        const tAngle = angle + (this._rng() > 0.5 ? 1 : -1) * this._range(0.6, 1.4);
        this._generateTendril(x, y, tAngle, this._range(8, 20), depth);
      }

      // Berry/bud at some nodes
      if (this._rng() < 0.15) {
        const bAngle = angle + (this._rng() > 0.5 ? 1 : -1) * this._range(0.3, 0.8);
        const bx = x + Math.cos(bAngle) * this._range(3, 6);
        const by = y + Math.sin(bAngle) * this._range(3, 6);
        if (this._canPlace(bx, by)) {
          this._markCell(bx, by);
          this.growQueue.push({
            type: 'bud', x: bx, y: by, radius: this._range(1, 2.5), depth,
          });
        }
      }
    }

    // Terminal bud
    if (depth > 0) {
      this.growQueue.push({
        type: 'bud', x, y, radius: this._range(1, 2), depth,
      });
    }
  }

  _generateTendril(x, y, angle, length, depth) {
    // Spiraling thin curl
    const segs = Math.ceil(length / 3);
    let cx = x, cy = y, ca = angle;
    const curlDir = this._rng() > 0.5 ? 1 : -1;

    for (let i = 0; i < segs; i++) {
      ca += curlDir * this._range(0.15, 0.35);
      const segLen = (length / segs) * (1 - i * 0.08);
      if (segLen < 1) break;

      const ex = cx + Math.cos(ca) * segLen;
      const ey = cy + Math.sin(ca) * segLen;

      if (!this._canPlace(ex, ey)) break;
      this._markCell(ex, ey);

      this.growQueue.push({
        type: 'tendril',
        x: cx, y: cy, endX: ex, endY: ey, depth: depth + 2,
        lineWidth: Math.max(0.15, 0.6 - i * 0.05),
      });

      cx = ex; cy = ey;
    }
  }

  // ═══════════════════════════════════════
  // SEEDING
  // ═══════════════════════════════════════

  _seedVines() {
    this.growQueue = [];
    this.leaves = [];
    const sp = 20;

    // Edge vines — main stems growing inward
    for (let y = 10; y < this.h - 10; y += sp + this._range(-6, 6)) {
      this._generateVine(this._range(2, 8), y, this._range(-0.4, 0.4), this._range(40, 120), 0, this._irange(3, 6));
      this._generateVine(this.w - this._range(2, 8), y, Math.PI + this._range(-0.4, 0.4), this._range(40, 120), 0, this._irange(3, 6));
    }
    for (let x = 10; x < this.w - 10; x += sp + this._range(-6, 6)) {
      this._generateVine(x, this._range(2, 8), Math.PI/2 + this._range(-0.4, 0.4), this._range(30, 100), 0, this._irange(3, 6));
      this._generateVine(x, this.h - this._range(2, 8), -Math.PI/2 + this._range(-0.4, 0.4), this._range(30, 100), 0, this._irange(3, 6));
    }

    // Interior vines
    const count = Math.floor((this.w * this.h) / 8000);
    for (let i = 0; i < count; i++) {
      const x = this._range(this.w * 0.1, this.w * 0.9);
      const y = this._range(this.h * 0.1, this.h * 0.9);
      if (this._canPlace(x, y)) {
        this._generateVine(x, y, this._range(0, Math.PI * 2), this._range(20, 60), 1, this._irange(2, 5));
      }
    }

    // Fill gaps with small tendrils and buds
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 8; y < this.h - 8; y += 12 + this._range(-3, 3)) {
        for (let x = 8; x < this.w - 8; x += 12 + this._range(-3, 3)) {
          if (this._canPlace(x, y) && this._rng() < 0.5) {
            this._generateTendril(x, y, this._range(0, Math.PI * 2), this._range(5, 15), 2);
          }
        }
      }
    }

    // Shuffle for distributed visual growth
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

      if (job.type === 'bud') {
        this.drawnSegs.push({ ...job, progress: 1 });
        budget--;
        continue;
      }

      // vine or tendril
      this.activeSegs.push({ ...job, progress: 0 });
      budget--;
    }

    // Also queue leaves once their vine segments are drawn
    if (this.leaves.length > 0 && this.growQueue.length < 50) {
      const batch = Math.min(2, this.leaves.length);
      for (let i = 0; i < batch; i++) {
        const leaf = this.leaves.shift();
        this.drawnLeaves.push({ ...leaf, progress: 0 });
      }
    }

    // Reseed when done
    if (this.growQueue.length === 0 && this.leaves.length === 0 &&
        this.activeSegs.length === 0 &&
        this.drawnLeaves.every(l => l.progress >= 1)) {
      this._seed = (this._seed + 7) | 0;
      this.drawnSegs = [];
      this.activeSegs = [];
      this.drawnLeaves = [];
      this._initGrid();
      this._seedVines();
    }
  }

  _stepSegments() {
    const still = [];
    for (const seg of this.activeSegs) {
      seg.progress = Math.min(1, seg.progress + 0.08);
      if (seg.progress >= 1) {
        this.drawnSegs.push(seg);
      } else {
        still.push(seg);
      }
    }
    this.activeSegs = still;

    // Step leaf animations
    for (const leaf of this.drawnLeaves) {
      if (leaf.progress < 1) leaf.progress = Math.min(1, leaf.progress + 0.04);
    }
  }

  // ═══════════════════════════════════════
  // RENDERING — Silver filigree on luminous white
  // ═══════════════════════════════════════

  _drawVineSeg(seg) {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    const p = seg.progress;

    if (seg.type === 'bud') {
      ctx.fillStyle = this._col(pal.dot, 0.6);
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, seg.radius, 0, Math.PI * 2);
      ctx.fill();
      // Tiny highlight
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(seg.x - seg.radius * 0.3, seg.y - seg.radius * 0.3, seg.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const curX = seg.x + (seg.endX - seg.x) * p;
    const curY = seg.y + (seg.endY - seg.y) * p;

    const alpha = seg.type === 'tendril' ? 0.45 : (seg.depth < 2 ? 0.7 : 0.55);
    const col = seg.type === 'tendril' ? pal.tendril : (seg.depth < 1 ? pal.vineDark : pal.vine);

    ctx.strokeStyle = this._col(col, alpha);
    ctx.lineWidth = seg.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(seg.x, seg.y);
    ctx.lineTo(curX, curY);
    ctx.stroke();
  }

  _drawLeaf(leaf) {
    if (leaf.progress < 0.01) return;
    const ctx = this.ctx;
    const pal = this.opts.palette;
    const s = leaf.size * leaf.progress;
    const { x, y, angle } = leaf;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (leaf.type === 'acanthus') {
      // Acanthus leaf — elongated with lobes
      ctx.fillStyle = this._col(pal.leafLight, 0.35);
      ctx.strokeStyle = this._col(pal.leaf, 0.5);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      // Main leaf shape
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.3, -s * 0.4, s * 0.7, -s * 0.35, s, 0);
      ctx.bezierCurveTo(s * 0.7, s * 0.35, s * 0.3, s * 0.4, 0, 0);
      ctx.fill();
      ctx.stroke();
      // Center vein
      ctx.strokeStyle = this._col(pal.vine, 0.4);
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(s * 0.9, 0);
      ctx.stroke();
      // Side veins
      for (let v = 0.25; v < 0.85; v += 0.2) {
        ctx.beginPath();
        ctx.moveTo(s * v, 0);
        ctx.lineTo(s * (v + 0.1), -s * 0.15);
        ctx.moveTo(s * v, 0);
        ctx.lineTo(s * (v + 0.1), s * 0.15);
        ctx.stroke();
      }
    } else {
      // Round leaf / flower bud
      ctx.fillStyle = this._col(pal.leafLight, 0.3);
      ctx.strokeStyle = this._col(pal.leaf, 0.45);
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.arc(s * 0.5, 0, s * 0.4, 0, Math.PI * 2);
      ctx.fill();
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
    this._seedVines();

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      this._processGrowth();
      this._stepSegments();

      this.ctx.clearRect(0, 0, this.w, this.h);

      for (const seg of this.drawnSegs) this._drawVineSeg(seg);
      for (const seg of this.activeSegs) this._drawVineSeg(seg);
      for (const leaf of this.drawnLeaves) this._drawLeaf(leaf);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  stop() { this.running = false; return this; }

  resize(w, h) {
    this.canvas.width = w; this.canvas.height = h;
    this.w = w; this.h = h;
    this.drawnSegs = [];
    this.activeSegs = [];
    this.drawnLeaves = [];
    this.leaves = [];
    this._initGrid();
    this._seedVines();
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
