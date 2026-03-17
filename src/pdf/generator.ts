import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';
import type { ReportData } from '../report/assembler';
import type { ChartData } from '../engine/types';
import { drawChartWheel, drawChartSidebar } from './chart-wheel';

const COLORS = {
  purple:    rgb(0.357, 0.176, 0.557),
  gold:      rgb(0.722, 0.502, 0.153),
  dark:      rgb(0.102, 0.102, 0.102),
  grey:      rgb(0.400, 0.400, 0.400),
  lightgrey: rgb(0.941, 0.941, 0.929),
  white:     rgb(1, 1, 1),
};

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 50;
const USABLE_W = PAGE_W - 2 * MARGIN;
const BODY_SIZE = 11;
const BODY_LEADING = 16;

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  // Replace newlines with spaces — paragraph splitting is handled by the caller
  const words = text.replace(/\n/g, ' ').split(' ').filter(w => w);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function buildPDF(report: ReportData, srChart?: ChartData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // ── Page 1: Cover ──────────────────────────────────────────────────────────

  const cover = pdf.addPage([PAGE_W, PAGE_H]);

  // Purple header rectangle
  cover.drawRectangle({
    x: 0, y: PAGE_H - 200,
    width: PAGE_W, height: 200,
    color: COLORS.purple,
  });

  // Name
  const nameWidth = helveticaBold.widthOfTextAtSize(report.name, 28);
  cover.drawText(report.name, {
    x: (PAGE_W - nameWidth) / 2, y: 750,
    size: 28, font: helveticaBold, color: COLORS.white,
  });

  // Solar Return year
  const yearText = `Solar Return ${report.returnYear}`;
  const yearWidth = helvetica.widthOfTextAtSize(yearText, 20);
  cover.drawText(yearText, {
    x: (PAGE_W - yearWidth) / 2, y: 710,
    size: 20, font: helvetica, color: COLORS.white,
  });

  // Return date
  const dateWidth = helveticaOblique.widthOfTextAtSize(report.returnDateLocal, 14);
  cover.drawText(report.returnDateLocal, {
    x: (PAGE_W - dateWidth) / 2, y: 680,
    size: 14, font: helveticaOblique, color: COLORS.white,
  });

  // Return location
  const locWidth = helvetica.widthOfTextAtSize(report.returnLocation, 12);
  cover.drawText(report.returnLocation, {
    x: (PAGE_W - locWidth) / 2, y: 660,
    size: 12, font: helvetica, color: COLORS.white,
  });

  // Summary line
  const summary = `${report.srAscendant} Rising \u00B7 Sun in ${ordinal(report.srSunHouse)} \u00B7 Moon in ${report.srMoonSign} ${ordinal(report.srMoonHouse)}`;
  const summaryWidth = helvetica.widthOfTextAtSize(summary, 14);
  cover.drawText(summary, {
    x: (PAGE_W - summaryWidth) / 2, y: 600,
    size: 14, font: helvetica, color: COLORS.gold,
  });

  // Gold rule
  cover.drawLine({
    start: { x: MARGIN + 50, y: 585 },
    end: { x: PAGE_W - MARGIN - 50, y: 585 },
    thickness: 1, color: COLORS.gold,
  });

  // Footer
  const footerText = 'Your personalised solar return report';
  const footerWidth = helvetica.widthOfTextAtSize(footerText, 10);
  cover.drawText(footerText, {
    x: (PAGE_W - footerWidth) / 2, y: 40,
    size: 10, font: helvetica, color: COLORS.grey,
  });

  // ── Chart wheel page ──────────────────────────────────────────────────────

  if (srChart) {
    const chartPage = pdf.addPage([PAGE_W, PAGE_H]);

    // Title
    const chartTitle = 'Solar Return Chart';
    const ctw = helveticaBold.widthOfTextAtSize(chartTitle, 16);
    chartPage.drawText(chartTitle, {
      x: (PAGE_W - ctw) / 2, y: PAGE_H - 40,
      size: 16, font: helveticaBold, color: COLORS.purple,
    });

    // Chart wheel — centred on page with room for labels all around
    const wheelCx = PAGE_W / 2;
    const wheelCy = PAGE_H / 2 + 60;
    const wheelR = 175;
    drawChartWheel(chartPage, srChart, wheelCx, wheelCy, wheelR, helvetica, helveticaBold);

    // Chart data summary below the wheel
    drawChartSidebar(chartPage, srChart, report, MARGIN, wheelCy - wheelR - 55, helvetica, helveticaBold);

    // Page number
    const pn = '2';
    const pnw = helvetica.widthOfTextAtSize(pn, 10);
    chartPage.drawText(pn, {
      x: (PAGE_W - pnw) / 2, y: 30,
      size: 10, font: helvetica, color: COLORS.grey,
    });
  }

  // ── Report sections ────────────────────────────────────────────────────────

  let pageNum = srChart ? 2 : 1;
  let currentPage = newPage();
  let cursorY = PAGE_H - MARGIN - 30; // below header

  function newPage(): PDFPage {
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    pageNum++;
    // Header: name + year, top right
    const headerText = `${report.name} \u2014 ${report.returnYear}`;
    const hw = helvetica.widthOfTextAtSize(headerText, 9);
    page.drawText(headerText, {
      x: PAGE_W - MARGIN - hw, y: PAGE_H - 30,
      size: 9, font: helvetica, color: COLORS.grey,
    });
    return page;
  }

  function drawPageNumber(page: PDFPage, num: number) {
    const numText = String(num);
    const nw = helvetica.widthOfTextAtSize(numText, 10);
    page.drawText(numText, {
      x: (PAGE_W - nw) / 2, y: 30,
      size: 10, font: helvetica, color: COLORS.grey,
    });
  }

  function ensureSpace(needed: number) {
    if (cursorY - needed < MARGIN + 40) {
      drawPageNumber(currentPage, pageNum);
      currentPage = newPage();
      cursorY = PAGE_H - MARGIN - 30;
    }
  }

  for (const section of report.sections) {
    // Need at least heading + subheading + a few body lines
    ensureSpace(120);

    // Section heading
    currentPage.drawText(section.heading, {
      x: MARGIN, y: cursorY,
      size: 18, font: helveticaBold, color: COLORS.purple,
    });
    cursorY -= 4;

    // Gold underline
    currentPage.drawLine({
      start: { x: MARGIN, y: cursorY },
      end: { x: MARGIN + USABLE_W, y: cursorY },
      thickness: 1, color: COLORS.gold,
    });
    cursorY -= 18;

    // Subheading
    if (section.subheading) {
      currentPage.drawText(section.subheading, {
        x: MARGIN, y: cursorY,
        size: 13, font: helveticaOblique, color: COLORS.gold,
      });
      cursorY -= 22;
    }

    // Body text — split by paragraphs then wrap each
    const paragraphs = section.body.split('\n\n').filter(p => p.trim());
    for (const para of paragraphs) {
      // Handle bold markers: **text** — strip them for PDF (no inline bold in pdf-lib)
      const cleanPara = para.replace(/\*\*/g, '');
      const lines = wrapText(cleanPara, helvetica, BODY_SIZE, USABLE_W);

      for (const line of lines) {
        ensureSpace(BODY_LEADING + 10);
        currentPage.drawText(line, {
          x: MARGIN, y: cursorY,
          size: BODY_SIZE, font: helvetica, color: COLORS.dark,
        });
        cursorY -= BODY_LEADING;
      }
      cursorY -= 6; // paragraph gap
    }

    cursorY -= 16; // section gap
  }

  // ── Calendar pages ─────────────────────────────────────────────────────────

  if (report.calendarEvents.length > 0) {
    drawPageNumber(currentPage, pageNum);
    currentPage = newPage();
    cursorY = PAGE_H - MARGIN - 30;

    // Heading
    currentPage.drawText('Your Year Ahead \u2014 Key Dates', {
      x: MARGIN, y: cursorY,
      size: 18, font: helveticaBold, color: COLORS.purple,
    });
    cursorY -= 4;
    currentPage.drawLine({
      start: { x: MARGIN, y: cursorY },
      end: { x: MARGIN + USABLE_W, y: cursorY },
      thickness: 1, color: COLORS.gold,
    });
    cursorY -= 24;

    let lastMonth = '';
    const DATE_COL_W = 80;

    for (const event of report.calendarEvents) {
      const month = event.date.substring(0, 7); // YYYY-MM
      if (month !== lastMonth) {
        ensureSpace(30);
        const monthLabel = formatMonth(month);
        currentPage.drawText(monthLabel, {
          x: MARGIN, y: cursorY,
          size: 12, font: helveticaBold, color: COLORS.purple,
        });
        cursorY -= 18;
        lastMonth = month;
      }

      const eventLines = wrapText(event.text, helvetica, 10, USABLE_W - DATE_COL_W - 10);
      ensureSpace(eventLines.length * 14 + 4);

      // Date
      currentPage.drawText(event.date, {
        x: MARGIN, y: cursorY,
        size: 10, font: helvetica, color: COLORS.grey,
      });

      // Event text
      for (let i = 0; i < eventLines.length; i++) {
        currentPage.drawText(eventLines[i], {
          x: MARGIN + DATE_COL_W + 10, y: cursorY - (i * 14),
          size: 10, font: helvetica, color: COLORS.dark,
        });
      }
      cursorY -= eventLines.length * 14 + 4;
    }
  }

  // Final page number
  drawPageNumber(currentPage, pageNum);

  return pdf.save();
}

function ordinal(n: number): string {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] ?? s[v] ?? s[0]);
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-');
  const months = ['','January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  return `${months[parseInt(m)]} ${y}`;
}
