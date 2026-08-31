/* =========================================================================
   Sandbox 2 — "See your document the way an AI does"

   Structure-aware chunking, live, entirely in the browser.
   FileReader only — there is deliberately NO fetch() anywhere in this file.
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

  /* -------- file handling (FileReader only) -------- */
  function readFile(file) {
    if (!file) return;
    const okName = /\.(txt|md|markdown)$/i.test(file.name);
    const okType = !file.type || /text\//.test(file.type);
    if (!okName && !okType) {
      els.dropNote.textContent = "Please drop a .txt or .md file.";
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      currentText = String(e.target.result || "");
      els.dropNote.textContent = `Loaded: ${file.name}`;
      rechunk();
    };
    reader.readAsText(file);
  }

  /* -------- build UI -------- */
  function buildUI(root) {
    root.innerHTML = `
      <div class="xray-badge">
        <span class="xray-lock">●</span>
        Your file never leaves your browser. Open your network tab and check.
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

      <div class="xray-drop" id="xr-drop" tabindex="0" role="button" aria-label="Drop a .txt or .md file, or activate to browse">
        <p class="xray-drop-title">Drop a <b>.txt</b> or <b>.md</b> file here</p>
        <p class="xray-drop-note" id="xr-drop-note">Using the fictional sample SOP. Drop your own to see it chunked.</p>
        <div class="xray-drop-actions">
          <button type="button" class="btn btn-ghost" id="xr-reset">Reset sample</button>
          <input type="file" id="xr-file" accept=".txt,.md,.markdown,text/plain" hidden />
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
