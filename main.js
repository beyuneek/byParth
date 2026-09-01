/* =========================================================================
   byparth.in — main.js

   A film in eight acts. Each ACT is a tall scroll track holding a pinned,
   full-screen stage. A single rAF loop writes scroll progress (0→1) into
   --p on each act; the CSS reads --p and moves everything. Nothing scrolls
   past you — it transforms in place.

   All copy lives in CONTENT. No libraries. No network calls.
   ========================================================================= */

const CONTENT = {
  meta: {
    name: "Parth Sharma",
    role: "AI Engineer — Chatbots & RAG Systems",
    location: "Panchkula, India",
    email: "hello@byparth.in",
    phone: "+91 76268 92689",
    phoneHref: "tel:+917626892689",
    linkedinUrl: "https://www.linkedin.com/in/parth-sharma-5b97a21b8",
    linkedin: "linkedin.com/in/parth-sharma-5b97a21b8",
    githubUrl: "https://github.com/beyuneek",
    github: "github.com/beyuneek",
  },

  nav: {
    links: [
      { label: "The assistant", href: "#answer" },
      { label: "How it works",  href: "#pipeline" },
      { label: "Live demo",     href: "#craft" },
      { label: "Ask me",        href: "#ask" },
    ],
    cta: { label: "Get in touch", href: "#contact" },
  },

  /* ---- ACT 0 — title card ---- */
  title: {
    eyebrow: "AI Engineer — Chatbots & RAG Systems",
    name: "Parth Sharma",
    place: "Panchkula, India",
    portraitAlt: "Parth Sharma.",
    cue: "scroll",
  },

  /* ---- ACT 1 — the problem, revealed line by line ---- */
  problem: {
    kicker: "01 — the problem",
    lines: [
      "The answer is already",
      "written down.",
      "Nobody can find it.",
    ],
    close: "Years of documents. Five departments. Half an hour to answer one question — or you give up and ask a colleague.",
  },

  /* ---- ACT 2 — the answer: live assistant ---- */
  answer: {
    kicker: "02 — the answer",
    line: "So I built the thing that reads them.",
    note: "A chatbot over your own files. Ask in plain language, get the clause — and the document it came from.",
    demo: {
      title: "Company Knowledge Assistant",
      sub: "answers from your files — nothing leaves your servers",
      turns: [
        { q: "Where's the latest fire-safety SOP?",
          a: "Section 4 of <b>SOP-114 (rev. 3)</b>. It supersedes the 2023 version.",
          src: "SOP-114.pdf" },
        { q: "Which supplier contracts renew this quarter?",
          a: "Three — <b>Meridian, Alta, Brookline</b>. All auto-renew unless cancelled 30 days prior.",
          src: "contracts/Q3.xlsx" },
        { q: "Does the tender allow substitute materials?",
          a: "Yes — <b>clause 7.2</b> permits equivalents with prior written approval.",
          src: "tender-2024.pdf · p.212" },
        { q: "How many spare rollers do we keep on site?",
          a: "That isn't in any document I've been given. I'd rather say so than guess.",
          src: null },
      ],
    },
  },

  /* ---- ACT 3 — THE PIPELINE: how a document chatbot actually works ---- */
  pipeline: {
    kicker: "03 — how it works",
    line: "How a document chatbot actually works.",
    note: "Five steps, in order. Most people never see them. Keep scrolling.",
    chapters: [
      {
        n: "01",
        tag: "YOUR FILES",
        title: "It starts with what you already have.",
        body: "Manuals, contracts, SOPs, policies, old email threads. Nothing gets rewritten and nothing gets re-organised — the assistant reads them as they are.",
        pills: ["PDF", "DOCX", "SPREADSHEETS", "SCANS"],
      },
      {
        n: "02",
        tag: "CUT INTO PIECES",
        title: "Documents are too big to read at once.",
        body: "So each one is cut into passages — at headings and clause numbers, never in the middle of a sentence, and never through a table. This is the step that decides whether every later answer is right or wrong.",
        pills: ["SPLIT AT HEADINGS", "KEEP TABLES WHOLE", "OVERLAP THE EDGES"],
      },
      {
        n: "03",
        tag: "TURNED INTO MEANING",
        title: "Each passage becomes a position.",
        body: "Every passage is converted into a long list of numbers that captures what it is about. Passages about the same thing land near each other — even when they use completely different words for it.",
        pills: ["EMBEDDINGS", "VECTOR INDEX", "MEANING, NOT KEYWORDS"],
      },
      {
        n: "04",
        tag: "THE QUESTION FINDS THEM",
        title: "Your question goes into the same space.",
        body: "It lands wherever its meaning belongs, and the nearest passages get pulled back — usually the best three. A keyword search runs alongside it, so exact terms like a part number are never missed.",
        pills: ["HYBRID SEARCH", "TOP 3 PASSAGES", "RE-RANKED"],
      },
      {
        n: "05",
        tag: "THE ANSWER, WITH RECEIPTS",
        title: "The answer is written from those passages only.",
        body: "Nothing else. Each claim carries the document it came from, so anyone can check it in one click — and when the passages do not contain the answer, the honest reply is that they do not.",
        pills: ["CITED", "CHECKABLE", "ADMITS THE GAPS"],
      },
    ],
    close: "That is the whole machine. The next two sections let you run two of these steps yourself.",
  },

  /* ---- ACT 4 — the craft: step 02, live ---- */
  craft: {
    kicker: "04 — step 02, for real",
    line: "Cut it wrong, and every answer is wrong.",
    note: "This is step 02 above, running on a real document. Drag the sliders — or drop in a file of your own. It never leaves your browser.",
  },

  /* ---- ACT 5 — interrogate me ---- */
  ask: {
    kicker: "05 — steps 04 and 05, for real",
    line: "Ask this page anything.",
    note: "A working assistant whose entire document set is this page. It searches, cites what it found — and tells you honestly when the answer isn't here.",
    placeholder: "chatbots · what he builds · where he's worked…",
    suggestions: [
      "What kind of chatbots does he build?",
      "Can it run on our own servers?",
      "Has he worked outside India?",
      "What's he building right now?",
    ],
  },

  /* ---- ACT 6 — what I build ---- */
  build: {
    kicker: "06 — what I build",
    items: [
      { n: "01", title: "AI chatbots & assistants",    note: "A chatbot that answers from your own documents, cites where it got it, and admits when it doesn't know instead of inventing." },
      { n: "02", title: "Document AI over your files", note: "Contracts, SOPs and manuals made answerable — running on infrastructure you control, not a public AI service." },
      { n: "03", title: "Internal tools & dashboards", note: "The spreadsheet your team runs by hand, built properly and deployed." },
      { n: "04", title: "Web applications",            note: "Interface to deployment. Accessible by default, built to be handed over." },
    ],
  },

  /* ---- ACT 7 — the record. Deliberately quiet: names, roles, places.
         No achievement bullets, no logos, no timeline graphics. ---- */
  record: {
    kicker: "07 — the record",
    line: "Where I've worked, and what I studied.",
    columns: [
      {
        head: "Where I've worked",
        entries: [
          { org: "Aebocode Technologies Pvt. Ltd.", place: "Panchkula, India",
            role: "AI & Data Security Engineer", now: true },
          { org: "Ministry of Electronics & IT — STQC / ERTL Lab", place: "New Delhi",
            role: "Software Testing Intern" },
          { org: "Aebocode Technologies Pvt. Ltd.", place: "remote",
            role: "Software Engineer" },
          { org: "WIMTACH, Centennial College", place: "Toronto, Canada",
            role: "Front-End Developer" },
        ],
      },
      {
        head: "Education",
        entries: [
          { org: "Software Engineering Technology", place: "Centennial College, Toronto, Canada",
            role: "Graduated." },
          { org: "Brock University", place: "Ontario, Canada",
            role: "Two years of study before transferring." },
          { org: "BE, Computer Science & Engineering", place: "Chitkara University, Punjab",
            role: "Completed." },
        ],
      },
      {
        head: "Training",
        entries: [
          { org: "CodersReady, India", place: "alongside my degree",
            role: "Cloud computing and DevOps — AWS, Azure, CI/CD, Docker" },
          { org: "", place: "",
            role: "Data science with Python — data analysis, machine learning, NLP" },
        ],
      },
    ],
  },

  /* ---- ACT 8 — the invitation ---- */
  contact: {
    kicker: "08",
    line: "Tell me the problem.",
    note: "Not the solution. I'll tell you honestly whether it's something I should build, something you should buy, or something you don't need at all.",
    formAction: "https://formspree.io/f/xqpkpplz",
    selectOptions: [
      "An AI chatbot or assistant",
      "Document AI over our own files",
      "Internal tool or dashboard",
      "Web application",
      "Something else",
    ],
    messagePlaceholder: "A couple of sentences is plenty. What's the problem, and what does done look like?",
    based: "Panchkula, India · works across time zones",
  },

  footer: {
    copyright: "© " + new Date().getFullYear() + " Parth Sharma",
    handbuilt: "Hand-built. No template, no page builder.",
    logoAlt: "By Parth — Connect · Build · Perfect",
  },

  /* Passages the ask-box indexes (kept here so search and page share one source). */
  index: [
    { title: "Profile", href: "#title",
      text: "Parth Sharma, AI Engineer, based in Panchkula, India. I build chatbots and retrieval systems — assistants that answer questions from a company's own documents and cite the file every answer came from." },
    { title: "Who I am", href: "#title",
      text: "I'm based in Panchkula. I build chatbots that answer from a company's own documents — the kind of problem where getting the answer right matters far more than sounding clever, and where a confident wrong answer is worse than no answer." },
    { title: "Who I am", href: "#title",
      text: "I studied in Ontario and Toronto before coming back to India. At Centennial College I built an accessible web platform for students with disabilities, which is where I learned that software is judged by whether the person in front of it can actually use it." },
    { title: "What I'm building now", href: "#answer",
      text: "Right now I build retrieval systems and chatbots over confidential company documentation. I like problems where the constraint is real — where the easy answer is off the table because the data isn't allowed to leave the building." },
    { title: "Case study — the problem", href: "#answer",
      text: "A drone and UAV manufacturer had years of documentation spread across five departments. Managers spent up to half an hour hunting through shared folders for a single answer, and often gave up and asked a colleague instead." },
    { title: "Case study — what I built", href: "#answer",
      text: "An internal knowledge assistant, on my own, end to end: document ingestion across all five departments, hybrid keyword-plus-vector retrieval, authentication with department-level access control, and a chat interface. Every answer cites the document it came from." },
    { title: "Case study — the result", href: "#answer",
      text: "Department heads now query years of documentation in plain language and get a sourced answer in seconds. Much of the work was retrieval quality: fixing how documents were chunked, tuning how many passages get retrieved, and enforcing strict source attribution so the system stops inventing answers." },
    { title: "Case study — the constraint", href: "#answer",
      text: "None of those documents could go to a third-party cloud service. That single requirement decided the architecture, and it is the requirement most document-AI projects discover too late. The whole system runs on infrastructure the company controls." },
    { title: "Running on your own servers", href: "#pipeline",
      text: "Yes, it can run entirely on your own servers. Self-hosted document AI means your contracts, SOPs and manuals are never sent to a public AI service, and you can show an auditor exactly where the data went. This is the setup I build most often." },
    { title: "How a document chatbot works", href: "#pipeline",
      text: "A document chatbot works in five steps: your files are collected, cut into passages, converted into embeddings that capture meaning, searched with a hybrid of keyword and vector retrieval when a question arrives, and finally answered using only the retrieved passages, with a citation for each one." },
    { title: "Document chunking", href: "#craft",
      text: "When a system reads your documents, the first thing it does is cut them into pieces. Get that wrong and every answer afterwards is wrong too — a paragraph split in half, a clause that lost the heading giving it meaning, a table turned into noise." },
    { title: "Service — AI chatbots and assistants", href: "#build",
      text: "AI chatbots and assistants. A chatbot that answers from your own documents, cites where it got the answer, and admits it does not know rather than inventing something plausible." },
    { title: "Service — Document AI over your files", href: "#build",
      text: "Document AI over your files. Contracts, SOPs, manuals and policies made answerable, with source citations, running on infrastructure you control rather than a public AI service." },
    { title: "Service — Internal tools & dashboards", href: "#build",
      text: "Internal tools and dashboards. The custom app your team is currently doing by hand in spreadsheets, built properly and deployed." },
    { title: "Service — Web applications", href: "#build",
      text: "Web applications. Front to back: interface, data layer, deployment. Accessible by default, built to be handed over rather than to depend on me." },
    { title: "Aebocode Technologies Pvt. Ltd.", href: "#record",
      text: "I currently work at Aebocode Technologies Pvt. Ltd. in Panchkula, India, as AI & Data Security Engineer, building chatbots and retrieval systems over company documentation. Earlier I was a Software Engineer at Aebocode, remote." },
    { title: "Ministry of Electronics & IT — STQC / ERTL Lab", href: "#record",
      text: "Software Testing Intern at the Ministry of Electronics and IT, STQC / ERTL Lab, New Delhi." },
    { title: "WIMTACH, Centennial College", href: "#record",
      text: "Front-End Developer at WIMTACH, Centennial College, Toronto, Canada — building an accessible web platform for students with disabilities." },
    { title: "Education", href: "#record",
      text: "I graduated in Software Engineering Technology from Centennial College in Toronto, Canada. Before that I studied two years at Brock University in Ontario, Canada, then transferred. I also completed a BE in Computer Science & Engineering at Chitkara University, Punjab." },
    { title: "Studying in Canada", href: "#record",
      text: "Yes — I studied and graduated in Canada. Two years at Brock University in Ontario, then Software Engineering Technology at Centennial College in Toronto, before coming back to India." },
    { title: "Training", href: "#record",
      text: "CodersReady, India, alongside my degree: cloud computing and DevOps — AWS, Azure, CI/CD, Docker. Data science with Python — data analysis, machine learning, NLP." },
    { title: "How to reach me", href: "#contact",
      text: "You can reach me by email at hello@byparth.in, by phone on +91 76268 92689, or through the contact form on this page. I'm based in Panchkula, India and work across time zones." },
  ],
};
window.CONTENT = CONTENT;

