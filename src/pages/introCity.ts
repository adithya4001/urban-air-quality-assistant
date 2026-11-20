/**
 * Canvas artwork adapted from the supplied VaayuDootha intro.
 * All scene state and browser subscriptions belong to the mounted splash.
 */
export function startIntroCity(
  canvas: HTMLCanvasElement,
  letters: readonly HTMLElement[],
  timing: { gatherAt: number; titleReadyAt: number },
): () => void {
  const drawingContext = canvas.getContext('2d');
  if (!drawingContext || typeof drawingContext.roundRect !== 'function') return () => {};
  const ctx: CanvasRenderingContext2D = drawingContext;
  let W = 1;
  let H = 1;
  let airStreams: WinterBreeze[] = [];
  let smokeParticles: SmokeWisp[] = [];
  let vehicles: PerspectiveVehicle[] = [];
  let smokeCoalesceActive = false;
  let titleRevealed = false;
  let letterTargets: Array<{ x: number; y: number }> = [];

  function updateLetterTargets() {
    const bounds = canvas.getBoundingClientRect();
    letterTargets = letters.map((letter) => {
      const rect = letter.getBoundingClientRect();
      return { x: rect.left + rect.width / 2 - bounds.left, y: rect.top + rect.height / 2 - bounds.top };
    });
  }

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    W = canvas.width = Math.max(1, Math.round(bounds.width));
    H = canvas.height = Math.max(1, Math.round(bounds.height));
    updateLetterTargets();
  }

  // Subtle Winter Air Current Wisps
  class WinterBreeze {
    x = 0;
    y = 0;
    len = 0;
    speed = 0;
    alpha = 0;

    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x = init ? Math.random() * W : -90;
      this.y = Math.random() * H * 0.5;
      this.len = Math.random() * 75 + 35;
      this.speed = Math.random() * 1.1 + 0.55;
      this.alpha = Math.random() * 0.14 + 0.04;
    }
    update() {
      this.x += this.speed;
      this.y += Math.sin(this.x * 0.008) * 0.14;
      if (this.x > W + 100) this.reset();
    }
    draw() {
      const grad = ctx.createLinearGradient(this.x - this.len, this.y, this.x, this.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${this.alpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(this.x - this.len, this.y);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    }
  }

  // Photorealistic Perspective Highway Vehicle (Only vehicles move; road lines stay fixed)
  class PerspectiveVehicle {
    z: number;
    private readonly paint;
    private readonly isSUV;
    private readonly speed;
    private exhaustTick;

    constructor(private readonly side: 'left' | 'right', private readonly lane: number, initialZ: number) {
      this.z = initialZ;
      const palettes = [
        { base: '#cbd5e1', top: '#f8fafc', dark: '#64748b' }, // Silver Metallic
        { base: '#0f172a', top: '#334155', dark: '#020617' }, // Obsidian Black
        { base: '#991b1b', top: '#ef4444', dark: '#450a0a' }, // Crimson Metallic
        { base: '#1e3a8a', top: '#3b82f6', dark: '#172554' }, // Midnight Blue
        { base: '#e2e8f0', top: '#ffffff', dark: '#94a3b8' }, // Pearl White
        { base: '#374151', top: '#6b7280', dark: '#111827' }  // Graphite Grey
      ];
      this.paint = palettes[Math.floor(Math.random() * palettes.length)];
      this.isSUV = Math.random() > 0.58;
      this.speed = 0.0028 + Math.random() * 0.0012;
      this.exhaustTick = Math.floor(Math.random() * 14);
    }
    update() {
      if (this.side === 'left') {
        this.z += this.speed * (0.32 + this.z * 1.4);
        if (this.z > 1.08) this.z = 0.025;
      } else {
        this.z -= this.speed * (0.32 + this.z * 1.4);
        if (this.z < 0.025) this.z = 1.06;
      }
    }
    getScreenPos(vpX: number, vpY: number, roadHalfBottom: number) {
      const p = Math.pow(this.z, 1.38);
      const y = vpY + (H - vpY) * p;
      const roadHalfAtY = 7 + roadHalfBottom * p;
      const laneOffset = this.lane === 0 ? 0.34 : 0.68;
      const dirSign = this.side === 'left' ? -1 : 1;
      const x = vpX + dirSign * roadHalfAtY * laneOffset;
      const scale = 0.13 + p * 1.22;
      return { x, y, scale, p };
    }
    draw(vpX: number, vpY: number, roadHalfBottom: number) {
      const { x, y, scale } = this.getScreenPos(vpX, vpY, roadHalfBottom);
      const w = (this.isSUV ? 52 : 48) * scale;
      const h = (this.isSUV ? 30 : 24) * scale;

      // Emit subtle exhaust air
      this.exhaustTick++;
      if (this.exhaustTick % 10 === 0 && smokeParticles.length < 280 && scale > 0.24) {
        smokeParticles.push(new SmokeWisp(x + (this.side === 'left' ? -w * 0.25 : w * 0.25), y - h * 0.12, false));
      }

      ctx.save();
      ctx.translate(x, y);

      // 1. Soft Ambient Occlusion Contact Shadow on Asphalt
      const shadowGrad = ctx.createRadialGradient(0, 2 * scale, w * 0.1, 0, 2 * scale, w * 0.65);
      shadowGrad.addColorStop(0, 'rgba(2, 6, 23, 0.72)');
      shadowGrad.addColorStop(0.65, 'rgba(2, 6, 23, 0.35)');
      shadowGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 2 * scale, w * 0.65, 7 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Tires with Wheel Wells
      ctx.fillStyle = '#090d14';
      ctx.beginPath();
      ctx.roundRect(-w * 0.45, -h * 0.28, w * 0.17, h * 0.3, 2 * scale);
      ctx.roundRect(w * 0.28, -h * 0.28, w * 0.17, h * 0.3, 2 * scale);
      ctx.fill();

      // 3. Side Mirrors
      ctx.fillStyle = this.paint.base;
      ctx.beginPath();
      ctx.roundRect(-w * 0.54, -h * 0.66, w * 0.09, h * 0.12, 2 * scale);
      ctx.roundRect(w * 0.45, -h * 0.66, w * 0.09, h * 0.12, 2 * scale);
      ctx.fill();

      // 4. Sculpted Metallic Lower Chassis
      const bodyGrad = ctx.createLinearGradient(0, -h * 0.72, 0, -h * 0.14);
      bodyGrad.addColorStop(0, this.paint.top);
      bodyGrad.addColorStop(0.45, this.paint.base);
      bodyGrad.addColorStop(1, this.paint.dark);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(-w * 0.49, -h * 0.68, w * 0.98, h * 0.54, 5 * scale);
      ctx.fill();

      // 5. Cabin & Greenhouse Roof
      const roofGrad = ctx.createLinearGradient(0, -h * 1.08, 0, -h * 0.65);
      roofGrad.addColorStop(0, this.paint.top);
      roofGrad.addColorStop(1, this.paint.base);
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(-w * 0.34, -h * 1.06);
      ctx.lineTo(w * 0.34, -h * 1.06);
      ctx.lineTo(w * 0.43, -h * 0.66);
      ctx.lineTo(-w * 0.43, -h * 0.66);
      ctx.closePath();
      ctx.fill();

      // 6. Tinted Glass Windshield / Rear Window with Sky Reflection
      const glassGrad = ctx.createLinearGradient(-w * 0.3, -h * 1.02, w * 0.3, -h * 0.68);
      if (this.side === 'left') {
        glassGrad.addColorStop(0, '#93c5fd');
        glassGrad.addColorStop(0.45, '#1e293b');
        glassGrad.addColorStop(1, '#0f172a');
      } else {
        glassGrad.addColorStop(0, '#334155');
        glassGrad.addColorStop(0.5, '#0f172a');
        glassGrad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, -h * 1.0);
      ctx.lineTo(w * 0.3, -h * 1.0);
      ctx.lineTo(w * 0.37, -h * 0.69);
      ctx.lineTo(-w * 0.37, -h * 0.69);
      ctx.closePath();
      ctx.fill();

      // 7. Grille, License Plate & Realistic Lights
      if (this.side === 'left') {
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.roundRect(-w * 0.18, -h * 0.46, w * 0.36, h * 0.18, 2 * scale);
        ctx.fill();

        ctx.fillStyle = '#fefce8';
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 10 * scale;
        ctx.beginPath();
        ctx.roundRect(-w * 0.45, -h * 0.48, w * 0.18, h * 0.11, 2 * scale);
        ctx.roundRect(w * 0.27, -h * 0.48, w * 0.18, h * 0.11, 2 * scale);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 9 * scale;
        ctx.beginPath();
        ctx.roundRect(-w * 0.45, -h * 0.5, w * 0.19, h * 0.12, 2 * scale);
        ctx.roundRect(w * 0.26, -h * 0.5, w * 0.19, h * 0.12, 2 * scale);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }
  }

  // Photorealistic Polluted Air Plumes (Coalesce into letters, then continue drifting lightly)
  class SmokeWisp {
    private x: number;
    y: number;
    alpha: number;
    private size: number;
    private readonly maxSize: number;
    private readonly vx: number;
    private readonly vy: number;
    private readonly targetIdx: number;
    private readonly assignedToLetter: boolean;

    constructor(x: number, y: number, isFactory = false) {
      this.x = x + (Math.random() - 0.5) * 14;
      this.y = y;
      this.size = isFactory ? Math.random() * 14 + 9 : Math.random() * 6 + 4;
      this.maxSize = isFactory ? Math.random() * 42 + 28 : Math.random() * 22 + 12;
      this.vx = (Math.random() - 0.42) * 0.55;
      this.vy = -(Math.random() * 0.75 + 0.48);
      this.alpha = isFactory ? 0.28 : 0.18;
      this.targetIdx = Math.floor(Math.random() * letters.length);
      this.assignedToLetter = Math.random() < 0.65;
    }
    update() {
      if (smokeCoalesceActive && !titleRevealed && this.assignedToLetter && letterTargets[this.targetIdx]) {
        const target = letterTargets[this.targetIdx];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
          this.x += dx * 0.042 + Math.sin(this.y * 0.03) * 1.1;
          this.y += dy * 0.042;
          this.alpha = Math.min(0.32, this.alpha + 0.003);
        } else {
          this.alpha -= 0.022;
        }
      } else {
        this.x += this.vx + Math.sin(this.y * 0.02) * 0.35 + (titleRevealed ? 0.25 : 0);
        this.y += this.vy;
        if (this.size < this.maxSize) this.size += 0.16;
        this.alpha -= titleRevealed ? 0.0012 : 0.0015;
      }
    }
    draw() {
      if (this.alpha <= 0) return;
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      grad.addColorStop(0, `rgba(71, 85, 105, ${this.alpha})`);
      grad.addColorStop(0.5, `rgba(148, 163, 184, ${this.alpha * 0.55})`);
      grad.addColorStop(1, 'rgba(203, 213, 225, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Helper: Photorealistic Multi-Puff Volumetric Cloud
  function drawRealisticCloud(cx: number, cy: number, scale: number) {
    const puffs = [
      { dx: 0, dy: 0, r: 34 },
      { dx: -28, dy: 8, r: 24 },
      { dx: 30, dy: 7, r: 26 },
      { dx: -12, dy: -12, r: 26 },
      { dx: 16, dy: -10, r: 25 },
      { dx: 52, dy: 12, r: 18 },
      { dx: -48, dy: 13, r: 17 }
    ];
    puffs.forEach(p => {
      const px = cx + p.dx * scale;
      const py = cy + p.dy * scale;
      const pr = p.r * scale;
      const g = ctx.createRadialGradient(px, py - pr * 0.25, pr * 0.1, px, py, pr);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      g.addColorStop(0.65, 'rgba(241, 245, 249, 0.45)');
      g.addColorStop(1, 'rgba(226, 232, 240, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Helper: Photorealistic Architectural Glass & Concrete Building
  function drawRealisticBuilding(bx: number, by: number, bw: number, bh: number, isLeft: boolean, seed: number) {
    const sideWidth = bw * 0.22;
    const frontWidth = bw - sideWidth;
    const frontX = isLeft ? bx : bx + sideWidth;
    const sideX = isLeft ? bx + frontWidth : bx;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
    ctx.fillRect(bx - 4, by + bh - 3, bw + 8, 6);

    const frontGrad = ctx.createLinearGradient(frontX, by, frontX, by + bh);
    frontGrad.addColorStop(0, seed % 2 === 0 ? '#64748b' : '#475569');
    frontGrad.addColorStop(1, '#334155');
    ctx.fillStyle = frontGrad;
    ctx.fillRect(frontX, by, frontWidth, bh);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(sideX, by + 4, sideWidth, bh - 4);

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(frontX - 1, by - 3, frontWidth + 2, 4);
    ctx.fillStyle = '#475569';
    ctx.fillRect(frontX + frontWidth * 0.2, by - 10, frontWidth * 0.24, 7);
    ctx.fillRect(frontX + frontWidth * 0.62, by - 8, frontWidth * 0.16, 5);

    const cols = 4;
    const rows = Math.max(4, Math.floor(bh / 22));
    const padX = frontWidth * 0.1;
    const padY = bh * 0.08;
    const cellW = (frontWidth - padX * 2) / cols;
    const cellH = (bh - padY * 1.6) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = frontX + padX + c * cellW + cellW * 0.12;
        const wy = by + padY + r * cellH + cellH * 0.15;
        const ww = cellW * 0.76;
        const wh = cellH * 0.68;

        const isWarmLit = ((r * 7 + c * 3 + seed) % 5 === 0);
        const winGrad = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
        if (isWarmLit) {
          winGrad.addColorStop(0, '#fef3c7');
          winGrad.addColorStop(1, '#f59e0b');
        } else {
          winGrad.addColorStop(0, '#bae6fd');
          winGrad.addColorStop(0.5, '#38bdf8');
          winGrad.addColorStop(1, '#0f172a');
        }
        ctx.fillStyle = winGrad;
        ctx.fillRect(wx, wy, ww, wh);
      }
    }
  }

  // Helper: Photorealistic Industrial Factory with Brick/Steel Smokestacks
  function drawRealisticFactory(fx: number, fy: number, fw: number, fh: number, isLeft: boolean, tick: number) {
    const wallGrad = ctx.createLinearGradient(fx, fy, fx, fy + fh);
    wallGrad.addColorStop(0, '#475569');
    wallGrad.addColorStop(0.5, '#334155');
    wallGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = wallGrad;

    ctx.beginPath();
    ctx.moveTo(fx, fy + fh);
    ctx.lineTo(fx, fy + 24);
    ctx.lineTo(fx + fw * 0.34, fy + 8);
    ctx.lineTo(fx + fw * 0.34, fy + 24);
    ctx.lineTo(fx + fw * 0.68, fy + 8);
    ctx.lineTo(fx + fw * 0.68, fy + 24);
    ctx.lineTo(fx + fw, fy + 8);
    ctx.lineTo(fx + fw, fy + fh);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.lineWidth = 1;
    for (let x = fx + 8; x < fx + fw; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, fy + 22);
      ctx.lineTo(x, fy + fh);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(253, 224, 71, 0.45)';
    ctx.fillRect(fx + fw * 0.1, fy + fh * 0.45, fw * 0.8, 8);

    const drawStack = (sx: number, sy: number, sw: number, sh: number) => {
      const sGrad = ctx.createLinearGradient(sx, sy, sx + sw, sy);
      sGrad.addColorStop(0, '#64748b');
      sGrad.addColorStop(0.35, '#94a3b8');
      sGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = sGrad;
      ctx.fillRect(sx, sy, sw, sh);

      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(sx, sy + 6, sw, 5);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(sx, sy + 11, sw, 4);
    };

    const c1X = isLeft ? fx + fw * 0.22 : fx + fw * 0.3;
    const c2X = isLeft ? fx + fw * 0.58 : fx + fw * 0.66;
    drawStack(c1X, fy - 42, 13, 56);
    drawStack(c2X, fy - 54, 15, 68);

    if (tick % 8 === 0 && smokeParticles.length < 280) {
      smokeParticles.push(new SmokeWisp(c1X + 6.5, fy - 44, true));
      smokeParticles.push(new SmokeWisp(c2X + 7.5, fy - 56, true));
    }
  }

  function initSceneEntities() {
    airStreams = [];
    vehicles = [];
    for (let i = 0; i < 36; i++) airStreams.push(new WinterBreeze());

    for (let i = 0; i < 6; i++) {
      vehicles.push(new PerspectiveVehicle('left', i % 2, 0.08 + i * 0.16));
      vehicles.push(new PerspectiveVehicle('right', i % 2, 0.12 + i * 0.16));
    }
  }


  let tick = 0;
  function renderPerspectiveWorld() {
    ctx.clearRect(0, 0, W, H);
    tick++;

    const vpX = W * 0.5;
    const vpY = H * 0.52;
    const roadHalfBottom = W * 0.38;

    // 1. Photorealistic Winter Morning Atmospheric Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, vpY);
    skyGrad.addColorStop(0, '#1e3a5f');
    skyGrad.addColorStop(0.42, '#4a7c9b');
    skyGrad.addColorStop(0.78, '#bae6fd');
    skyGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, vpY + 4);

    // 2. Normal Feel-Good Winter Sunrise with Atmospheric Scattering
    const sunX = W * 0.5;
    const sunY = vpY * 0.32;
    const haloGrad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 220);
    haloGrad.addColorStop(0, 'rgba(255, 251, 235, 0.92)');
    haloGrad.addColorStop(0.22, 'rgba(254, 240, 138, 0.45)');
    haloGrad.addColorStop(0.55, 'rgba(253, 186, 116, 0.16)');
    haloGrad.addColorStop(1, 'rgba(253, 186, 116, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
    ctx.fill();

    // Volumetric Winter Clouds
    drawRealisticCloud(W * 0.17, vpY * 0.3, 1.15);
    drawRealisticCloud(W * 0.78, vpY * 0.26, 0.95);
    drawRealisticCloud(W * 0.36, vpY * 0.18, 0.68);

    // 3. Gentle Winter Breeze Wisps
    airStreams.forEach(b => {
      b.update();
      b.draw();
    });

    // 4. Layered Distant Foothills & Tree Line with Atmospheric Haze
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, vpY);
    ctx.quadraticCurveTo(W * 0.18, vpY - 34, W * 0.42, vpY - 6);
    ctx.quadraticCurveTo(W * 0.72, vpY - 38, W, vpY - 8);
    ctx.lineTo(W, vpY + 4);
    ctx.lineTo(0, vpY + 4);
    ctx.fill();

    ctx.fillStyle = '#365314';
    ctx.beginPath();
    ctx.moveTo(0, vpY);
    ctx.quadraticCurveTo(W * 0.25, vpY - 18, W * 0.5, vpY);
    ctx.quadraticCurveTo(W * 0.78, vpY - 20, W, vpY);
    ctx.lineTo(W, vpY + 4);
    ctx.lineTo(0, vpY + 4);
    ctx.fill();

    // 5. Realistic Urban Ground, Grass Verge & Concrete Footpaths
    const groundGrad = ctx.createLinearGradient(0, vpY, 0, H);
    groundGrad.addColorStop(0, '#4d7c0f');
    groundGrad.addColorStop(0.25, '#3f6212');
    groundGrad.addColorStop(1, '#365314');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, vpY, W, H - vpY);

    // Concrete Sidewalks / Footpaths flanking both sides of the highway
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(vpX - 11, vpY);
    ctx.lineTo(vpX - 7, vpY);
    ctx.lineTo(vpX - roadHalfBottom, H);
    ctx.lineTo(vpX - roadHalfBottom * 1.24, H);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(vpX + 7, vpY);
    ctx.lineTo(vpX + 11, vpY);
    ctx.lineTo(vpX + roadHalfBottom * 1.24, H);
    ctx.lineTo(vpX + roadHalfBottom, H);
    ctx.closePath();
    ctx.fill();

    // 6. Photorealistic Urban Buildings along Footpaths & Corner Factories
    const cityScale = Math.min(1, W / 760);
    const drawUrbanCorridor = (isLeft: boolean) => {
      const sign = isLeft ? -1 : 1;
      const steps = [0.16, 0.34, 0.56, 0.84];
      steps.forEach((p, idx) => {
        const yBase = vpY + (H - vpY) * p;
        const roadEdgeX = vpX + sign * (8 + roadHalfBottom * p);
        const sidewalkWidth = (28 + 68 * p) * cityScale;
        const bw = (64 + 112 * p) * cityScale;
        const bh = (58 + 155 * p) * cityScale;
        const bx = isLeft ? roadEdgeX - sidewalkWidth - bw : roadEdgeX + sidewalkWidth;
        const by = yBase - bh;
        drawRealisticBuilding(bx, by, bw, bh, isLeft, idx + (isLeft ? 1 : 4));
      });

      const fw = Math.max(105, W * 0.12);
      const fh = Math.max(92, H * 0.16);
      const fx = isLeft ? 0 : W - fw;
      const fy = vpY + (H - vpY) * 0.28 - fh;
      drawRealisticFactory(fx, fy, fw, fh, isLeft, tick);
    };

    drawUrbanCorridor(true);
    drawUrbanCorridor(false);

    // 7. Realistic Textured Asphalt Highway Surface
    const asphaltGrad = ctx.createLinearGradient(0, vpY, 0, H);
    asphaltGrad.addColorStop(0, '#475569');
    asphaltGrad.addColorStop(0.25, '#334155');
    asphaltGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = asphaltGrad;
    ctx.beginPath();
    ctx.moveTo(vpX - 8, vpY);
    ctx.lineTo(vpX + 8, vpY);
    ctx.lineTo(vpX + roadHalfBottom, H);
    ctx.lineTo(vpX - roadHalfBottom, H);
    ctx.closePath();
    ctx.fill();

    // Subtle tire-wear tracks in lanes for realism
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    [-0.68, -0.34, 0.34, 0.68].forEach(laneRatio => {
      ctx.beginPath();
      ctx.moveTo(vpX + 6 * laneRatio - 1, vpY);
      ctx.lineTo(vpX + 6 * laneRatio + 1, vpY);
      ctx.lineTo(vpX + roadHalfBottom * laneRatio + 28, H);
      ctx.lineTo(vpX + roadHalfBottom * laneRatio - 28, H);
      ctx.closePath();
      ctx.fill();
    });

    // STATIC Outer White Shoulder Lines
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.88)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(vpX - 7, vpY);
    ctx.lineTo(vpX - roadHalfBottom * 0.94, H);
    ctx.moveTo(vpX + 7, vpY);
    ctx.lineTo(vpX + roadHalfBottom * 0.94, H);
    ctx.stroke();

    // STATIC Yellow Median Shoulder Lines
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(vpX - 2.5, vpY);
    ctx.lineTo(vpX - 18, H);
    ctx.moveTo(vpX + 2.5, vpY);
    ctx.lineTo(vpX + 18, H);
    ctx.stroke();

    // STATIC Perspective Dashed Lane Markings (FIXED IN PLACE — NO SCROLLING!)
    const dashSegments = 14;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.82)';
    for (let i = 1; i < dashSegments; i++) {
      const p1 = Math.pow(i / dashSegments, 1.45);
      const p2 = Math.pow((i + 0.48) / dashSegments, 1.45);
      const y1 = vpY + (H - vpY) * p1;
      const y2 = vpY + (H - vpY) * p2;
      const halfW1 = Math.max(0.6, 2.6 * p1);
      const halfW2 = Math.max(0.8, 3.4 * p2);

      [-0.5, 0.5].forEach(sideRatio => {
        const x1 = vpX + (7 + roadHalfBottom * p1) * sideRatio;
        const x2 = vpX + (7 + roadHalfBottom * p2) * sideRatio;
        ctx.beginPath();
        ctx.moveTo(x1 - halfW1, y1);
        ctx.lineTo(x1 + halfW1, y1);
        ctx.lineTo(x2 + halfW2, y2);
        ctx.lineTo(x2 - halfW2, y2);
        ctx.closePath();
        ctx.fill();
      });
    }

    // 8. Center Concrete Jersey Barrier Median with Realistic Street Lamps & Flowering Shrubs
    const medianGrad = ctx.createLinearGradient(vpX - 14, 0, vpX + 14, 0);
    medianGrad.addColorStop(0, '#94a3b8');
    medianGrad.addColorStop(0.5, '#e2e8f0');
    medianGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = medianGrad;
    ctx.beginPath();
    ctx.moveTo(vpX - 1.5, vpY);
    ctx.lineTo(vpX + 1.5, vpY);
    ctx.lineTo(vpX + 13, H);
    ctx.lineTo(vpX - 13, H);
    ctx.closePath();
    ctx.fill();

    const dividerSteps = [0.12, 0.27, 0.45, 0.67, 0.92];
    dividerSteps.forEach(p => {
      const dy = vpY + (H - vpY) * p;
      const s = 0.24 + p * 0.96;

      // Galvanized Steel Dual-Arm Highway Lamp Post
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.6 * s;
      ctx.beginPath();
      ctx.moveTo(vpX, dy);
      ctx.lineTo(vpX, dy - 62 * s);
      ctx.quadraticCurveTo(vpX, dy - 68 * s, vpX - 15 * s, dy - 68 * s);
      ctx.moveTo(vpX, dy - 62 * s);
      ctx.quadraticCurveTo(vpX, dy - 68 * s, vpX + 15 * s, dy - 68 * s);
      ctx.stroke();

      // Warm LED Luminaire Heads
      ctx.fillStyle = '#fef9c3';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 8 * s;
      ctx.beginPath();
      ctx.ellipse(vpX - 15 * s, dy - 68 * s, 3.5 * s, 1.8 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(vpX + 15 * s, dy - 68 * s, 3.5 * s, 1.8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Lush Multi-Shaded Ornamental Flower Tree
      const treeP = Math.min(0.98, p + 0.08);
      const ty = vpY + (H - vpY) * treeP;
      const ts = 0.24 + treeP * 0.96;
      ctx.fillStyle = '#422006';
      ctx.fillRect(vpX - 2.2 * ts, ty - 18 * ts, 4.4 * ts, 18 * ts);

      const foliageGrad = ctx.createRadialGradient(vpX - 3 * ts, ty - 28 * ts, 2 * ts, vpX, ty - 24 * ts, 14 * ts);
      foliageGrad.addColorStop(0, '#4ade80');
      foliageGrad.addColorStop(0.6, '#16a34a');
      foliageGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = foliageGrad;
      ctx.beginPath();
      ctx.arc(vpX, ty - 24 * ts, 13 * ts, 0, Math.PI * 2);
      ctx.fill();

      // Natural Flower Clusters
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(vpX - 5 * ts, ty - 26 * ts, 2.2 * ts, 0, Math.PI * 2);
      ctx.arc(vpX + 3 * ts, ty - 29 * ts, 1.8 * ts, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(vpX + 5 * ts, ty - 22 * ts, 2.1 * ts, 0, Math.PI * 2);
      ctx.fill();
    });

    // 9. Update & Draw Moving Photorealistic Vehicles (Sorted Back-to-Front)
    vehicles.forEach(v => v.update());
    vehicles.sort((a, b) => a.z - b.z);
    vehicles.forEach(v => v.draw(vpX, vpY, roadHalfBottom));

    // 10. Draw Polluted Air Plumes (Coalesce into Title, then Continue Flowing Lightly)
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
      const sp = smokeParticles[i];
      sp.update();
      if (sp.alpha <= 0 || sp.y < -40) {
        smokeParticles.splice(i, 1);
      } else {
        sp.draw();
      }
    }
  }

  resizeCanvas();
  initSceneEntities();
  window.addEventListener('resize', resizeCanvas);
  const start = performance.now();
  let lastFrame = start - 17;
  let frame = 0;

  function animate(now: number) {
    const elapsed = now - start;
    if (now - lastFrame >= 15) {
      if (!smokeCoalesceActive && elapsed >= timing.gatherAt) {
        updateLetterTargets();
        smokeCoalesceActive = true;
      }
      titleRevealed = elapsed >= timing.titleReadyAt;
      renderPerspectiveWorld();
      lastFrame = now;
    }
    frame = requestAnimationFrame(animate);
  }

  frame = requestAnimationFrame(animate);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resizeCanvas);
  };
}
