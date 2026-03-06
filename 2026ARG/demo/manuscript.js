// manuscript.js — Generative Hypermedievalism Engine v12
// CARVED STONE. Gothic cathedral architecture. Procedural tracery.
// Pointed arches, trefoils, pinnacles, crockets, colonnettes, archivolts.
// Monochrome limestone. Relief depth via shading. Builds in real time.

class ManuscriptBorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.opts = Object.assign({
      seed: Math.random() * 99999 | 0,
      exclusion: null,
      growthRate: 3,
      // Limestone palette
      stone: {
        base: '#e8e4dc',       // warm limestone
        shadow: 'rgba(140, 135, 125, VAR)',
        deep: 'rgba(100, 96, 88, VAR)',
        line: 'rgba(120, 116, 108, VAR)',
        highlight: 'rgba(250, 248, 244, VAR)',
        accent: 'rgba(160, 155, 148, VAR)',
      },
    }, options);

    this._seed = this.opts.seed;
    this.w = canvas.width;
    this.h = canvas.height;
    this.running = false;
    this.frameCount = 0;
    this.drawQueue = [];
    this.drawn = [];
    this.active = [];
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

  _inExclusion(x, y, w, h) {
    const ex = this.opts.exclusion;
    if (!ex) return false;
    const p = ex.padding || 0;
    const ex1 = ex.x - p, ey1 = ex.y - p, ex2 = ex.x + ex.w + p, ey2 = ex.y + ex.h + p;
    return !(x + (w||0) < ex1 || x > ex2 || y + (h||0) < ey1 || y > ey2);
  }

  // ═══════════════════════════════════════
  // GOTHIC PRIMITIVES
  // ═══════════════════════════════════════

  // Pointed arch path (does not stroke — returns points for reuse)
  _pointedArchPath(cx, baseY, span, pointedness) {
    const halfSpan = span / 2;
    const r = halfSpan * pointedness;
    const leftCenter = cx + halfSpan;
    const rightCenter = cx - halfSpan;

    // Calculate apex
    const h = Math.sqrt(Math.max(0, r * r - halfSpan * halfSpan));
    const apexY = baseY - h;

    const pts = [];
    const steps = 20;

    // Left arc: from bottom-left to apex
    const startAngleL = Math.PI;
    const endAngleL = Math.PI + Math.acos(halfSpan / r);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = startAngleL + (endAngleL - startAngleL) * t;
      pts.push({ x: leftCenter + Math.cos(a) * r, y: baseY + Math.sin(a) * r });
    }

    // Right arc: from apex to bottom-right
    const startAngleR = 2 * Math.PI - Math.acos(halfSpan / r);
    const endAngleR = 2 * Math.PI;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = startAngleR + (endAngleR - startAngleR) * t;
      pts.push({ x: rightCenter + Math.cos(a) * r, y: baseY + Math.sin(a) * r });
    }

    return { pts, apexY, apexX: cx };
  }

  // Draw a pointed arch with stone relief
  _drawPointedArch(cx, baseY, span, pointedness, lineWidth, depth) {
    const ctx = this.ctx;
    const s = this.opts.stone;
    const { pts } = this._pointedArchPath(cx, baseY, span, pointedness);

    // Shadow (offset)
    ctx.strokeStyle = this._col(s.shadow, 0.3 + depth * 0.05);
    ctx.lineWidth = lineWidth + 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x + 1, p.y + 1.5) : ctx.lineTo(p.x + 1, p.y + 1.5));
    ctx.stroke();

    // Highlight (inner offset)
    ctx.strokeStyle = this._col(s.highlight, 0.5);
    ctx.lineWidth = lineWidth * 0.5;
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x - 0.5, p.y - 0.5) : ctx.lineTo(p.x - 0.5, p.y - 0.5));
    ctx.stroke();

    // Main line
    ctx.strokeStyle = this._col(s.line, 0.6 + depth * 0.05);
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
  }

  // Trefoil inside a pointed arch
  _drawTrefoil(cx, cy, radius) {
    const ctx = this.ctx;
    const s = this.opts.stone;
    const lobeR = radius * 0.52;

    // Three lobes: top, bottom-left, bottom-right
    const angles = [-Math.PI/2, -Math.PI/2 + 2.09, -Math.PI/2 + 4.19];
    const lobeOffset = radius * 0.42;

    ctx.strokeStyle = this._col(s.line, 0.5);
    ctx.lineWidth = 0.8;

    for (const a of angles) {
      const lx = cx + Math.cos(a) * lobeOffset;
      const ly = cy + Math.sin(a) * lobeOffset;

      // Lobe shadow
      ctx.fillStyle = this._col(s.shadow, 0.08);
      ctx.beginPath();
      ctx.arc(lx + 0.5, ly + 0.5, lobeR, 0, Math.PI * 2);
      ctx.fill();

      // Lobe outline
      ctx.beginPath();
      ctx.arc(lx, ly, lobeR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Quatrefoil
  _drawQuatrefoil(cx, cy, radius) {
    const ctx = this.ctx;
    const s = this.opts.stone;
    const lobeR = radius * 0.45;
    const lobeOffset = radius * 0.4;

    ctx.strokeStyle = this._col(s.line, 0.5);
    ctx.lineWidth = 0.7;

    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 4) + (Math.PI / 2) * i;
      const lx = cx + Math.cos(a) * lobeOffset;
      const ly = cy + Math.sin(a) * lobeOffset;
      ctx.beginPath();
      ctx.arc(lx, ly, lobeR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Colonnette
  _drawColonnette(x, baseY, height, width) {
    const ctx = this.ctx;
    const s = this.opts.stone;
    const capH = height * 0.06;
    const baseH = height * 0.04;
    const shaftW = width * 0.4;

    // Base moldings
    ctx.fillStyle = this._col(s.shadow, 0.15);
    ctx.fillRect(x - width/2, baseY - baseH, width, baseH);
    ctx.strokeStyle = this._col(s.line, 0.5);
    ctx.lineWidth = 0.6;
    ctx.strokeRect(x - width/2, baseY - baseH, width, baseH);

    // Shaft
    ctx.fillStyle = this._col(s.highlight, 0.3);
    ctx.fillRect(x - shaftW/2, baseY - height + capH, shaftW, height - capH - baseH);
    // Shaft shadow (right side)
    ctx.fillStyle = this._col(s.shadow, 0.12);
    ctx.fillRect(x, baseY - height + capH, shaftW/2, height - capH - baseH);
    // Shaft outline
    ctx.strokeStyle = this._col(s.line, 0.45);
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x - shaftW/2, baseY - height + capH, shaftW, height - capH - baseH);

    // Capital — flared trapezoid
    ctx.fillStyle = this._col(s.accent, 0.2);
    ctx.beginPath();
    ctx.moveTo(x - width/2, baseY - height + capH);
    ctx.lineTo(x + width/2, baseY - height + capH);
    ctx.lineTo(x + shaftW/2, baseY - height);
    ctx.lineTo(x - shaftW/2, baseY - height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Pinnacle
  _drawPinnacle(cx, baseY, width, height) {
    const ctx = this.ctx;
    const s = this.opts.stone;
    const spireH = height * 0.7;
    const baseH = height * 0.3;

    // Base block
    ctx.fillStyle = this._col(s.shadow, 0.1);
    ctx.fillRect(cx - width/2, baseY - baseH, width, baseH);
    ctx.strokeStyle = this._col(s.line, 0.45);
    ctx.lineWidth = 0.5;
    ctx.strokeRect(cx - width/2, baseY - baseH, width, baseH);

    // Spire
    const spireBase = baseY - baseH;
    ctx.fillStyle = this._col(s.shadow, 0.08);
    ctx.beginPath();
    ctx.moveTo(cx, spireBase - spireH);
    ctx.lineTo(cx + width/2, spireBase);
    ctx.lineTo(cx - width/2, spireBase);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = this._col(s.line, 0.5);
    ctx.stroke();

    // Crockets along edges
    const crocketCount = Math.max(2, Math.floor(spireH / 8));
    for (let i = 1; i < crocketCount; i++) {
      const t = i / crocketCount;
      const cy = spireBase - spireH * t;
      const halfW = (width/2) * (1 - t);
      const cr = Math.max(1, 2 - t * 1.5);

      // Left crocket
      ctx.fillStyle = this._col(s.line, 0.35);
      ctx.beginPath();
      ctx.arc(cx - halfW - cr * 0.3, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      // Right crocket
      ctx.beginPath();
      ctx.arc(cx + halfW + cr * 0.3, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Finial at top
    ctx.fillStyle = this._col(s.line, 0.4);
    ctx.beginPath();
    ctx.arc(cx, spireBase - spireH - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Canopy/Baldachin unit — the master composite element
  _drawCanopy(cx, baseY, width, height) {
    const archSpan = width * 0.85;
    const archBase = baseY;
    const archH = height * 0.45;
    const gableH = height * 0.25;
    const pinnacleH = height * 0.3;
    const pinnacleW = width * 0.12;

    // Arch
    this._drawPointedArch(cx, archBase, archSpan, 1.15, 1.2, 1);

    // Trefoil inside arch
    const { apexY } = this._pointedArchPath(cx, archBase, archSpan, 1.15);
    const trefoilCY = (archBase + apexY) * 0.5 + archH * 0.05;
    const trefoilR = archSpan * 0.28;
    this._drawTrefoil(cx, trefoilCY, trefoilR);

    // Gable above arch
    const gableBase = apexY - 2;
    const ctx2 = this.ctx;
    const s = this.opts.stone;

    ctx2.strokeStyle = this._col(s.line, 0.5);
    ctx2.lineWidth = 1;
    ctx2.beginPath();
    ctx2.moveTo(cx - archSpan/2, archBase);
    ctx2.lineTo(cx, gableBase - gableH);
    ctx2.lineTo(cx + archSpan/2, archBase);
    ctx2.stroke();

    // Crockets on gable
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 1; i < 4; i++) {
        const t = i / 4;
        const gx = cx + side * archSpan/2 * (1 - t);
        const gy = archBase - (archBase - (gableBase - gableH)) * t;
        ctx2.fillStyle = this._col(s.line, 0.3);
        ctx2.beginPath();
        ctx2.arc(gx + side * 2, gy - 1, 1.5, 0, Math.PI * 2);
        ctx2.fill();
      }
    }

    // Finial at gable apex
    ctx2.fillStyle = this._col(s.line, 0.45);
    ctx2.beginPath();
    ctx2.arc(cx, gableBase - gableH - 3, 2.2, 0, Math.PI * 2);
    ctx2.fill();

    // Pinnacles on each side
    this._drawPinnacle(cx - archSpan/2 - pinnacleW, archBase, pinnacleW, pinnacleH);
    this._drawPinnacle(cx + archSpan/2 + pinnacleW, archBase, pinnacleW, pinnacleH);

    // Colonnettes
    this._drawColonnette(cx - archSpan/2, archBase, height * 0.5, width * 0.08);
    this._drawColonnette(cx + archSpan/2, archBase, height * 0.5, width * 0.08);
  }

  // Blind arcade — repeating pointed arches
  _drawBlindArcade(startX, baseY, bayWidth, bayCount, archHeight) {
    for (let i = 0; i < bayCount; i++) {
      const cx = startX + bayWidth * (i + 0.5);
      const span = bayWidth * 0.8;

      this._drawPointedArch(cx, baseY, span, 1.2, 0.8, 2);

      // Optional trefoil in every other bay
      if (i % 2 === 0) {
        const { apexY } = this._pointedArchPath(cx, baseY, span, 1.2);
        this._drawTrefoil(cx, (baseY + apexY) / 2, span * 0.25);
      } else {
        // Quatrefoil
        const { apexY } = this._pointedArchPath(cx, baseY, span, 1.2);
        this._drawQuatrefoil(cx, (baseY + apexY) / 2, span * 0.22);
      }

      // Colonnettes between bays
      if (i < bayCount - 1) {
        this._drawColonnette(startX + bayWidth * (i + 1), baseY, archHeight * 0.7, bayWidth * 0.1);
      }
    }
  }

  // Archivolt — concentric arches with molding
  _drawArchivolt(cx, baseY, innerSpan, bandCount, bandWidth) {
    for (let i = 0; i < bandCount; i++) {
      const span = innerSpan + i * bandWidth * 2;
      const pointedness = 1.1 + i * 0.02;
      const lw = 0.6 + (bandCount - i) * 0.15;
      this._drawPointedArch(cx, baseY, span, pointedness, lw, i);
    }
  }

  // ═══════════════════════════════════════
  // COMPOSITION — Generate the border layout
  // ═══════════════════════════════════════

  _generateLayout() {
    this.drawQueue = [];
    const ex = this.opts.exclusion;
    const margin = 20;

    // Determine border zones
    const zones = [];
    if (ex) {
      // Top zone
      zones.push({ x: margin, y: margin, w: this.w - margin*2, h: ex.y - ex.padding - margin, pos: 'top' });
      // Bottom zone
      const bottomY = ex.y + ex.h + ex.padding;
      zones.push({ x: margin, y: bottomY, w: this.w - margin*2, h: this.h - bottomY - margin, pos: 'bottom' });
      // Left zone
      zones.push({ x: margin, y: margin, w: ex.x - ex.padding - margin, h: this.h - margin*2, pos: 'left' });
      // Right zone
      const rightX = ex.x + ex.w + ex.padding;
      zones.push({ x: rightX, y: margin, w: this.w - rightX - margin, h: this.h - margin*2, pos: 'right' });
    } else {
      zones.push({ x: margin, y: margin, w: this.w - margin*2, h: this.h - margin*2, pos: 'full' });
    }

    for (const zone of zones) {
      if (zone.w < 30 || zone.h < 30) continue;
      this._fillZone(zone);
    }

    // Shuffle for visual distribution
    for (let i = this.drawQueue.length - 1; i > 0; i--) {
      const j = (this._rng() * (i + 1)) | 0;
      [this.drawQueue[i], this.drawQueue[j]] = [this.drawQueue[j], this.drawQueue[i]];
    }
  }

  _fillZone(zone) {
    const { x, y, w, h, pos } = zone;

    if (pos === 'top' || pos === 'bottom') {
      // Horizontal: blind arcade + canopy row
      const bayWidth = this._range(35, 55);
      const bayCount = Math.floor(w / bayWidth);
      if (bayCount > 0) {
        const baseY = pos === 'top' ? y + h : y + h * 0.6;
        this.drawQueue.push({ type: 'arcade', x, baseY, bayWidth, bayCount, h: h * 0.5 });

        // Canopy row above/below
        const canopyH = Math.min(h * 0.45, 80);
        const canopyW = bayWidth * 1.2;
        const canopyCount = Math.floor(w / canopyW);
        const canopyY = pos === 'top' ? y + h * 0.55 : y + h * 0.35;
        for (let i = 0; i < canopyCount; i++) {
          this.drawQueue.push({
            type: 'canopy',
            cx: x + canopyW * (i + 0.5),
            baseY: canopyY,
            w: canopyW, h: canopyH,
          });
        }

        // Archivolt if space
        if (h > 60) {
          const archCx = x + w / 2;
          const archBase = pos === 'top' ? y + h - 5 : y + 5 + h * 0.8;
          this.drawQueue.push({ type: 'archivolt', cx: archCx, baseY: archBase, innerSpan: w * 0.3, bandCount: this._irange(3, 6), bandWidth: this._range(8, 14) });
        }
      }
    } else {
      // Vertical: stack canopies, arcades, pinnacles
      const unitH = this._range(60, 100);
      const units = Math.floor(h / unitH);

      for (let i = 0; i < units; i++) {
        const uy = y + unitH * i;
        const ucx = x + w / 2;

        // Alternate between canopy and arcade
        if (i % 3 === 0) {
          this.drawQueue.push({ type: 'canopy', cx: ucx, baseY: uy + unitH * 0.7, w: w * 0.9, h: unitH * 0.6 });
        } else if (i % 3 === 1) {
          const bays = Math.max(1, Math.floor(w / 30));
          this.drawQueue.push({ type: 'arcade', x, baseY: uy + unitH * 0.8, bayWidth: w / bays, bayCount: bays, h: unitH * 0.5 });
        } else {
          // Pinnacles + archivolts
          const pinCount = Math.max(2, Math.floor(w / 20));
          for (let p = 0; p < pinCount; p++) {
            this.drawQueue.push({
              type: 'pinnacle',
              cx: x + (w / (pinCount + 1)) * (p + 1),
              baseY: uy + unitH * 0.75,
              w: w * 0.08,
              h: unitH * 0.4,
            });
          }
          this.drawQueue.push({ type: 'archivolt', cx: ucx, baseY: uy + unitH * 0.8, innerSpan: w * 0.4, bandCount: this._irange(2, 4), bandWidth: this._range(6, 10) });
        }
      }

      // Fill remaining with small tracery
      for (let fy = y + 10; fy < y + h - 10; fy += this._range(18, 30)) {
        for (let fx = x + 8; fx < x + w - 8; fx += this._range(18, 30)) {
          if (this._rng() < 0.4) {
            const r = this._range(4, 10);
            this.drawQueue.push(this._rng() < 0.5
              ? { type: 'trefoil', cx: fx, cy: fy, r }
              : { type: 'quatrefoil', cx: fx, cy: fy, r });
          }
        }
      }
    }
  }

  // ═══════════════════════════════════════
  // GROWTH — Draw elements one at a time
  // ═══════════════════════════════════════

  _processGrowth() {
    let budget = this.opts.growthRate;
    while (budget > 0 && this.drawQueue.length > 0) {
      const job = this.drawQueue.shift();
      this.active.push({ ...job, progress: 0 });
      budget--;
    }

    // Reseed when done
    if (this.drawQueue.length === 0 && this.active.length === 0) {
      this._seed = (this._seed + 31) | 0;
      this.drawn = [];
      this._generateLayout();
    }
  }

  _stepActive() {
    const still = [];
    for (const item of this.active) {
      item.progress = Math.min(1, item.progress + 0.06);
      if (item.progress >= 1) {
        this.drawn.push(item);
      } else {
        still.push(item);
      }
    }
    this.active = still;
  }

  _renderItem(item) {
    const ctx = this.ctx;
    ctx.globalAlpha = Math.min(1, item.progress * 1.5);

    switch (item.type) {
      case 'canopy':
        this._drawCanopy(item.cx, item.baseY, item.w, item.h);
        break;
      case 'arcade':
        this._drawBlindArcade(item.x, item.baseY, item.bayWidth, item.bayCount, item.h);
        break;
      case 'archivolt':
        this._drawArchivolt(item.cx, item.baseY, item.innerSpan, item.bandCount, item.bandWidth);
        break;
      case 'pinnacle':
        this._drawPinnacle(item.cx, item.baseY, item.w, item.h);
        break;
      case 'trefoil':
        this._drawTrefoil(item.cx, item.cy, item.r);
        break;
      case 'quatrefoil':
        this._drawQuatrefoil(item.cx, item.cy, item.r);
        break;
    }

    ctx.globalAlpha = 1;
  }

  // ═══════════════════════════════════════
  // MAIN LOOP
  // ═══════════════════════════════════════

  start() {
    if (this.running) return this;
    this.running = true;
    this.w = this.canvas.width;
    this.h = this.canvas.height;

    this._generateLayout();

    const loop = () => {
      if (!this.running) return;
      this.frameCount++;

      this._processGrowth();
      this._stepActive();

      this.ctx.clearRect(0, 0, this.w, this.h);

      for (const item of this.drawn) this._renderItem(item);
      for (const item of this.active) this._renderItem(item);

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  stop() { this.running = false; return this; }

  resize(w, h) {
    this.canvas.width = w; this.canvas.height = h;
    this.w = w; this.h = h;
    this.drawn = [];
    this.active = [];
    this._generateLayout();
  }
}

if (typeof window !== 'undefined') window.ManuscriptBorder = ManuscriptBorder;
if (typeof module !== 'undefined') module.exports = ManuscriptBorder;
