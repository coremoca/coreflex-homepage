/**
 * src의 한·영 본문과 공통 컴포넌트, 실적 데이터를 dist의 정적 페이지로 만듭니다.
 * 내용 수정은 src/pages와 src/data에서 합니다. 실행에 외부 패키지는 필요 없습니다.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const output = path.join(root, "dist");
const source = path.join(root, "src");
const read = (name) => fs.readFile(path.join(source, name), "utf8");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const number = (n) => String(n).padStart(2, "0");
const text = (value, lang) => escape(value?.[lang] || "");
const name = (value, lang) => escape(lang === "en" ? value.nameEn : value.name);
const region = (items, key) => items.filter((item) => item.region === key);
export const legacyRoutes = {
  "solutions.html": "financial-solutions.html",
  "business.html": "client-projects.html",
  "history.html": "yearly-projects.html",
  "cx.html": "customer-experience.html",
  "career.html": "careers.html",
};
async function data(file) {
  const doc = JSON.parse(await read("data/" + file));
  if (!Array.isArray(doc.items))
    throw new Error(`${file}: items 배열이 필요합니다.`);
  return doc.items;
}
function validateClients(items, label) {
  const names = new Set();
  for (const item of items) {
    if (
      !item.name ||
      !item.nameEn ||
      !["domestic", "global"].includes(item.region) ||
      names.has(item.name)
    )
      throw new Error(
        `${label}: name/nameEn/region 또는 중복 이름을 확인하세요.`,
      );
    names.add(item.name);
  }
}
function validateProjects(projects, label) {
  if (
    !Array.isArray(projects) ||
    projects.some(
      (p) =>
        !p ||
        typeof p.ko !== "string" ||
        typeof p.en !== "string" ||
        !p.ko.trim() ||
        !p.en.trim() ||
        /[가-힣]/.test(p.en),
    )
  )
    throw new Error(
      `${label}: projects에 {"ko":"한국어","en":"English"}를 함께 입력하세요.`,
    );
}
function clientRecords(items, lang) {
  return items
    .map(
      (c, i) =>
        `<article class="company-record" data-company="${name(c, lang)}" data-region="${c.region}"><div class="company-name"><span class="record-number">${number(i + 1)}</span><div class="client-identity"><h2>${name(c, lang)}</h2><span class="client-region">${lang === "en" ? (c.region === "domestic" ? "Korean client" : "Global client") : c.region === "domestic" ? "국내 금융 · 기관" : "해외 고객사"}</span></div></div><div class="company-projects"><ul>${c.projects.map((p) => `<li>${text(p, lang)}</li>`).join("\n")}</ul></div><div class="record-card-footer">${number(c.projects.length)} PROJECT RECORDS</div></article>`,
    )
    .join("\n");
}
function yearRecords(items, lang) {
  return items
    .map(
      (y) =>
        `<section class="timeline-year" id="year-${y.year}"><div class="year-heading"><span class="timeline-node" aria-hidden="true"></span><h2>${y.year}</h2><span>${number(y.projects.length)} RECORDS</span></div><div class="project-list">${y.projects.map((p, i) => `<article><span>${number(i + 1)}</span><p>${text(p, lang)}</p></article>`).join("\n")}</div></section>`,
    )
    .join("\n");
}
function logo(c, lang) {
  return `<div><img src="${escape(c.image)}" alt="${name(c, lang)}" width="${c.width}" height="${c.height}" loading="lazy"></div>`;
}
function metric(value, label, lang) {
  return `<div><strong>${value}${lang === "ko" ? "<span>개</span>" : ""}</strong><p>${label}</p></div>`;
}
export async function buildSite() {
  const [clients, yearData, logos] = await Promise.all(
    ["client-projects.json", "yearly-projects.json", "clients.json"].map(data),
  );
  validateClients(clients, "client-projects.json");
  validateClients(logos, "clients.json");
  clients.forEach((c) => validateProjects(c.projects, c.name));
  const years = [...yearData].sort((a, b) => b.year - a.year);
  const seen = new Set();
  for (const y of years) {
    if (!Number.isInteger(y.year) || seen.has(y.year))
      throw new Error("연도는 중복되지 않는 정수로 입력하세요.");
    seen.add(y.year);
    validateProjects(y.projects, String(y.year));
  }
  if (!years.length) throw new Error("연도별 실적이 하나 이상 필요합니다.");
  for (const c of logos) {
    if (
      !c.image.startsWith("assets/images/") ||
      c.image.includes("..") ||
      !(c.width > 0 && c.height > 0)
    )
      throw new Error(`${c.name}: 로고 경로와 크기를 확인하세요.`);
    await fs.access(path.join(source, c.image));
  }
  const first = years.at(-1).year,
    last = years[0].year,
    total = years.reduce((n, y) => n + y.projects.length, 0),
    domestic = region(clients, "domestic").length,
    global = region(clients, "global").length;
  const files = (await fs.readdir(path.join(source, "pages")))
    .filter((f) => f.endsWith(".html"))
    .sort();
  const documents = [];
  for (const lang of ["ko", "en"]) {
    const componentFolder = lang === "en" ? "components/en" : "components";
    const [headerSource, footer, logoTemplate] = await Promise.all(
      ["header.html", "footer.html", "client-logos.html"].map((f) =>
        read(componentFolder + "/" + f),
      ),
    );
    const tokens = {
      CLIENT_LOGOS: logoTemplate
        .replace(
          "{{DOMESTIC_LOGOS}}",
          region(logos, "domestic")
            .map((c) => logo(c, lang))
            .join("\n"),
        )
        .replace(
          "{{GLOBAL_LOGOS}}",
          region(logos, "global")
            .map((c) => logo(c, lang))
            .join("\n"),
        ),
      CLIENT_METRICS:
        '<div class="record-metrics">' +
        metric(
          clients.length,
          lang === "en" ? "Clients" : "함께한 고객사",
          lang,
        ) +
        metric(domestic, lang === "en" ? "In Korea" : "국내 고객사", lang) +
        metric(
          global,
          lang === "en" ? "Across the world" : "해외 고객사",
          lang,
        ) +
        "</div>",
      CLIENT_FILTERS: `<div class="record-filters" role="group" aria-label="${lang === "en" ? "Client region" : "고객사 지역"}"><button data-region="all" class="selected" aria-pressed="true">${lang === "en" ? "All" : "전체"} <span>${clients.length}</span></button><button data-region="domestic" aria-pressed="false">${lang === "en" ? "Korea" : "국내"} <span>${domestic}</span></button><button data-region="global" aria-pressed="false">${lang === "en" ? "Global" : "해외"} <span>${global}</span></button></div>`,
      CLIENT_PROJECTS: clientRecords(clients, lang),
      YEARLY_PROJECTS: yearRecords(years, lang),
      YEAR_RANGE: `${first}—${last}`,
      YEAR_NAVIGATION:
        `<div class="archive-caption"><span>${first} — ${last}</span><p>${lang === "en" ? `${total} records of financial<br>engineering at Coreflex.` : `${total}개의 기록으로 이어온<br>코어플렉스의 금융 기술.`}</p></div><span>YEAR ARCHIVE</span>` +
        years.map((y) => `<a href="#year-${y.year}">${y.year}</a>`).join("\n"),
      HISTORY_CHART:
        `<div class="history-chart" aria-label="${lang === "en" ? "Project records by year" : "연도별 실적 건수"}">` +
        [...years]
          .reverse()
          .map(
            (y) =>
              `<a class="chart-year" href="#year-${y.year}" aria-label="${lang === "en" ? `${y.year}: ${y.projects.length} records` : `${y.year}년 실적 ${y.projects.length}건`}" style="--bar-height:${Math.min(180, 24 + y.projects.length * 7)}px"><span class="chart-value">${y.projects.length}</span><i></i><span>${String(y.year).slice(-2)}</span></a>`,
          )
          .join("") +
        "</div>",
      LATEST_PROJECTS: years
        .slice(0, 3)
        .map(
          (y) =>
            `<a href="yearly-projects.html#year-${y.year}"><strong>${y.year}</strong><span>${text(y.projects[0], lang)}</span><i>↗</i></a>`,
        )
        .join("\n"),
    };
    for (const filename of files) {
      let body = await read(`pages/${lang === "en" ? "en/" : ""}${filename}`);
      const title =
        /<!-- 브라우저 제목: (.*?) -->/.exec(body)?.[1] || "COREFLEX";
      body = body.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
        if (!(key in tokens))
          throw new Error(`${filename}: 알 수 없는 데이터 자리 ${key}`);
        return tokens[key];
      });
      const header = headerSource
        .replace("{{LANGUAGE_KO_URL}}", (lang === "en" ? "../" : "") + filename)
        .replace(
          "{{LANGUAGE_EN_URL}}",
          (lang === "en" ? "" : "en/") + filename,
        );
      const prefix = lang === "en" ? "../" : "";
      const scripts = ["common.js", "motion.js"];
      if (["client-projects.html", "yearly-projects.html"].includes(filename))
        scripts.push("records.js");
      if (filename === "financial-solutions.html") scripts.push("solutions.js");
      if (filename === "customer-experience.html") scripts.push("video.js");
      const content = (header + "\n" + body + "\n" + footer).replace(
        /(src|poster)="assets\//g,
        `$1="${prefix}assets/`,
      );
      const html = `<!doctype html>\n<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${lang === "en" ? "Coreflex financial technology, customer experience solutions, project records and careers." : "코어플렉스 금융솔루션과 고객경험솔루션, 국내외 실적 및 채용 안내"}"><meta name="theme-color" content="#080d15"><title>${escape(title)} | COREFLEX</title><link rel="alternate" hreflang="ko" href="${lang === "en" ? "../" : ""}${filename}"><link rel="alternate" hreflang="en" href="${lang === "en" ? "" : "en/"}${filename}"><link rel="icon" href="${prefix}assets/brand/favicon.svg" type="image/svg+xml"><link rel="preload" href="${prefix}assets/fonts/PretendardVariable.woff2" as="font" type="font/woff2" crossorigin>${["layout", "pages", "theme"].map((n) => `<link rel="stylesheet" href="${prefix}styles/${n}.css">`).join("")}</head><body data-page="${filename}"><a class="skip" href="#main">${lang === "en" ? "Skip to content" : "본문으로 이동"}</a>\n${content}\n${scripts.map((n) => `<script type="module" src="${prefix}scripts/${n}"></script>`).join("\n")}\n</body></html>`;
      documents.push([(lang === "en" ? "en/" : "") + filename, html]);
    }
  }
  if (path.resolve(output) !== path.resolve(root, "dist") || output === root)
    throw new Error("출력 경로가 올바르지 않습니다.");
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(path.join(output, "en"), { recursive: true });
  await Promise.all(
    ["assets", "styles", "scripts"].map((folder) =>
      fs.cp(path.join(source, folder), path.join(output, folder), {
        recursive: true,
      }),
    ),
  );
  for (const [file, html] of documents)
    await fs.writeFile(path.join(output, file), html);
  for (const [oldName, newName] of Object.entries(legacyRoutes))
    await fs.writeFile(
      path.join(output, oldName),
      `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>페이지 이동</title><meta http-equiv="refresh" content="0;url=${newName}"><script>location.replace(${JSON.stringify(newName)}+location.search+location.hash)</script></head><body><a href="${newName}">새 페이지로 이동</a></body></html>`,
    );
  await fs.writeFile(path.join(output, ".nojekyll"), "");
  try {
    await fs.copyFile(path.join(root, "CNAME"), path.join(output, "CNAME"));
  } catch {}
  console.log(
    `완료: 한·영 ${documents.length}개 페이지 / 회사별 ${clients.length}개 고객사 / 연도별 ${years.length}개 연도 / 로고 ${logos.length}개`,
  );
  return {
    pages: documents.length,
    clients: clients.length,
    years: years.length,
    logos: logos.length,
  };
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
)
  await buildSite();