const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)");
const NO_HOVER = window.matchMedia("(hover: none)");

/* ---------------- helpers ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s) => escapeHtml(s).replace(/"/g, "&quot;");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* =========================================================================
   NAV + FOOTER
   ========================================================================= */
function renderNav() {
  const nav = $("#nav");
  const links = CONTENT.nav.links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("");
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="#title" aria-label="${escapeAttr(CONTENT.meta.name)} — top">
        <img src="assets/logo-icon.png" alt="" width="30" height="30" />
        <span>${CONTENT.meta.name}</span>
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <ul class="nav-links" id="nav-links">
        ${links}
        <li><a class="btn btn-primary" href="${CONTENT.nav.cta.href}">${CONTENT.nav.cta.label}</a></li>
      </ul>
    </div>`;

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $(".nav-toggle", nav), list = $("#nav-links", nav);
  toggle.addEventListener("click", () => {
    const open = list.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  list.addEventListener("click", (e) => {
    if (e.target.closest("a")) { list.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });
}

function renderFooter() {
  $("#footer").innerHTML = `
    <div class="footer-inner">
      <img class="footer-logo" src="assets/logo-full.png" alt="${escapeAttr(CONTENT.footer.logoAlt)}" width="360" height="360" loading="lazy" decoding="async" />
      <div class="footer-meta">
        <p>${CONTENT.footer.copyright}</p>
        <p class="handbuilt">${CONTENT.footer.handbuilt}</p>
      </div>
    </div>`;
}

/* =========================================================================
   ACTS
   ========================================================================= */

/* ACT 0 — the portrait. Hard light, deep shadow, slow push-in. */
function actTitle() {
  const t = CONTENT.title;
  $("#title").innerHTML = `
    <div class="pin">
      <canvas class="net" aria-hidden="true"></canvas>
      <div class="portrait" aria-hidden="true">
        <img src="assets/parth-portrait.jpg" alt="" width="880" height="1100"
             srcset="assets/parth-portrait-sm.jpg 560w, assets/parth-portrait.jpg 880w"
             sizes="(max-width: 760px) 100vw, 60vw"
             fetchpriority="high" decoding="async" />
        <span class="portrait-tone"></span>
        <span class="portrait-shadow"></span>
      </div>
      <div class="title-copy">
        <p class="kicker">${t.eyebrow}</p>
        <h1 class="title-name">
          <span class="w"><span>Parth</span></span>
          <span class="w"><span>Sharma</span></span>
        </h1>
        <p class="title-place">${t.place}</p>
      </div>
      <span class="portrait-credit">${escapeHtml(t.portraitAlt)}</span>
      <a class="cue" href="#problem"><span>${t.cue}</span><i></i></a>
    </div>`;
}

/* ACT 1 — the problem. Lines land one at a time, then the close fades up. */
function actProblem() {
  const p = CONTENT.problem;
  const lines = p.lines.map((l, i) =>
    `<span class="pl" style="--i:${i}"><span>${escapeHtml(l)}</span></span>`
  ).join("");
  // Scattered sheets — fixed pseudo-random positions so the pile looks natural.
  const spots = [
    [6, 12], [22, 62], [37, 8], [51, 44], [68, 18], [83, 70], [12, 82],
    [44, 76], [76, 38], [29, 30], [92, 52], [60, 88], [3, 46], [88, 6],
  ];
  const sheets = spots.map(([x, y], i) =>
    `<span class="sheet" style="--x:${x};--y:${y};--drift:${i - 7}"></span>`).join("");

  $("#problem").innerHTML = `
    <div class="pin">
      <div class="paper" aria-hidden="true">${sheets}</div>
      <div class="wrap">
        <p class="kicker">${p.kicker}</p>
        <h2 class="big-lines">${lines}</h2>
        <p class="close-line">${escapeHtml(p.close)}</p>
      </div>
    </div>`;
}

/* ACT 2 — the answer. The assistant, running. */
function actAnswer() {
  const a = CONTENT.answer;
  $("#answer").innerHTML = `
    <div class="pin">
      <div class="wrap stage-split">
        <div class="stage-copy">
          <p class="kicker">${a.kicker}</p>
          <h2 class="stage-line">${escapeHtml(a.line)}</h2>
          <p class="stage-note">${escapeHtml(a.note)}</p>
        </div>
        <div class="stage-art">
          <div class="chat" aria-hidden="true">
            <div class="chat-head">
              <img class="chat-ava" src="assets/logo-icon.png" alt="" width="30" height="30" loading="lazy" />
              <div class="chat-id">
                <span class="chat-title">${a.demo.title}</span>
                <span class="chat-sub">${a.demo.sub}</span>
              </div>
              <span class="chat-live">live</span>
            </div>
            <div class="chat-body" id="chat-body"></div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ACT 3 — the craft (document x-ray mounts here). */
function actCraft() {
  const c = CONTENT.craft;
  $("#craft").innerHTML = `
    <div class="pin pin-loose">
      <div class="wrap">
        <div class="act-head">
          <p class="kicker">${c.kicker}</p>
          <h2 class="stage-line">${escapeHtml(c.line)}</h2>
          <p class="stage-note">${escapeHtml(c.note)}</p>
        </div>
        <div id="xray-sandbox" class="xray"></div>
      </div>
    </div>`;
}

/* ACT 3 — THE PIPELINE.
   A pinned stage: one diagram in the middle that rebuilds itself as you
   scroll, and a chapter card beside it that swaps. Five chapters, driven
   entirely by --p. This is the section that explains the whole job without
   asking anyone to read a paragraph of jargon. */
function actPipeline() {
  const p = CONTENT.pipeline;
  const N = p.chapters.length;

  const cards = p.chapters.map((c, i) => `
    <article class="pchap" data-i="${i}" ${i === 0 ? "" : "aria-hidden='true'"}>
      <p class="pchap-tag"><span class="pchap-n">${c.n}</span> — ${escapeHtml(c.tag)}</p>
      <h3 class="pchap-title">${escapeHtml(c.title)}</h3>
      <p class="pchap-body">${escapeHtml(c.body)}</p>
      <ul class="pchap-pills">${c.pills.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </article>`).join("");

  const rail = p.chapters.map((c, i) =>
    `<button type="button" class="prail-dot" data-i="${i}" aria-label="Step ${c.n}: ${escapeAttr(c.tag)}"><span>${c.n}</span></button>`
  ).join("");

  $("#pipeline").innerHTML = `
    <div class="pin">
      <div class="wrap pipe-wrap">

        <header class="pipe-head">
          <p class="kicker">${p.kicker}</p>
          <h2 class="stage-line">${escapeHtml(p.line)}</h2>
          <p class="stage-note">${escapeHtml(p.note)}</p>
        </header>

        <div class="pipe-stage">
          <!-- THE DIAGRAM — five layers, cross-faded by scroll -->
          <div class="pipe-art" aria-hidden="true">
            ${pipeArt()}
            <span class="pipe-counter"><b class="pipe-cur">01</b><i>/ 0${N}</i></span>
          </div>

          <!-- THE CHAPTER CARD -->
          <div class="pipe-copy">
            <div class="pchap-deck">${cards}</div>
            <div class="prail" role="group" aria-label="Steps">${rail}</div>
          </div>
        </div>

        <p class="pipe-close">${escapeHtml(p.close)}</p>
      </div>
    </div>`;

  // Jumping via the rail: scroll to the point in the act where that chapter plays.
  const act = $("#pipeline");
  act.querySelectorAll(".prail-dot").forEach((b) => {
    b.addEventListener("click", () => {
      const i = +b.dataset.i;
      const span = act.offsetHeight - window.innerHeight;
      const target = act.offsetTop + span * ((i + 0.5) / N);
      window.scrollTo({ top: target, behavior: REDUCE.matches ? "auto" : "smooth" });
    });
  });
}

/* The diagram itself. One SVG, five states. Each state is a <g> that fades
   and slides; the previous state stays faintly visible so the machine looks
   like it is being assembled rather than replaced. */
function pipeArt() {
  // 01 — files landing in a stack
  const files = [0, 1, 2, 3, 4].map((i) =>
    `<g class="pa-file" style="--i:${i}">
       <rect x="${18 + i * 34}" y="${58 + (i % 2) * 18}" width="52" height="66" rx="4"/>
       <line x1="${28 + i * 34}" y1="${74 + (i % 2) * 18}" x2="${60 + i * 34}" y2="${74 + (i % 2) * 18}"/>
       <line x1="${28 + i * 34}" y1="${86 + (i % 2) * 18}" x2="${54 + i * 34}" y2="${86 + (i % 2) * 18}"/>
       <line x1="${28 + i * 34}" y1="${98 + (i % 2) * 18}" x2="${62 + i * 34}" y2="${98 + (i % 2) * 18}"/>
     </g>`).join("");

  // 02 — one document sliced into passages
  const slices = [0, 1, 2, 3, 4, 5].map((i) =>
    `<g class="pa-slice" style="--i:${i}">
       <rect x="70" y="${26 + i * 26}" width="180" height="20" rx="3"/>
     </g>`).join("");

  // 03 — passages become points, clustering by meaning
  const pts = [
    [62, 54], [88, 40], [74, 78], [128, 36], [150, 58], [136, 74],
    [196, 48], [220, 70], [206, 92], [96, 128], [70, 146], [118, 152],
    [176, 130], [206, 146], [242, 118], [150, 104], [44, 100], [248, 40],
  ];
  const dots = pts.map(([x, y], i) =>
    `<circle class="pa-dot" style="--i:${i}" cx="${x}" cy="${y}" r="4.5"/>`).join("");

  // 04 — the three that win
  const winners = [[128, 36], [150, 58], [136, 74]];
  const halo = winners.map(([x, y], i) =>
    `<circle class="pa-win" style="--i:${i}" cx="${x}" cy="${y}" r="11"/>`).join("");
  const beams = winners.map(([x, y], i) =>
    `<line class="pa-beam" style="--i:${i}" x1="150" y1="176" x2="${x}" y2="${y}"/>`).join("");

  return `
  <svg class="pa" viewBox="0 0 300 200" role="img" aria-label="How a document chatbot works, in five steps">

    <!-- 01 : your files -->
    <g class="pa-stage pa-1">${files}</g>

    <!-- 02 : cut into passages -->
    <g class="pa-stage pa-2">
      <rect class="pa-doc" x="62" y="14" width="196" height="176" rx="6"/>
      ${slices}
    </g>

    <!-- 03 : passages become positions -->
    <g class="pa-stage pa-3">
      <rect class="pa-space" x="24" y="12" width="252" height="164" rx="8"/>
      ${dots}
    </g>

    <!-- 04 : the question pulls the nearest three -->
    <g class="pa-stage pa-4">
      ${beams}
      ${halo}
      <g class="pa-q">
        <rect x="96" y="166" width="108" height="24" rx="12"/>
        <text x="150" y="182" text-anchor="middle">your question</text>
      </g>
    </g>

    <!-- 05 : the cited answer -->
    <g class="pa-stage pa-5">
      <rect class="pa-ans" x="46" y="44" width="208" height="112" rx="8"/>
      <line class="pa-ansline" style="--i:0" x1="66" y1="72"  x2="222" y2="72"/>
      <line class="pa-ansline" style="--i:1" x1="66" y1="90"  x2="234" y2="90"/>
      <line class="pa-ansline" style="--i:2" x1="66" y1="108" x2="196" y2="108"/>
      <g class="pa-cites">
        <rect x="66"  y="122" width="30" height="16" rx="3"/><text x="81"  y="134" text-anchor="middle">[1]</text>
        <rect x="104" y="122" width="30" height="16" rx="3"/><text x="119" y="134" text-anchor="middle">[2]</text>
        <rect x="142" y="122" width="30" height="16" rx="3"/><text x="157" y="134" text-anchor="middle">[3]</text>
      </g>
    </g>
  </svg>`;
}

/* Drive the pipeline: --p → which chapter is on screen. */
function initPipeline() {
  const act = $("#pipeline");
  if (!act) return;
  const chaps = [...act.querySelectorAll(".pchap")];
  const dots  = [...act.querySelectorAll(".prail-dot")];
  const cur   = $(".pipe-cur", act);
  const N = chaps.length;
  let shown = -1;

  function paint() {
    // Measure directly rather than reading --p back, so the chapter never
    // lags a frame behind the projector (and still works if rAF is throttled).
    const r = act.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    const p = span > 0 ? clamp(-r.top / span, 0, 1) : (r.top <= 0 ? 1 : 0);
    // Hold each chapter for an equal slice of the act.
    const i = clamp(Math.floor(p * N), 0, N - 1);
    if (i === shown) return;
    shown = i;
    act.dataset.chapter = String(i + 1);
    chaps.forEach((c, k) => {
      c.classList.toggle("is-on", k === i);
      c.setAttribute("aria-hidden", k === i ? "false" : "true");
    });
    dots.forEach((d, k) => {
      d.classList.toggle("is-on", k === i);
      d.classList.toggle("is-done", k < i);
    });
    if (cur) cur.textContent = String(i + 1).padStart(2, "0");
  }

  paint();
  window.addEventListener("scroll", paint, { passive: true });
  window.addEventListener("resize", paint);
}

/* ACT 5 — interrogate me (ask box mounts here). */
function actAsk() {
  const a = CONTENT.ask;
  const chips = a.suggestions.map((q) =>
    `<button class="chip" type="button" data-q="${escapeAttr(q)}">${escapeHtml(q)}</button>`).join("");
  $("#ask").innerHTML = `
    <div class="pin pin-loose">
      <div class="wrap">
        <div class="act-head">
          <p class="kicker">${a.kicker}</p>
          <h2 class="stage-line">${escapeHtml(a.line)}</h2>
          <p class="stage-note">${escapeHtml(a.note)}</p>
        </div>
        <div class="ask" id="ask-sandbox">
          <form class="ask-form" id="ask-form" autocomplete="off">
            <label class="sr-only" for="ask-input">Ask a question about Parth</label>
            <input id="ask-input" name="q" type="text" placeholder="${escapeAttr(a.placeholder)}" />
            <button class="btn btn-primary" id="ask-submit" type="submit">Ask</button>
          </form>
          <div class="ask-suggestions" id="ask-suggestions" aria-label="Suggested questions">${chips}</div>
          <div class="ask-answer" id="ask-answer" aria-live="polite"></div>
          <div class="ask-sources" id="ask-sources"></div>
        </div>
      </div>
    </div>`;
}

/* ACT 6 — what I build. Rows sweep in as the act plays. */
function actBuild() {
  const b = CONTENT.build;
  const rows = b.items.map((it, i) => `
    <li class="build-row" style="--i:${i}">
      <span class="build-n">${it.n}</span>
      <span class="build-title">${escapeHtml(it.title)}</span>
      <span class="build-note">${escapeHtml(it.note)}</span>
    </li>`).join("");
  $("#build").innerHTML = `
    <div class="pin">
      <div class="wrap">
        <p class="kicker">${b.kicker}</p>
        <ul class="build-list">${rows}</ul>
      </div>
    </div>`;
}

/* ACT 7 — the record. Three quiet lists. No cards, no logos, no timeline
   graphics, no achievement bullets — organisation, role, place, nothing more. */
function actRecord() {
  const r = CONTENT.record;
  const cols = r.columns.map((col) => {
    const rows = col.entries.map((e) => {
      // A blank org means this line continues the entry above it.
      if (!e.org) return `<li class="rec-row rec-cont"><span class="rec-role">${escapeHtml(e.role)}</span></li>`;
      return `
        <li class="rec-row">
          <span class="rec-org">${escapeHtml(e.org)}${e.now ? '<i class="rec-now">now</i>' : ""}</span>
          <span class="rec-role">${escapeHtml(e.role)}</span>
          <span class="rec-place">${escapeHtml(e.place)}</span>
        </li>`;
    }).join("");
    return `
      <section class="rec-col">
        <h3 class="rec-head">${escapeHtml(col.head)}</h3>
        <ul class="rec-list">${rows}</ul>
      </section>`;
  }).join("");

  $("#record").innerHTML = `
    <div class="pin pin-loose">
      <div class="wrap">
        <div class="act-head">
          <p class="kicker">${r.kicker}</p>
          <h2 class="stage-line">${escapeHtml(r.line)}</h2>
        </div>
        <div class="rec-grid">${cols}</div>
      </div>
    </div>`;
}

/* ACT 8 — the invitation. */
function actContact() {
  const c = CONTENT.contact;
  const opts = c.selectOptions.map((o) => `<option value="${escapeAttr(o)}">${escapeHtml(o)}</option>`).join("");
  $("#contact").innerHTML = `
    <div class="pin pin-loose">
      <div class="wrap end-wrap">
        <p class="kicker">${c.kicker}</p>
        <h2 class="end-line">${escapeHtml(c.line)}</h2>
        <p class="stage-note">${escapeHtml(c.note)}</p>
        <a class="end-mail" href="mailto:${escapeAttr(CONTENT.meta.email)}">${escapeHtml(CONTENT.meta.email)}</a>
        <a class="end-phone" href="${escapeAttr(CONTENT.meta.phoneHref)}">${escapeHtml(CONTENT.meta.phone)}</a>
        <div class="end-links">
          <a href="${escapeAttr(CONTENT.meta.linkedinUrl)}">${escapeHtml(CONTENT.meta.linkedin)}</a>
          <a href="${escapeAttr(CONTENT.meta.githubUrl)}">${escapeHtml(CONTENT.meta.github)}</a>
        </div>
        <form class="end-form" action="${escapeAttr(c.formAction)}" method="POST">
          <div class="ef-row">
            <input name="name" type="text" placeholder="Name" aria-label="Your name" required />
            <input name="email" type="email" placeholder="Email" aria-label="Your email" required />
          </div>
          <select name="topic" aria-label="What's this about?">${opts}</select>
          <textarea name="message" rows="3" aria-label="Message" placeholder="${escapeAttr(c.messagePlaceholder)}" required></textarea>
          <button class="btn btn-primary" type="submit">Send it →</button>
        </form>
        <p class="end-based">${escapeHtml(c.based)}</p>
      </div>
    </div>`;
}

function renderActs() {
  actTitle(); actProblem(); actAnswer(); actPipeline();
  actCraft(); actAsk(); actBuild(); actRecord(); actContact();
}

/* =========================================================================
   THE PROJECTOR — one rAF loop writes scroll progress into every act.
   ========================================================================= */
function initProjector() {
  const acts = [...document.querySelectorAll(".act")];
  acts.forEach((a) => {
    const len = +(a.dataset.len || 100);
    a.style.setProperty("--len", len);
    a.style.minHeight = len + "vh";   // fallback
    a.style.minHeight = len + "svh";  // preferred; ignored where unsupported
  });

  let ticking = false;
  function measure() {
    const vh = window.innerHeight;
    for (const act of acts) {
      const r = act.getBoundingClientRect();
      const span = r.height - vh;
      let p = span > 0 ? (-r.top) / span : (r.top <= 0 ? 1 : 0);
      p = clamp(p, 0, 1);
      act.style.setProperty("--p", p.toFixed(4));
      // Only paint the act that's on screen.
      act.classList.toggle("onstage", r.top < vh && r.bottom > 0);
    }
    ticking = false;
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(measure); } }

  measure();
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", () => { measure(); request(); });
}

