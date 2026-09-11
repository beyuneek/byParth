/* =========================================================================
   Sandbox 2 — "See your document the way an AI does"

   Structure-aware chunking, live, entirely in the browser.
   FileReader only — there is deliberately NO fetch() anywhere in this file.
   A .docx is unzipped with the browser's own DecompressionStream. A PDF is
   read by pdf.js, served from this same site and loaded only the first time
   somebody drops one. Either way, the file itself goes nowhere.
   ========================================================================= */
(function () {
  "use strict";

  /* -------- Fictional sample SOP (~1200 words) -------- */
  const SAMPLE = `EQUIPMENT INSPECTION AND MAINTENANCE STANDARD OPERATING PROCEDURE

This document is entirely fictional. It describes NORTHWIND FABRICATION WORKS, an invented company, and is used here only to demonstrate how a document is divided before an AI system reads it. Any resemblance to a real organisation, product, or procedure is coincidental.

1. PURPOSE AND SCOPE

1.1 This procedure defines how production equipment at Northwind Fabrication Works is inspected, maintained, and returned to service. It applies to all powered machinery on the shop floor, including cutting stations, press units, conveyor lines, and the compressed-air system.

1.2 The purpose of this procedure is to keep equipment operating safely and within tolerance, to reduce unplanned downtime, and to create a written record that can be reviewed during an audit. Every operator, shift supervisor, and maintenance technician is expected to follow it without exception.

1.3 This procedure does not cover building services such as lighting, heating, or fire suppression. Those systems are governed by a separate facilities procedure and are outside the scope of this document.

2. DEFINITIONS AND RESPONSIBILITIES

2.1 A "routine inspection" is a visual and functional check performed at the start of a shift. A "scheduled maintenance task" is a planned intervention carried out at a fixed interval, whether or not a fault has been observed. A "non-conformance" is any condition where equipment is found outside its allowed operating limits.

2.2 The shift supervisor is responsible for confirming that routine inspections are completed before production begins. The maintenance technician is responsible for scheduled tasks and for signing off any repair. The plant manager holds overall responsibility for this procedure and reviews it once a year.

2.3 Operators are responsible for reporting any unusual noise, vibration, smell, or reading immediately, and for stopping the machine if continued operation would be unsafe. No operator is permitted to bypass a guard, interlock, or safety cut-out for any reason.

3. INSPECTION SCHEDULE

3.1 Routine inspections are performed daily. Scheduled maintenance is performed at the intervals set out in the table below. Intervals are measured in running hours where a meter is fitted, and in calendar days otherwise. Where the two disagree, the shorter interval applies.

3.2 The following table lists the minimum intervals for each equipment class. These are minimums; a supervisor may shorten an interval based on observed condition, but may never extend one without written approval from the plant manager.

| Equipment class   | Routine check | Scheduled task | Interval      |
| ----------------- | ------------- | -------------- | ------------- |
| Cutting station   | Daily         | Blade & guard  | 250 hours     |
| Hydraulic press   | Daily         | Seal & fluid   | 500 hours     |
| Conveyor line     | Daily         | Belt & rollers | 30 days       |
| Compressed air    | Weekly        | Filter & drain | 90 days       |
| Hand power tools  | Before use    | Inspection tag | 180 days      |

3.3 When an interval falls on a non-working day, the task is brought forward to the last working day before it. It is never deferred to the next working day, because a deferred task is the most common reason a machine is found overdue during an audit.

4. MAINTENANCE PROCEDURE

4.1 Before any maintenance begins, the technician must isolate the equipment from all energy sources and apply a personal lock and tag. This is a mandatory step. The machine may not be worked on while it is capable of starting, whether by electrical power, stored hydraulic pressure, or a suspended load.

4.2 The technician follows the task card for the specific equipment class. Each task card lists the parts to inspect, the tolerances to measure against, the consumables to replace, and the torque values to apply. Task cards are controlled documents and only the current revision may be used.

4.3 Any part found outside tolerance is replaced, not adjusted, unless the task card explicitly allows adjustment. Replaced parts are recorded by their part number and batch. Used consumables are disposed of according to the waste procedure and are never returned to stores.

4.4 When the task is complete, the technician performs a functional test at reduced load before releasing the equipment. The personal lock and tag are removed only by the person who applied them, and only after the functional test has passed.

5. RECORDS AND NON-CONFORMANCE

5.1 Every routine inspection and every scheduled task is recorded on the maintenance log the same day it is performed. A task that is not recorded is treated as a task that was not done, regardless of what actually happened at the machine.

5.2 A non-conformance is raised whenever equipment is found outside its operating limits, whenever a scheduled task is overdue, or whenever a repair does not restore the equipment to tolerance. The non-conformance is closed only when the condition is corrected and the correction is verified by a second person.

5.3 Maintenance records are retained for a minimum of three years and are made available to auditors on request. Records are stored so that the history of any single machine can be reconstructed from its records alone.

ANNEX A - ROUTINE INSPECTION CHECKLIST

A.1 Confirm guards, interlocks, and emergency stops are present and functional.
A.2 Check for leaks of oil, coolant, or air around seals and fittings.
A.3 Listen for unusual noise and feel for abnormal vibration at idle.
A.4 Confirm gauges and indicators read within their marked normal range.
A.5 Confirm the work area is clear and the previous shift's log is signed.

END OF PROCEDURE — NORTHWIND FABRICATION WORKS (FICTIONAL).`;

  /* -------- token estimate -------- */
  const tokens = (s) => Math.max(1, Math.round(s.length / 4));

  const escapeHtml = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* -------- heading detection -------- */
  function detectHeading(line) {
    const t = line.trim();
    if (!t) return null;
    if (/^#{1,6}\s+/.test(t)) return t.replace(/^#{1,6}\s+/, "");
    if (/^\d+(\.\d+)*[.)]?\s+\S/.test(t)) return t;             // 1.  2.1  3.2)
    if (/^[A-Z]\.\d+\s+\S/.test(t)) return t;                    // A.1  B.2
    if (/^(section|clause|annex|appendix|schedule)\b/i.test(t)) return t;
    const letters = t.replace(/[^A-Za-z]/g, "");
    if (letters.length >= 3 && t.length <= 72 &&
        letters === letters.toUpperCase() && /[A-Z]/.test(letters)) return t; // ALL CAPS
    return null;
  }

  /* -------- split into sections by heading -------- */
  function buildSections(text) {
    const lines = text.split(/\r?\n/);
    const sections = [];
    let cur = { heading: "Document start", lines: [], synthetic: true };
    for (const line of lines) {
      const h = detectHeading(line);
      if (h) {
        if (cur.lines.some((l) => l.trim())) sections.push(cur);
        cur = { heading: h, lines: [line], synthetic: false };
      } else {
        cur.lines.push(line);
      }
    }
    if (cur.lines.some((l) => l.trim())) sections.push(cur);
    return sections;
  }

  /* -------- atoms: paragraphs + whole tables -------- */
  function sectionAtoms(section) {
    const atoms = [];
    let buf = [], inTable = false;
    const isTableLine = (l) => l.includes("|") && l.trim().length > 0;
    const flushText = () => {
      const txt = buf.join("\n").trim();
      if (txt) {
        txt.split(/\n{2,}/).forEach((p) => { if (p.trim()) atoms.push({ text: p.trim(), table: false }); });
      }
      buf = [];
    };
    const flushTable = () => {
      const txt = buf.join("\n").trim();
      if (txt) atoms.push({ text: txt, table: true });
      buf = [];
    };
    for (const line of section.lines) {
      if (isTableLine(line)) {
        if (!inTable) { flushText(); inTable = true; }
        buf.push(line);
      } else {
        if (inTable) { flushTable(); inTable = false; }
        buf.push(line);
      }
    }
    if (inTable) flushTable(); else flushText();
    return atoms;
  }

  /* -------- recursive size split -------- */
  const SEPS = ["\n\n\n", "\n\n", "\n", ". ", "; ", " "];
  function splitBySize(text, maxTokens, depth) {
    depth = depth || 0;
    if (tokens(text) <= maxTokens) return [text];
    const sep = SEPS[depth];
    if (sep === undefined) {
      const maxChars = maxTokens * 4, out = [];
      for (let i = 0; i < text.length; i += maxChars) out.push(text.slice(i, i + maxChars));
      return out;
    }
    const parts = text.split(sep);
    if (parts.length === 1) return splitBySize(text, maxTokens, depth + 1);
    const out = [];
    let cur = "";
    for (const p of parts) {
      const piece = cur ? cur + sep + p : p;
      if (tokens(piece) <= maxTokens) { cur = piece; }
      else {
        if (cur) out.push(cur);
        if (tokens(p) > maxTokens) { splitBySize(p, maxTokens, depth + 1).forEach((x) => out.push(x)); cur = ""; }
        else cur = p;
      }
    }
    if (cur) out.push(cur);
    return out;
  }

  /* -------- pack atoms into chunks (never across sections, never split tables) -------- */
  function buildRawChunks(sections, chunkSize) {
    const chunks = [];
    for (const sec of sections) {
      const atoms = sectionAtoms(sec);
      let cur = "";
      const push = () => { if (cur.trim()) { chunks.push({ heading: sec.heading, text: cur.trim(), table: false }); cur = ""; } };
      for (const a of atoms) {
        if (a.table) {
          push();
          chunks.push({ heading: sec.heading, text: a.text, table: true });
          continue;
        }
        for (const piece of splitBySize(a.text, chunkSize)) {
          const combined = cur ? cur + "\n\n" + piece : piece;
          if (tokens(combined) <= chunkSize) cur = combined;
          else { push(); cur = piece; }
        }
      }
      push();
    }
    return chunks;
  }

  /* -------- merge chunks under 60 tokens -------- */
  function mergeTiny(chunks) {
    const out = [];
    for (const c of chunks) {
      if (!c.table && tokens(c.text) < 60 && out.length) {
        out[out.length - 1].text += "\n\n" + c.text;
      } else {
        out.push({ heading: c.heading, text: c.text, table: c.table });
      }
    }
    if (out.length > 1 && !out[0].table && tokens(out[0].text) < 60) {
      out[1].text = out[0].text + "\n\n" + out[1].text;
      out.shift();
    }
    return out;
  }

  /* -------- overlap: carry previous tail from a word boundary -------- */
  function tailByTokens(text, ntok) {
    const nchars = ntok * 4;
    if (text.length <= nchars) return text.trim();
    let slice = text.slice(text.length - nchars);
    const sp = slice.indexOf(" ");
    if (sp > 0 && sp < slice.length - 1) slice = slice.slice(sp + 1);
    return slice.trim();
  }
  function applyOverlap(chunks, overlapTokens) {
    chunks.forEach((c, i) => {
      c.overlap = i === 0 || overlapTokens <= 0 ? "" : tailByTokens(chunks[i - 1].text, overlapTokens);
    });
    return chunks;
  }

  /* -------- render -------- */
  let els = null;
  let currentText = SAMPLE;

  function render(chunks, sections) {
    const overlapVal = +els.overlap.value;

    // left pane — bands over the text, overlap in amber
    els.raw.innerHTML = chunks.map((c, i) => {
      const cls = i % 2 ? "bandB" : "bandA";
      const ov = c.overlap ? `<span class="ov">${escapeHtml(c.overlap)} </span>` : "";
      return `<span class="band ${cls}">${ov}${escapeHtml(c.text)}</span>`;
    }).join("\n\n");

    // right pane — chunk cards
    els.chunks.innerHTML = chunks.map((c, i) => {
      const full = (c.overlap ? c.overlap + " " : "") + c.text;
      const preview = full.slice(0, 180);
      return `
        <article class="chunk-card">
          <div class="chunk-top">
            <span class="chunk-n">Chunk ${i + 1}</span>
            <span class="chunk-tok">${tokens(full)} tokens</span>
          </div>
          <div class="chunk-head">${escapeHtml(c.heading)}</div>
          <p class="chunk-preview">${escapeHtml(preview)}${full.length > 180 ? "…" : ""}</p>
          ${c.table ? '<span class="chunk-flag">table · kept whole</span>' : ""}
        </article>`;
    }).join("");

    // stats
    const avg = Math.round(
      chunks.reduce((s, c) => s + tokens((c.overlap ? c.overlap + " " : "") + c.text), 0) / (chunks.length || 1)
    );
    const secCount = sections.filter((s) => !s.synthetic).length;
    setStat("chunks", chunks.length);
    setStat("avg", avg);
    setStat("sections", secCount);
    setStat("overlap", overlapVal);
  }

  function setStat(key, val) {
    const el = els.stats.querySelector(`[data-stat="${key}"] .xs-val`);
    if (el) el.textContent = val;
  }

  function rechunk() {
    els.sizeVal.textContent = els.size.value;
    els.overlapVal.textContent = els.overlap.value;
    const sections = buildSections(currentText);
    let chunks = buildRawChunks(sections, +els.size.value);
    chunks = mergeTiny(chunks);
    applyOverlap(chunks, +els.overlap.value);
    render(chunks, sections);
  }

  /* -------- file handling (FileReader only — nothing is uploaded) -------- */
  const MAX_BYTES = 25 * 1024 * 1024;
  const MAX_PDF_PAGES = 60;
  let loadSeq = 0;

  function readAs(file, kind) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      if (kind === "buffer") reader.readAsArrayBuffer(file);
      else reader.readAsText(file);
    });
  }

  function kindOf(file) {
    const name = file.name || "", type = file.type || "";
    if (/\.pdf$/i.test(name) || type === "application/pdf") return "pdf";
    if (/\.docx$/i.test(name) || /wordprocessingml\.document/.test(type)) return "docx";
    if (/\.doc$/i.test(name) || type === "application/msword") return "doc";
    if (/\.(txt|md|markdown)$/i.test(name) || /^text\//.test(type)) return "text";
    return null;
  }

  async function readFile(file) {
    if (!file) return;
    const note = (msg) => { els.dropNote.textContent = msg; };
    const kind = kindOf(file);
    if (!kind) return note("That file type isn't supported. Drop a PDF, a Word .docx, or a .txt / .md file.");
    if (kind === "doc") return note("That's the old Word .doc format. Save it as .docx or PDF and drop it again.");
    if (file.size > MAX_BYTES) return note("That file is over 25 MB. Try a smaller one.");

    const job = ++loadSeq;
    note(`Reading ${file.name}…`);
    try {
      let text, detail = "";
      if (kind === "text") {
        text = String(await readAs(file, "text"));
      } else if (kind === "docx") {
        text = await docxToText(await readAs(file, "buffer"));
      } else {
        const out = await pdfToText(await readAs(file, "buffer"));
        text = out.text;
        detail = out.pages > out.read
          ? ` · first ${out.read} of ${out.pages} pages`
          : ` · ${out.pages} page${out.pages === 1 ? "" : "s"}`;
      }
      if (job !== loadSeq) return;                 // a newer file was dropped meanwhile
      if (text.replace(/\s/g, "").length < 20) {
        return note(kind === "pdf"
          ? `${file.name} has no text layer — it is probably a scan. A chatbot would need OCR before it could read a word of it, and that is where most pipelines quietly lose scanned documents.`
          : `No readable text found in ${file.name}.`);
      }
      currentText = text;
      note(`Loaded: ${file.name}${detail}`);
      rechunk();
    } catch (err) {
      if (job !== loadSeq) return;
      console.warn("[x-ray]", err);
      note(describeError(err, kind, file.name));
    }
  }

  function describeError(err, kind, name) {
    if (err && err.name === "PasswordException") return `${name} is password-protected. Remove the password and try again.`;
    if (err && err.code === "NO_DECOMPRESSOR") return "This browser can't unzip Word files. Try a recent Chrome, Edge, Firefox or Safari, or save the file as PDF.";
    if (err && err.code === "PDF_READER") return "The PDF reader didn't load. Check your connection and try again.";
    if (kind === "docx") return `${name} couldn't be read as a Word document.`;
    if (kind === "pdf") return `${name} couldn't be read as a PDF.`;
    return `${name} couldn't be read.`;
  }

  /* -------- Word (.docx) — a zip of XML, unzipped right here -------- */
  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === "undefined") {
      const e = new Error("DecompressionStream unavailable");
      e.code = "NO_DECOMPRESSOR";
      throw e;
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  // Reads the zip's central directory and inflates only the entries asked for.
  async function unzip(buffer, wanted) {
    const dv = new DataView(buffer), utf8 = new TextDecoder(), out = new Map();
    let eocd = -1;
    for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("not a zip file");
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    for (let k = 0; k < count && dv.getUint32(p, true) === 0x02014b50; k++) {
      const method = dv.getUint16(p + 10, true);
      const size = dv.getUint32(p + 20, true);
      const nameLen = dv.getUint16(p + 28, true);
      const extraLen = dv.getUint16(p + 30, true);
      const commentLen = dv.getUint16(p + 32, true);
      const local = dv.getUint32(p + 42, true);
      const name = utf8.decode(new Uint8Array(buffer, p + 46, nameLen));
      if (wanted.includes(name)) {
        const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
        const raw = new Uint8Array(buffer, start, size);
        out.set(name, utf8.decode(method === 0 ? raw : await inflateRaw(raw)));
      }
      p += 46 + nameLen + extraLen + commentLen;
    }
    return out;
  }

  const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const wAttr = (el, name) => (el ? el.getAttributeNS(W_NS, name) || el.getAttribute("w:" + name) : null);
  const wChild = (el, name) => (el ? Array.from(el.children).find((c) => c.localName === name) : undefined);

  async function docxToText(buffer) {
    const files = await unzip(buffer, ["word/document.xml", "word/styles.xml"]);
    const parse = (xml) => {
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      if (doc.getElementsByTagName("parsererror").length) throw new Error("malformed XML");
      return doc;
    };
    if (!files.has("word/document.xml")) throw new Error("no word/document.xml");

    // styleId → style name, so a heading is still found when Word has
    // localised the id ("Überschrift1") but kept the name ("heading 1").
    const styleNames = new Map();
    if (files.has("word/styles.xml")) {
      for (const s of parse(files.get("word/styles.xml")).getElementsByTagNameNS(W_NS, "style")) {
        styleNames.set(wAttr(s, "styleId"), (wAttr(wChild(s, "name"), "val") || "").toLowerCase());
      }
    }

    const body = parse(files.get("word/document.xml")).getElementsByTagNameNS(W_NS, "body")[0];
    const blocks = [];
    if (body) walkBlocks(body, blocks, styleNames);
    return blocks.join("\n\n");
  }

  // Deleted tracked changes, field codes and the fallback copy of a text box
  // are in the XML but not on the page, so they are not read.
  const SKIP = new Set(["pPr", "rPr", "del", "delText", "instrText", "moveFrom", "Fallback"]);
  function inlineText(node) {
    let s = "";
    for (const c of node.children) {
      const n = c.localName;
      if (n === "t") s += c.textContent;
      else if (n === "tab" || n === "br" || n === "cr") s += " ";
      else if (n === "noBreakHyphen") s += "-";
      else if (!SKIP.has(n)) s += inlineText(c);
    }
    return s;
  }

  function headingLevel(p, styleNames) {
    const pPr = wChild(p, "pPr");
    if (!pPr) return 0;
    const id = wAttr(wChild(pPr, "pStyle"), "val") || "";
    const name = styleNames.get(id) || id.toLowerCase();
    const m = /^heading\s*(\d)/.exec(name);
    if (m) return +m[1];
    if (name === "title") return 1;
    const outline = wAttr(wChild(pPr, "outlineLvl"), "val");
    if (outline && +outline < 9) return +outline + 1;
    return 0;
  }

  function walkBlocks(node, out, styleNames) {
    for (const c of node.children) {
      const n = c.localName;
      if (n === "p") {
        const text = inlineText(c).replace(/\s+/g, " ").trim();
        if (!text) continue;
        const level = headingLevel(c, styleNames);
        const listItem = !level && wChild(wChild(c, "pPr"), "numPr");
        if (level) out.push("#".repeat(Math.min(level, 6)) + " " + text);
        else if (listItem && out.lastWasList) out[out.length - 1] += "\n- " + text;   // keep a list together
        else out.push(listItem ? "- " + text : text);
        out.lastWasList = Boolean(listItem);
      } else if (n === "tbl") {
        const table = tableText(c, styleNames);
        if (table) out.push(table);
        out.lastWasList = false;
      } else if (n === "sdt" || n === "sdtContent" || n === "customXml" || n === "ins" || n === "moveTo" || n === "smartTag") {
        walkBlocks(c, out, styleNames);
      }
    }
  }

  // Rows become a markdown table so the chunker keeps it whole. A one-column
  // table is almost always a layout box, so it is read as plain paragraphs.
  function tableText(tbl, styleNames) {
    const rows = [];
    for (const tr of tbl.children) {
      if (tr.localName !== "tr") continue;
      const cells = [];
      for (const tc of tr.children) {
        if (tc.localName !== "tc") continue;
        const parts = [];
        walkBlocks(tc, parts, styleNames);
        cells.push(parts.map((t) => t.replace(/^(#+|-) /gm, "")).join(" ").replace(/\|/g, "/").replace(/\s+/g, " ").trim());
      }
      if (cells.some(Boolean)) rows.push(cells);
    }
    if (!rows.length) return "";
    const width = Math.max(...rows.map((r) => r.length));
    if (width === 1) return rows.map((r) => r[0]).join("\n\n");
    return markdownTable(rows, width);
  }

  function markdownTable(rows, width) {
    const line = (cells) => "| " + cells.concat(Array(width - cells.length).fill("")).join(" | ") + " |";
    return [line(rows[0]), line(Array(width).fill("---")), ...rows.slice(1).map(line)].join("\n");
  }

  /* -------- PDF — read by pdf.js, fetched from this site on first use -------- */
  let pdfjsLoading = null;
  function loadPdfjs() {
    if (!pdfjsLoading) {
      const base = new URL("assets/vendor/pdfjs/", document.baseURI);
      pdfjsLoading = import(new URL("pdf.min.js", base).href).then((lib) => {
        lib.GlobalWorkerOptions.workerSrc = new URL("pdf.worker.min.js", base).href;
        return lib;
      }).catch(() => {
        pdfjsLoading = null;                          // let the next drop try again
        const e = new Error("PDF reader failed to load");
        e.code = "PDF_READER";
        throw e;
      });
    }
    return pdfjsLoading;
  }

  async function pdfToText(buffer) {
    const lib = await loadPdfjs();
    const task = lib.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false });
    try {
      const pdf = await task.promise;
      const pages = pdf.numPages, read = Math.min(pages, MAX_PDF_PAGES);
      const lines = [];
      for (let i = 1; i <= read; i++) {
        const page = await pdf.getPage(i);
        pdfLines((await page.getTextContent()).items, i, lines);
        page.cleanup();
      }
      return { text: linesToText(lines), pages, read };
    } finally {
      task.destroy();                                 // frees the worker, even on a bad or locked file
    }
  }

  // A PDF is positioned text, not paragraphs. Group runs into lines by their
  // baseline; a wide gap inside a line starts a new cell.
  function pdfLines(items, page, out) {
    let cur = null;
    const flush = () => { if (cur) out.push(cur); cur = null; };
    for (const it of items) {
      if (typeof it.str !== "string" || !it.str.trim()) continue;
      const x = it.transform[4], y = it.transform[5];
      const h = Math.abs(it.height || it.transform[3]) || 1;
      if (!cur || Math.abs(y - cur.y) > 0.5 * Math.max(h, cur.h)) {
        flush();
        cur = { page, y, h, cells: [it.str], end: x + it.width };
        continue;
      }
      const gap = x - cur.end;
      if (gap > 1.5 * Math.max(h, cur.h)) {
        cur.cells.push(it.str);
      } else {
        const last = cur.cells.length - 1;
        const space = gap > 0.12 * h && !/\s$/.test(cur.cells[last]) && !/^\s/.test(it.str);
        cur.cells[last] += (space ? " " : "") + it.str;
      }
      cur.end = Math.max(cur.end, x + it.width);
      cur.h = Math.max(cur.h, h);
    }
    flush();
  }

  const PAGE_NUMBER = /^(page\s+)?[-–—]?\s*\d{1,4}\s*[-–—]?(\s*(of|\/)\s*\d{1,4})?$/i;

  // Lines → markdown-ish text the chunker already understands: larger type
  // becomes a heading, a bigger vertical gap starts a paragraph, rows that
  // line up into columns become a table, and page numbers are dropped.
  function linesToText(lines) {
    if (!lines.length) return "";
    const median = (a) => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
    const body = median(lines.map((l) => l.h));
    const gaps = [];
    for (let i = 1; i < lines.length; i++) {
      const g = lines[i - 1].y - lines[i].y;
      if (lines[i].page === lines[i - 1].page && g > 0) gaps.push(g);
    }
    const lineGap = gaps.length ? median(gaps) : body * 1.3;

    const blocks = [];
    let para = [], table = [];
    const endPara = () => {
      if (para.length) blocks.push(para.reduce((acc, l) =>
        /[A-Za-z]-$/.test(acc) && /^[a-z]/.test(l) ? acc.slice(0, -1) + l : acc + " " + l));
      para = [];
    };
    const endTable = () => {
      if (table.length > 1) blocks.push(markdownTable(table, Math.max(...table.map((r) => r.length))));
      else if (table.length === 1) blocks.push(table[0].join(" "));
      table = [];
    };

    lines.forEach((ln, i) => {
      const prev = lines[i - 1], next = lines[i + 1];
      const cells = ln.cells.map((c) => c.replace(/\s+/g, " ").trim().replace(/\|/g, "/")).filter(Boolean);
      const text = cells.join(" ");
      const edgeOfPage = !prev || prev.page !== ln.page || !next || next.page !== ln.page;
      if (edgeOfPage && PAGE_NUMBER.test(text)) return;

      if (cells.length > 1) { endPara(); table.push(cells); return; }
      endTable();

      const level = text.length <= 100 ? (ln.h >= body * 1.6 ? 1 : ln.h >= body * 1.2 ? 2 : 0) : 0;
      if (level) { endPara(); blocks.push("#".repeat(level) + " " + text); return; }

      // A paragraph carries over a page break unless the last line finished a sentence.
      const newPara = !prev ||
        (prev.page !== ln.page ? /[.!?:)"”]$/.test(para[para.length - 1] || ".") : prev.y - ln.y > lineGap * 1.45);
      if (newPara) endPara();
      para.push(text);
    });
    endTable();
    endPara();
    return blocks.join("\n\n");
  }

  /* -------- build UI -------- */
  function buildUI(root) {
    root.innerHTML = `
      <div class="xray-badge">
        <span class="xray-lock">●</span>
        Your file never leaves your browser. Open your network tab and check: nothing is uploaded.
      </div>

      <div class="xray-controls">
        <div class="xray-slider">
          <label for="xr-size">Chunk size <b id="xr-size-val"></b> tokens</label>
          <input id="xr-size" type="range" min="200" max="1200" step="50" value="500" />
        </div>
        <div class="xray-slider">
          <label for="xr-overlap">Overlap <b id="xr-overlap-val"></b> tokens</label>
          <input id="xr-overlap" type="range" min="0" max="200" step="10" value="60" />
        </div>
      </div>

      <div class="xray-stats" id="xr-stats">
        <div class="xs" data-stat="chunks"><span class="xs-val">–</span><span class="xs-key">chunks</span></div>
        <div class="xs" data-stat="avg"><span class="xs-val">–</span><span class="xs-key">avg tokens</span></div>
        <div class="xs" data-stat="sections"><span class="xs-val">–</span><span class="xs-key">sections</span></div>
        <div class="xs" data-stat="overlap"><span class="xs-val">–</span><span class="xs-key">overlap</span></div>
      </div>

      <div class="xray-drop" id="xr-drop" tabindex="0" role="button" aria-label="Drop a PDF, Word, text or markdown file, or activate to browse">
        <p class="xray-drop-title">Drop a <b>PDF</b>, <b>Word</b>, <b>.txt</b> or <b>.md</b> file here, or click to choose one</p>
        <p class="xray-drop-note" id="xr-drop-note">Using the fictional sample SOP. Drop your own to see it chunked.</p>
        <div class="xray-drop-actions">
          <button type="button" class="btn btn-ghost" id="xr-reset">Reset sample</button>
          <input type="file" id="xr-file" accept=".pdf,.docx,.txt,.md,.markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" hidden />
        </div>
      </div>

      <div class="xray-panes">
        <div class="xray-pane">
          <div class="xray-pane-head">The document, cut into pieces</div>
          <div class="xray-raw" id="xr-raw"></div>
        </div>
        <div class="xray-pane">
          <div class="xray-pane-head">The chunks an AI would store</div>
          <div class="xray-chunks" id="xr-chunks"></div>
        </div>
      </div>`;

    els = {
      size: root.querySelector("#xr-size"),
      overlap: root.querySelector("#xr-overlap"),
      sizeVal: root.querySelector("#xr-size-val"),
      overlapVal: root.querySelector("#xr-overlap-val"),
      stats: root.querySelector("#xr-stats"),
      drop: root.querySelector("#xr-drop"),
      dropNote: root.querySelector("#xr-drop-note"),
      file: root.querySelector("#xr-file"),
      reset: root.querySelector("#xr-reset"),
      raw: root.querySelector("#xr-raw"),
      chunks: root.querySelector("#xr-chunks"),
    };

    els.size.addEventListener("input", rechunk);
    els.overlap.addEventListener("input", rechunk);

    els.reset.addEventListener("click", () => {
      currentText = SAMPLE;
      els.dropNote.textContent = "Using the fictional sample SOP. Drop your own to see it chunked.";
      rechunk();
    });

    els.file.addEventListener("change", (e) => readFile(e.target.files[0]));
    els.drop.addEventListener("click", () => els.file.click());
    els.drop.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); els.file.click(); }
    });
    ["dragenter", "dragover"].forEach((ev) =>
      els.drop.addEventListener(ev, (e) => { e.preventDefault(); els.drop.classList.add("over"); })
    );
    ["dragleave", "drop"].forEach((ev) =>
      els.drop.addEventListener(ev, (e) => { e.preventDefault(); els.drop.classList.remove("over"); })
    );
    els.drop.addEventListener("drop", (e) => {
      const f = e.dataTransfer && e.dataTransfer.files[0];
      readFile(f);
    });

    rechunk();
  }

  /* -------- lazy init -------- */
  let initialised = false;
  function init() {
    if (initialised) return;
    const root = document.getElementById("xray-sandbox");
    if (!root) return;
    initialised = true;
    buildUI(root);
  }
  function setup() {
    const root = document.getElementById("xray-sandbox");
    if (!root) return;
    let done = false, io = null;
    const near = () => {
      const r = root.getBoundingClientRect();
      return r.top < (window.innerHeight || 800) + 300 && r.bottom > -300;
    };
    const cleanup = () => {
      if (io) io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    const go = () => { if (done) return; done = true; cleanup(); init(); };
    const onScroll = () => { if (near()) go(); };
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) go(); }), { rootMargin: "250px" });
      io.observe(root);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    if (near()) go();
  }

  window.addEventListener("page:rendered", setup);
})();
