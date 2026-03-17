import { PDFPage, PDFFont, rgb } from 'pdf-lib';
import type { ChartData } from '../engine/types';

const SIGN_ABBR = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mercury: 'Me', Venus: 'Ve', Mars: 'Ma',
  Jupiter: 'Ju', Saturn: 'Sa', Uranus: 'Ur', Neptune: 'Ne', Pluto: 'Pl',
};

const C = {
  ringFill: rgb(0.918, 0.892, 0.925),
  houseFill: rgb(0.962, 0.946, 0.964),
  ringBorder: rgb(0.310, 0.300, 0.355),
  cuspThin: rgb(0.565, 0.555, 0.600),
  cuspAngular: rgb(0.280, 0.275, 0.325),
  signText: rgb(0.345, 0.305, 0.425),
  houseNum: rgb(0.430, 0.405, 0.475),
  planetLabel: rgb(0.150, 0.130, 0.205),
  tick: rgb(0.330, 0.285, 0.420),
  gold: rgb(0.620, 0.460, 0.140),
  sidebar: rgb(0.200, 0.200, 0.250),
  white: rgb(1, 1, 1),
};

type LabelZone = 'left' | 'right' | 'top' | 'bottom';

type PlanetEntry = {
  label: string;
  angle: number;
  anchorX: number;
  anchorY: number;
  textW: number;
  zone: LabelZone;
  x?: number;
  y?: number;
};

function lonToAngle(lon: number, ascLon: number): number {
  return Math.PI - ((lon - ascLon) * Math.PI / 180);
}