/* =========================================================================
   THE NETWORK — persistent canvas behind the title card.
   ========================================================================= */
function initNet() {
  const canvas = $(".net");
  if (!canvas) return;
  const host = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, pts = [], raf = null, on = true;
  let mx = -9999, my = -9999;
  const LINK = 150, MOUSE = 200;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight;
    if (!W || !H) return;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = clamp(Math.round((W * H) / 14000), 20, 96);
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.26, vy: (Math.random() - 0.5) * 0.26,
      r: 1.1 + Math.random() * 1.3, ph: Math.random() * 6.283,
    }));
  }
  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          ctx.strokeStyle = "rgba(96,150,250," + (0.22 * (1 - Math.sqrt(d2) / LINK)).toFixed(3) + ")";
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const p of pts) {
      const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
      if (d2 < MOUSE * MOUSE) {
        ctx.strokeStyle = "rgba(53,208,232," + (0.45 * (1 - Math.sqrt(d2) / MOUSE)).toFixed(3) + ")";
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my); ctx.stroke();
      }
    }
    for (const p of pts) {
      const tw = 0.5 + 0.35 * Math.sin(now / 950 + p.ph);
      ctx.shadowColor = "rgba(53,208,232,0.8)"; ctx.shadowBlur = 7;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = "rgba(170,225,250," + tw.toFixed(3) + ")"; ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  function step(now) {
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
    }
    draw(now || 0);
    raf = requestAnimationFrame(step);
  }
  const start = () => { if (raf == null && on && !REDUCE.matches && !document.hidden && W) raf = requestAnimationFrame(step); };
  const stop = () => { if (raf != null) { cancelAnimationFrame(raf); raf = null; } };

  size();
  if (REDUCE.matches) { draw(0); return; }
  host.addEventListener("pointermove", (e) => {
    const r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
  });
  host.addEventListener("pointerleave", () => { mx = my = -9999; });
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { size(); if (raf == null) start(); }, 200); });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => es.forEach((e) => { on = e.isIntersecting; on ? start() : stop(); })).observe(host);
  }
  start();
}

