'use client';

import { useEffect, useRef } from 'react';

// Coordenadas simplificadas dos continentes (longitude, latitude) → projetadas em 2D
// Cada array é uma lista de [lon, lat] que forma o contorno de uma região
const WORLD_DOTS: [number, number][] = [];

// Gera uma grade de pontos e filtra os que estão "dentro" dos continentes
// usando uma máscara de bitmap simplificada do mapa mundi
// Usamos uma abordagem de pontos em grade com máscara SVG path
const CONTINENT_MASK = `
M 10,30 L 25,20 L 35,25 L 40,35 L 35,45 L 20,50 L 10,40 Z
M 45,15 L 75,10 L 90,20 L 95,35 L 85,50 L 70,55 L 55,50 L 45,40 L 40,25 Z
M 100,20 L 130,15 L 145,25 L 150,40 L 140,55 L 120,60 L 105,50 L 95,35 Z
M 155,30 L 175,25 L 185,35 L 180,50 L 165,55 L 155,45 Z
M 50,60 L 70,55 L 80,65 L 75,80 L 60,85 L 48,75 Z
M 105,55 L 125,50 L 135,60 L 130,75 L 115,80 L 100,70 Z
M 160,55 L 180,50 L 190,60 L 185,75 L 170,80 L 158,70 Z
`;