function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function degMin(lon: number) {
  const w = lon % 30;
  return { d: Math.floor(w), m: Math.floor((w - Math.floor(w)) * 60) };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveVerticalStack(
  entries: PlanetEntry[],
  targetYs: number[],
  topBound: number,
  bottomBound: number,
  labelH: number,
  gap: number,
) {
  if (entries.length === 0) return;

  const step = labelH + gap;
  const placed = [...targetYs];

  for (let i = 1; i < placed.length; i++) {
    if (placed[i] - placed[i - 1] < step) placed[i] = placed[i - 1] + step;
  }

  const maxLast = bottomBound - labelH;
  if (placed[placed.length - 1] > maxLast) {
    placed[placed.length - 1] = maxLast;
    for (let i = placed.length - 2; i >= 0; i--) {
      if (placed[i + 1] - placed[i] < step) placed[i] = placed[i + 1] - step;
    }
  }

  const minFirst = topBound;
  if (placed[0] < minFirst) {
    placed[0] = minFirst;
    for (let i = 1; i < placed.length; i++) {
      if (placed[i] - placed[i - 1] < step) placed[i] = placed[i - 1] + step;
    }
  }

  for (let i = 0; i < entries.length; i++) entries[i].y = placed[i];
}

function resolveHorizontalStack(
  entries: PlanetEntry[],
  targetXs: number[],
  leftBound: number,
  rightBound: number,
  gap: number,
) {
  if (entries.length === 0) return;

  const placed = [...targetXs];

  for (let i = 1; i < placed.length; i++) {
    const minX = placed[i - 1] + entries[i - 1].textW + gap;
    if (placed[i] < minX) placed[i] = minX;
  }

  const last = entries.length - 1;
  const maxLast = rightBound - entries[last].textW;
  if (placed[last] > maxLast) {
    placed[last] = maxLast;
    for (let i = last - 1; i >= 0; i--) {
      const maxX = placed[i + 1] - entries[i].textW - gap;
      if (placed[i] > maxX) placed[i] = maxX;
    }
  }

  if (placed[0] < leftBound) {
    placed[0] = leftBound;
    for (let i = 1; i < entries.length; i++) {
      const minX = placed[i - 1] + entries[i - 1].textW + gap;
      if (placed[i] < minX) placed[i] = minX;
    }
  }

  for (let i = 0; i < entries.length; i++) entries[i].x = placed[i];
}

function placePlanetLabels(
  entries: PlanetEntry[],
  cx: number,
  cy: number,
  signR: number,
  labelH: number,
) {
  const sideOffset = 14;
  const sideGap = 7;
  const capGap = 8;
  const capInset = 18;
  const pageW = 595; // A4 width
  const pageMargin = 35;
  const sideTop = cy - signR + 22;
  const sideBottom = cy + signR - 10;
  const sideLeftX = Math.max(pageMargin, cx - signR - 22);
  const sideRightX = cx + signR + 16;
  const maxRightX = pageW - pageMargin; // labels must not exceed this
  const topY = cy + signR + 24;
  const bottomY = cy - signR - 20;

  const left = entries
    .filter((entry) => entry.zone === 'left')
    .sort((a, b) => a.anchorY - b.anchorY);
  for (const entry of left) entry.x = sideLeftX - entry.textW;
  resolveVerticalStack(
    left,
    left.map((entry) => clamp(entry.anchorY - labelH / 2, sideTop, sideBottom - labelH)),
    sideTop,
    sideBottom,
    labelH,
    sideGap,
  );

  const right = entries
    .filter((entry) => entry.zone === 'right')
    .sort((a, b) => a.anchorY - b.anchorY);
  for (const entry of right) entry.x = Math.min(sideRightX, maxRightX - entry.textW);
  resolveVerticalStack(
    right,
    right.map((entry) => clamp(entry.anchorY - labelH / 2, sideTop, sideBottom - labelH)),
    sideTop,
    sideBottom,
    labelH,
    sideGap,
  );

  const top = entries
    .filter((entry) => entry.zone === 'top')
    .sort((a, b) => a.anchorX - b.anchorX);
  resolveHorizontalStack(
    top,
    top.map((entry) => clamp(entry.anchorX - entry.textW / 2, cx - signR + capInset, cx + signR - capInset - entry.textW)),
    cx - signR + capInset,
    cx + signR - capInset,
    capGap,
  );
  for (const entry of top) entry.y = topY;

  const bottom = entries
    .filter((entry) => entry.zone === 'bottom')
    .sort((a, b) => a.anchorX - b.anchorX);
  resolveHorizontalStack(
    bottom,
    bottom.map((entry) => clamp(entry.anchorX - entry.textW / 2, cx - signR + capInset, cx + signR - capInset - entry.textW)),
    cx - signR + capInset,
    cx + signR - capInset,
    capGap,
  );
  for (const entry of bottom) entry.y = bottomY;

  for (const entry of entries) {
    entry.x ??= entry.anchorX + sideOffset;
    entry.y ??= entry.anchorY - labelH / 2;
  }
}

export function drawChartWheel(
  page: PDFPage, chart: ChartData,
  cx: number, cy: number, R: number,
  font: PDFFont, bold: PDFFont,
) {
  const signR = R;
  const signInR = R * 0.84;
  const innerR = R * 0.30;
  const ascLon = chart.houses.ascendant;
  const cusps = chart.houses.cusps;

  // ── Filled rings ─────────────────────────────────────────────────────────
  page.drawEllipse({ x: cx, y: cy, xScale: signR, yScale: signR,
    color: C.ringFill, borderWidth: 2, borderColor: C.ringBorder });
  page.drawEllipse({ x: cx, y: cy, xScale: signInR, yScale: signInR,
    color: C.houseFill, borderWidth: 1, borderColor: C.ringBorder });
  page.drawEllipse({ x: cx, y: cy, xScale: innerR, yScale: innerR,
    color: C.white, borderWidth: 1, borderColor: C.ringBorder });

  // ── Sign divisions + labels ──────────────────────────────────────────────
  for (let i = 0; i < 12; i++) {
    const a = lonToAngle(i * 30, ascLon);
    page.drawLine({
      start: polar(cx, cy, signInR, a), end: polar(cx, cy, signR, a),
      thickness: 0.5, color: C.ringBorder,
    });
    const midA = lonToAngle(i * 30 + 15, ascLon);
    const lp = polar(cx, cy, (signR + signInR) / 2, midA);
    const lbl = SIGN_ABBR[i];
    const lw = bold.widthOfTextAtSize(lbl, 9.5);
    page.drawText(lbl, { x: lp.x - lw / 2, y: lp.y - 3.7,
      size: 9.5, font: bold, color: C.signText });
  }

  // ── House cusp lines ─────────────────────────────────────────────────────
  for (let h = 1; h <= 12; h++) {
    const a = lonToAngle(cusps[h], ascLon);
    const angular = h === 1 || h === 4 || h === 7 || h === 10;
    page.drawLine({
      start: polar(cx, cy, innerR, a),
      end: polar(cx, cy, signInR, a),
      thickness: angular ? 1.5 : 0.4,
      color: angular ? C.cuspAngular : C.cuspThin,
    });

    // House number centred in segment
    const nextH = h === 12 ? 1 : h + 1;
    const span = ((cusps[nextH] - cusps[h]) + 360) % 360;
    const midLon = (cusps[h] + span / 2) % 360;
    const hA = lonToAngle(midLon, ascLon);
    const hnR = innerR + (signInR - innerR) * 0.43;
    const hp = polar(cx, cy, hnR, hA);
    const hn = String(h);
    const hw = font.widthOfTextAtSize(hn, 12);
    page.drawText(hn, { x: hp.x - hw / 2, y: hp.y - 4.3,
      size: 12, font, color: C.houseNum });
  }

  // ── Angular cusp degree labels only (1, 4, 7, 10) ───────────────────────
  for (const h of [1, 4, 7, 10]) {
    const { d, m } = degMin(cusps[h]);
    const a = lonToAngle(cusps[h], ascLon);
    const cp = polar(cx, cy, signR + 10, a);
    const ct = `${d}\u00B0${String(m).padStart(2, '0')}'`;
    const cw = font.widthOfTextAtSize(ct, 6.2);
    page.drawText(ct, { x: cp.x - cw / 2, y: cp.y - 2.5,
      size: 6.2, font, color: C.houseNum });
  }

  // ── Planets: tick marks + screen-space label layout ──────────────────────
  const fontSize = 7.5;
  const labelH = fontSize + 2;
  const tickOuterR = signR + 3;
  const anchorR = signR + 8;

  const entries: PlanetEntry[] = chart.planets.map((p) => {
    const { d, m } = degMin(p.longitude);
    const abbr = PLANET_ABBR[p.name] ?? p.name.substring(0, 2);
    const label = `${abbr} ${d}\u00B0${SIGN_ABBR[Math.floor(p.longitude / 30)]}${String(m).padStart(2, '0')}'${p.retrograde ? 'R' : ''}`;
    const angle = lonToAngle(p.longitude, ascLon);
    const anchor = polar(cx, cy, anchorR, angle);
    const dx = anchor.x - cx;
    const dy = anchor.y - cy;
    let zone: LabelZone;
    if (Math.abs(dy) > Math.abs(dx) * 1.15) {
      zone = dy > 0 ? 'top' : 'bottom';
    } else {
      zone = dx > 0 ? 'right' : 'left';
    }
    return {
      label,
      angle,
      anchorX: anchor.x,
      anchorY: anchor.y,
      textW: bold.widthOfTextAtSize(label, fontSize),
      zone,
    };
  });

  placePlanetLabels(entries, cx, cy, signR, labelH);

  for (const e of entries) {
    const ti = polar(cx, cy, signR - 3, e.angle);
    const to = polar(cx, cy, tickOuterR, e.angle);
    page.drawLine({ start: ti, end: to, thickness: 1, color: C.tick });

    page.drawText(e.label, {
      x: e.x!, y: e.y!,
      size: fontSize, font: bold, color: C.planetLabel,
    });

    const textMidY = e.y! + fontSize * 0.45;
    const textEndX = e.zone === 'left' ? e.x! + e.textW : e.x!;
    const textMidX = e.zone === 'top' || e.zone === 'bottom' ? e.x! + e.textW / 2 : textEndX;
    page.drawLine({
      start: polar(cx, cy, tickOuterR, e.angle),
      end: { x: textMidX, y: textMidY },
      thickness: 0.35,
      color: C.cuspThin,
      opacity: 0.9,
    });
  }

  // ── Asc / MC small markers at cusp endpoints ─────────────────────────────
  const ascA = lonToAngle(ascLon, ascLon);
  const ascTip = polar(cx, cy, signInR - 18, ascA);
  page.drawText('Asc', { x: ascTip.x - bold.widthOfTextAtSize('Asc', 6.2) / 2, y: ascTip.y - 3.2,
    size: 6.2, font: bold, color: C.gold });

  const mcA2 = lonToAngle(chart.houses.mc, ascLon);
  const mcTip = polar(cx, cy, signInR - 18, mcA2);
  page.drawText('MC', { x: mcTip.x - bold.widthOfTextAtSize('MC', 6.2) / 2, y: mcTip.y - 3.2,
    size: 6.2, font: bold, color: C.gold });
}

// ── Sidebar ────────────────────────────────────────────────────────────────

export function drawChartSidebar(
  page: PDFPage, chart: ChartData,
  report: { name: string; returnYear: number; returnDateLocal: string; returnLocation: string },
  x: number, y: number, font: PDFFont, bold: PDFFont,
) {
  const sz = 8;
  const lineH = 11;

  // Header line
  const header = `${report.returnDateLocal}  |  ${report.returnLocation}  |  Placidus Houses`;
  page.drawText(header, { x, y, size: sz, font, color: C.houseNum });

  // Planet positions in two columns
  const col1x = x;
  const col2x = x + 250;
  let row = 0;

  const allEntries: string[] = [];
  for (const p of chart.planets) {
    const abbr = PLANET_ABBR[p.name] ?? p.name.substring(0, 2);
    allEntries.push(`${abbr} ${p.degree}\u00B0${SIGN_ABBR[p.sign]}${String(p.minute).padStart(2, '0')}'${p.retrograde ? ' R' : ''}`);
  }
  const asc = degMin(chart.houses.ascendant);
  const mc = degMin(chart.houses.mc);
  allEntries.push(`Asc ${asc.d}\u00B0${SIGN_ABBR[Math.floor(chart.houses.ascendant / 30)]}${String(asc.m).padStart(2, '0')}'`);
  allEntries.push(`MC ${mc.d}\u00B0${SIGN_ABBR[Math.floor(chart.houses.mc / 30)]}${String(mc.m).padStart(2, '0')}'`);

  const half = Math.ceil(allEntries.length / 2);
  for (let i = 0; i < allEntries.length; i++) {
    const colX = i < half ? col1x : col2x;
    const rowIdx = i < half ? i : i - half;
    page.drawText(allEntries[i], {
      x: colX, y: y - lineH * (rowIdx + 1) - 4,
      size: sz, font: bold, color: C.sidebar,
    });
  }
}