/* =========================================================================
   THE ASSISTANT — auto-playing chat demo.
   ========================================================================= */
function initChatDemo() {
  const body = $("#chat-body");
  if (!body) return;
  const turns = CONTENT.answer.demo.turns;
  const strip = (h) => h.replace(/<[^>]+>/g, "");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let paused = false;

  const down = () => { body.scrollTop = body.scrollHeight; };
  function bubble(cls) { const b = document.createElement("div"); b.className = "bubble " + cls; body.appendChild(b); down(); return b; }

  if (REDUCE.matches) {
    const t = turns[0];
    bubble("user").textContent = t.q;
    bubble("bot").innerHTML = t.a + '<span class="cite-src">' + escapeHtml(t.src) + "</span>";
    return;
  }

  const hold = async () => { while (paused) await wait(180); };
  async function type(el, text, sp) {
    el.textContent = "";
    for (const ch of text) { await hold(); el.textContent += ch; down(); await wait(sp); }
  }
  async function run() {
    for (;;) {
      for (const t of turns) {
        await hold();
        await type(bubble("user"), t.q, 24);
        await wait(340); await hold();
        const dots = bubble("bot typing"); dots.innerHTML = "<span></span><span></span><span></span>"; down();
        await wait(900); await hold(); dots.remove();
        const a = bubble("bot");
        await type(a, strip(t.a), 17);
        a.innerHTML = t.a + '<span class="cite-src">' + escapeHtml(t.src) + "</span>"; down();
        await wait(2400);
        while (body.children.length > 4) body.removeChild(body.firstChild);
      }
      await wait(1000); body.innerHTML = "";
    }
  }
  document.addEventListener("visibilitychange", () => { paused = document.hidden; });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => es.forEach((e) => { paused = !e.isIntersecting; })).observe(body);
  }
  run();
}