export default function HeroBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = 0, H = 0;

    // Pontos do mapa mundi — grade de dots filtrada por continentes
    type Dot = { gx: number; gy: number; baseX: number; baseY: number; active: boolean };
    let dots: Dot[] = [];

    // Mapa mundi simplificado como array de pixels (0/1)
    // Representação em baixa resolução 200x100 dos continentes
    const MAP_W = 200, MAP_H = 100;
    const worldMap = new Uint8Array(MAP_W * MAP_H);

    // Preenche o mapa com os continentes usando coordenadas geográficas
    const fillContinent = (regions: [number, number][][]) => {
      for (const region of regions) {
        // Rasteriza cada polígono no mapa
        for (let py = 0; py < MAP_H; py++) {
          const intersections: number[] = [];
          for (let i = 0; i < region.length; i++) {
            const [x1, y1] = region[i];
            const [x2, y2] = region[(i + 1) % region.length];
            if ((y1 <= py && y2 > py) || (y2 <= py && y1 > py)) {
              const xi = x1 + (py - y1) / (y2 - y1) * (x2 - x1);
              intersections.push(xi);
            }
          }
          intersections.sort((a, b) => a - b);
          for (let k = 0; k < intersections.length - 1; k += 2) {
            const x0 = Math.floor(intersections[k]);
            const x1 = Math.ceil(intersections[k + 1]);
            for (let px = x0; px <= x1; px++) {
              if (px >= 0 && px < MAP_W) worldMap[py * MAP_W + px] = 1;
            }
          }
        }
      }
    };

    // Continentes em coordenadas de mapa (0-200 x, 0-100 y)
    // América do Norte
    fillContinent([[
      [20,8],[45,5],[55,10],[60,20],[55,35],[45,45],[35,50],[25,45],[15,35],[12,20]
    ]]);
    // América do Sul
    fillContinent([[
      [30,50],[45,48],[52,55],[50,70],[42,82],[32,85],[25,75],[22,60]
    ]]);
    // Europa
    fillContinent([[
      [88,8],[105,5],[112,12],[115,22],[108,30],[95,32],[85,28],[82,18]
    ]]);
    // África
    fillContinent([[
      [88,32],[108,30],[115,38],[112,55],[105,68],[95,72],[82,65],[78,50],[80,38]
    ]]);
    // Ásia
    fillContinent([[
      [112,5],[160,3],[175,10],[178,25],[170,38],[155,45],[135,48],[115,42],[108,30],[112,18]
    ]]);
    // Oceania
    fillContinent([[
      [148,55],[168,52],[175,58],[172,68],[160,72],[148,68],[142,60]
    ]]);
    // Rússia (parte)
    fillContinent([[
      [112,5],[160,3],[165,8],[155,18],[130,22],[112,18]
    ]]);

    const buildDots = () => {
      dots = [];
      const STEP = 5; // espaçamento entre dots em unidades de mapa
      for (let gy = 0; gy < MAP_H; gy += STEP) {
        for (let gx = 0; gx < MAP_W; gx += STEP) {
          const active = worldMap[gy * MAP_W + gx] === 1;
          dots.push({
            gx: gx / MAP_W,
            gy: gy / MAP_H,
            baseX: 0,
            baseY: 0,
            active,
          });
        }
      }
    };

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      buildDots();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
      mouseRef.current.targetY = (e.clientY - rect.top) / rect.height;
    };
    const onMouseLeave = () => {
      mouseRef.current.targetX = 0.5;
      mouseRef.current.targetY = 0.5;
    };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    let t = 0;
    const draw = () => {
      t += 0.01;
      const m = mouseRef.current;
      // Suaviza o mouse
      m.x += (m.targetX - m.x) * 0.06;
      m.y += (m.targetY - m.y) * 0.06;

      ctx.clearRect(0, 0, W, H);

      // Fundo branco/cinza muito claro
      ctx.fillStyle = '#f8f8fc';
      ctx.fillRect(0, 0, W, H);

      // Gradiente sutil de fundo
      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, W * 0.7);
      bgGrad.addColorStop(0, 'rgba(108,92,231,0.06)');
      bgGrad.addColorStop(1, 'rgba(108,92,231,0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ── Efeito 3D com mouse ──────────────────────────────
      // Rotação 3D simulada: deslocamento dos pontos baseado no mouse
      const tiltX = (m.x - 0.5) * 0.18; // -0.09 a +0.09 radianos
      const tiltY = (m.y - 0.5) * 0.12;

      // Área do mapa no canvas
      const mapX = W * 0.05;
      const mapY = H * 0.08;
      const mapW = W * 0.9;
      const mapH = H * 0.84;

      // Ponto de luz baseado no mouse
      const lightX = m.x * W;
      const lightY = m.y * H;

      for (const dot of dots) {
        // Posição base no canvas
        const bx = mapX + dot.gx * mapW;
        const by = mapY + dot.gy * mapH;

        // Perspectiva 3D: deslocamento baseado na distância do centro
        const cx = bx - W * 0.5;
        const cy = by - H * 0.5;
        const px = bx + cx * tiltX * 0.8 + cy * tiltY * 0.3;
        const py = by + cy * tiltY * 0.8 - cx * tiltX * 0.3;

        // Distância ao cursor para efeito de luz
        const dx = px - lightX;
        const dy = py - lightY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const lightRadius = Math.min(W, H) * 0.28;
        const lightFactor = Math.max(0, 1 - dist / lightRadius);

        if (dot.active) {
          // Dot de continente
          const baseAlpha = 0.35 + lightFactor * 0.55;
          const r = 2.2 + lightFactor * 2.5;

          // Cor: roxo com brilho ao passar o mouse
          const red = Math.round(108 + lightFactor * 80);
          const green = Math.round(92 + lightFactor * 40);
          const blue = Math.round(231);
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${red},${green},${blue},${baseAlpha})`;
          ctx.fill();

          // Halo brilhante no cursor
          if (lightFactor > 0.5) {
            ctx.beginPath();
            ctx.arc(px, py, r * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(108,92,231,${(lightFactor - 0.5) * 0.25})`;
            ctx.fill();
          }
        } else {
          // Dot de oceano — muito sutil
          const alpha = 0.06 + lightFactor * 0.08;
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180,180,210,${alpha})`;
          ctx.fill();
        }
      }

      // ── Glow do cursor ────────────────────────────────────
      const cursorGlow = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, Math.min(W, H) * 0.22);
      cursorGlow.addColorStop(0, 'rgba(108,92,231,0.12)');
      cursorGlow.addColorStop(0.5, 'rgba(108,92,231,0.04)');
      cursorGlow.addColorStop(1, 'rgba(108,92,231,0)');
      ctx.fillStyle = cursorGlow;
      ctx.fillRect(0, 0, W, H);

      // ── Linhas de conexão animadas (rotas de pagamento) ──
      const activeD = dots.filter(d => d.active);
      const routeCount = 6;
      for (let i = 0; i < routeCount; i++) {
        const phase = (t * 0.4 + i * (Math.PI * 2 / routeCount)) % (Math.PI * 2);
        const progress = (Math.sin(phase) + 1) / 2;

        const idx1 = Math.floor((i * 137 + 23) % activeD.length);
        const idx2 = Math.floor((i * 97 + 61) % activeD.length);
        const d1 = activeD[idx1];
        const d2 = activeD[idx2];

        const x1 = mapX + d1.gx * mapW;
        const y1 = mapY + d1.gy * mapH;
        const x2 = mapX + d2.gx * mapW;
        const y2 = mapY + d2.gy * mapH;

        // Ponto animado ao longo da rota
        const px2 = x1 + (x2 - x1) * progress;
        const py2 = y1 + (y2 - y1) * progress;

        // Linha da rota
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(108,92,231,0.08)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ponto viajante
        ctx.beginPath();
        ctx.arc(px2, py2, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(108,92,231,0.7)';
        ctx.fill();

        // Rastro do ponto
        ctx.beginPath();
        ctx.arc(px2, py2, 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(108,92,231,0.15)';
        ctx.fill();
      }

      // Vinheta suave nas bordas
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
      vig.addColorStop(0, 'rgba(248,248,252,0)');
      vig.addColorStop(1, 'rgba(248,248,252,0.7)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 1,
        cursor: 'crosshair',
      }}
      aria-hidden="true"
    />
  );
}
