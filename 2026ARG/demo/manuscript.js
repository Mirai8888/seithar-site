// manuscript.js — Generative Hypermedievalism Engine v9
// Seithar Group — Algorithmic Forest
// Trees BUILD in real time. No fade-in. No swaying. Growth is the animation.

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
      nodeRadius: 1.6,
      minNodeDist: 4,
      exclusion: null,
      // Growth
      growthRate: 3,        // new segments per frame
      segmentSpeed: 0.06,   // how fast a segment draws (0→1)
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.running = false;
    this.frameCount = 0;
    this.allNodes = [];

    // Growth queue: segments waiting to be built
    this.segments = [];       // all committed segments
    this.growQueue = [];      // pending: { parent, x, y, angle, length, depth, maxDepth, treeType }
    this.activeSegs = [];     // currently drawing (progress 0→1)
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
  // SEED GROWTH POINTS
  // ═══════════════════════════════════════

  _seedTrees() {
    this.growQueue = [];
    const sp = 8;

    const seed = (x, y, angle, lenMin, lenMax, depthMin, depthMax) => {
      const treeType = this._irange(0, 5);
      this.growQueue.push({
        x, y, angle,
        length: this._range(lenMin, lenMax),
        depth: 0,
        maxDepth: this._irange(depthMin, depthMax),
        treeType,
      });
    };

    // Edge seeds — 4 layers
    for (let layer = 0; layer < 4; layer++) {
      const offset = layer * 6;
      for (let y = 3; y < this.h - 3; y += sp + this._range(-2, 2))
        seed(this._range(1, 3 + offset), y, this._range(-0.7, 0.7), 12, 70, 5, 12);
      for (let y = 3; y < this.h - 3; y += sp + this._range(-2, 2))
        seed(this.w - this._range(1, 3 + offset), y, Math.PI + this._range(-0.7, 0.7), 12, 70, 5, 12);
      for (let x = 3; x < this.w - 3; x += sp + this._range(-2, 2))
        seed(x, this._range(1, 3 + offset), Math.PI/2 + this._range(-0.7, 0.7), 10, 60, 5, 11);
      for (let x = 3; x < this.w - 3; x += sp + this._range(-2, 2))
        seed(x, this.h - this._range(1, 3 + offset), -Math.PI/2 + this._range(-0.7, 0.7), 10, 60, 5, 11);
    }

    // Interior seeds
    const count = Math.floor((this.w * this.h) / 1500);
    for (let i = 0; i < count; i++) {
      const x = this._range(this.w * 0.02, this.w * 0.98);
      const y = this._range(this.h * 0.02, this.h * 0.98);
      if (!this._inExclusion(x, y))
        seed(x, y, this._range(0, Math.PI * 2), 5, 35, 3, 8);
    }

    // Shuffle so growth comes from everywhere at once
    for (let i = this.growQueue.length - 1; i > 0; i--) {
      const j = (this._rng() * (i + 1)) | 0;
      [this.growQueue[i], this.growQueue[j]] = [this.growQueue[j], this.growQueue[i]];
    }
  }

  // ═══════════════════════════════════════
  // PROCESS GROWTH — called each frame
  // ═══════════════════════════════════════

  _processGrowth() {
    let budget = this.opts.growthRate;

    while (budget > 0 && this.growQueue.length > 0) {
      const job = this.growQueue.shift();
      const { x, y, angle, length, depth, maxDepth, treeType } = job;

      if (depth > maxDepth || length < 2.5) continue;

      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      if (endX < 1 || endX > this.w - 1 || endY < 1 || endY > this.h - 1) continue;
      if (this._inExclusion(endX, endY)) continue;
      if (!this._canPlace(endX, endY)) continue;

      this.allNodes.push({ x: endX, y: endY });

      // Create active segment (will animate drawing)
      const seg = {
        x, y, endX, endY, depth, treeType,
        progress: 0,
        isAccent: this._rng() < 0.015,
        isLeaf: true, // assume leaf until children queued
      };
      this.activeSegs.push(seg);

      // Queue children
      const nextDepth = depth + 1;
      const queueChild = (a, len) => {
        this.growQueue.push({ x: endX, y: endY, angle: a, length: len, depth: nextDepth, maxDepth, treeType });
        seg.isLeaf = false;
      };

      switch (treeType) {
        case 0: { // Standard binary
          const shrink = this._range(0.6, 0.8);
          const spread = this._range(0.3, 0.7);
          queueChild(angle - spread, length * shrink);
          queueChild(angle + spread, length * shrink);
          break;
        }
        case 1: { // Bushy
          const count = this._irange(2, 5);
          const totalSpread = this._range(0.8, 1.6);
          for (let i = 0; i < count; i++) {
            const a = angle - totalSpread/2 + (totalSpread / (count-1||1)) * i + this._range(-0.1, 0.1);
            queueChild(a, length * this._range(0.5, 0.75));
          }
          break;
        }
        case 2: { // Weeping
          const shrink = this._range(0.7, 0.9);
          const grav = 0.15;
          queueChild(angle - this._range(0.15, 0.4) + grav, length * shrink);
          queueChild(angle + this._range(0.15, 0.4) + grav, length * shrink);
          if (this._rng() < 0.3)
            queueChild(angle + grav * 2, length * shrink * 0.7);
          break;
        }
        case 3: { // Spire
          queueChild(angle + this._range(-0.08, 0.08), length * this._range(0.8, 0.95));
          if (this._rng() < 0.5) {
            const side = this._rng() > 0.5 ? 1 : -1;
            queueChild(angle + side * this._range(0.6, 1.2), length * this._range(0.25, 0.45));
          }
          break;
        }
        case 4: { // Fractal
          queueChild(angle - 0.52, length * 0.65);
          queueChild(angle + 0.52, length * 0.65);
          break;
        }
      }

      budget--;
    }

    // When queue empties and all segments done, reseed for continuous growth
    if (this.growQueue.length === 0 && this.activeSegs.every(s => s.progress >= 1)) {
      // Reset and regrow with new seed
      this._seed = (this._seed + 777) | 0;
      this.allNodes = [];
      this.segments = [];
      this.activeSegs = [];
      this._seedTrees();
    }
  }

  // Advance active segments
  _stepSegments() {
    const speed = this.opts.segmentSpeed;
    for (const seg of this.activeSegs) {
      if (seg.progress < 1) {
        seg.progress = Math.min(1, seg.progress + speed);
      }
    }
    // Move completed to permanent (keep rendering)
    const still = [];
    for (const seg of this.activeSegs) {
      if (seg.progress >= 1) {
        this.segments.push(seg);
      } else {
        still.push(seg);
      }
    }
    this.activeSegs = still;
  }

  // ═══════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════

  _drawSeg(seg) {
    const ctx = this.ctx;
    const pal = this.opts.palette;
    const r = this.opts.nodeRadius;
    const p = seg.progress;

    // Interpolate endpoint
    const curX = seg.x + (seg.endX - seg.x) * p;
    const curY = seg.y + (seg.endY - seg.y) * p;

    // Edge
    const alpha = seg.depth < 3 ? 0.7 : 0.5;
    ctx.strokeStyle = this._col(seg.depth < 3 ? pal.branch : pal.branchLight, alpha);
    ctx.lineWidth = Math.max(0.2, 1.4 - seg.depth * 0.1);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(seg.x, seg.y);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    // Node (only when fully drawn)
    if (p >= 1) {
      if (seg.isLeaf) {
        ctx.fillStyle = this._col(seg.isAccent ? pal.accent : pal.leafFill, 0.7);
        ctx.beginPath();
        ctx.arc(seg.endX, seg.endY, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (seg.depth < 4) {
        ctx.fillStyle = this._col(pal.nodeFill, 0.2);
        ctx.strokeStyle = this._col(seg.isAccent ? pal.accent : pal.node, 0.5);
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(seg.endX, seg.endY, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
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

    this._seedTrees();

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      this._processGrowth();
      this._stepSegments();

      this.ctx.clearRect(0, 0, this.w, this.h);

      // Draw all completed segments
      for (const seg of this.segments) this._drawSeg(seg);
      // Draw active (growing) segments
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
    this.allNodes = [];
    this.segments = [];
    this.activeSegs = [];
    this._seedTrees();
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