/* =========================================================================
   THE CURSOR — a soft light that trails the pointer.
   ========================================================================= */
function initCursor() {
  const el = $("#cursor");
  if (!el || REDUCE.matches || NO_HOVER.matches) return;
  document.body.classList.add("has-cursor");
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY;
    const hot = e.target.closest("a,button,input,select,textarea,.chip,.vline,.build-row");
    el.classList.toggle("hot", !!hot);
  }, { passive: true });
  (function loop() {
    x += (tx - x) * 0.18; y += (ty - y) * 0.18;
    el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    requestAnimationFrame(loop);
  })();
}

/* =========================================================================
   CONTACT FORM SAFETY NET

   The form posts straight to Formspree. Until a real form ID is filled in,
   submitting would send the visitor to a Formspree error page — worse than
   having no form at all. So while the placeholder is still there we catch
   the submit and hand over the direct routes instead. The moment a real ID
   is pasted into CONTENT.contact.formAction this guard switches itself off.
   ========================================================================= */
function initContactForm() {
  const form = $(".end-form");
  if (!form) return;

  const action = form.getAttribute("action") || "";
  const notice = document.createElement("p");
  notice.className = "form-fallback";
  notice.hidden = true;
  form.appendChild(notice);

  const directRoutes =
    `Email me at <a href="mailto:${escapeAttr(CONTENT.meta.email)}">${escapeHtml(CONTENT.meta.email)}</a> ` +
    `or call <a href="${escapeAttr(CONTENT.meta.phoneHref)}">${escapeHtml(CONTENT.meta.phone)}</a> ` +
    `and you'll reach me directly.`;

  const say = (html) => {
    notice.hidden = false;
    notice.innerHTML = html;
    notice.setAttribute("role", "alert");
  };

  /* No endpoint yet: don't send anyone to a broken page — hand over the
     direct routes instead. This branch disappears once a real ID is set. */
  if (action.includes("YOUR_FORM_ID")) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      say(`The form isn't wired up yet — I don't want to lose your message. ${directRoutes}`);
    });
    return;
  }

  /* Real endpoint. Post it in the background so the visitor is never thrown
     onto the form host's own "Thanks!" page — the reply happens right here,
     in the middle of the conversation they were already having.

     The form keeps its action and method, so with JavaScript off it still
     submits the ordinary way rather than doing nothing at all. */
  const button = $("button[type=submit]", form);
  const buttonText = button ? button.textContent : "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.dataset.sending === "1") return;
    form.dataset.sending = "1";
    notice.hidden = true;
    if (button) { button.disabled = true; button.textContent = "Sending…"; }

    try {
      const res = await fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        // Replace the form outright — a sent message shouldn't leave an
        // empty form sitting there inviting a second one.
        const done = document.createElement("div");
        done.className = "form-sent";
        done.setAttribute("role", "status");
        done.innerHTML =
          `<p class="form-sent-head">Message sent.</p>` +
          `<p class="form-sent-body">Thanks — I read these myself and I'll reply from ` +
          `<a href="mailto:${escapeAttr(CONTENT.meta.email)}">${escapeHtml(CONTENT.meta.email)}</a>. ` +
          `If it's urgent, call <a href="${escapeAttr(CONTENT.meta.phoneHref)}">${escapeHtml(CONTENT.meta.phone)}</a>.</p>`;
        form.replaceWith(done);
        return;
      }

      // Formspree answers a rejected submission with a reason worth showing.
      let why = "";
      try {
        const data = await res.json();
        if (data && Array.isArray(data.errors) && data.errors.length) {
          why = data.errors.map((x) => x.message).join(". ") + ". ";
        }
      } catch (_) { /* body wasn't JSON — the generic message covers it */ }
      say(`${why}That didn't go through. ${directRoutes}`);
    } catch (_) {
      say(`That didn't go through — the connection failed. ${directRoutes}`);
    } finally {
      form.dataset.sending = "0";
      if (button) { button.disabled = false; button.textContent = buttonText; }
    }
  });
}

/* =========================================================================
   Boot
   ========================================================================= */
function boot() {
  renderNav();
  renderActs();
  renderFooter();
  initProjector();
  initPipeline();
  initNet();
  initChatDemo();
  initCursor();
  initContactForm();
  window.dispatchEvent(new CustomEvent("page:rendered"));
}
document.addEventListener("DOMContentLoaded", boot);
