/** 생성된 한·영 페이지의 내부 링크, 이미지, 폰트, 데이터 자리를 확인합니다. */
import fs from "node:fs/promises";
import path from "node:path";
import { output } from "./build.mjs";
const errors = [];
async function htmlFiles(folder) {
  const files = [];
  for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
    const p = path.join(folder, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(p)));
    else if (p.endsWith(".html")) files.push(p);
  }
  return files;
}
for (const file of await htmlFiles(output)) {
  const html = await fs.readFile(file, "utf8"),
    label = path.relative(output, file);
  if (/\{\{[A-Z_]+\}\}/.test(html))
    errors.push(`${label}: 데이터 자리가 남았습니다.`);
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const value = match[1];
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(value)) continue;
    const [url, anchor] = value.split("#");
    const target = url
      ? path.resolve(path.dirname(file), decodeURIComponent(url.split("?")[0]))
      : file;
    if (!target.startsWith(output + path.sep)) {
      errors.push(`${label}: 경로 오류 ${value}`);
      continue;
    }
    try {
      await fs.access(target);
    } catch {
      errors.push(`${label}: 파일 없음 ${value}`);
      continue;
    }
    if (anchor && target.endsWith(".html")) {
      const text = await fs.readFile(target, "utf8");
      if (!text.includes(`id="${anchor}"`))
        errors.push(`${label}: 위치 없음 ${value}`);
    }
  }
}
for (const file of ["layout.css", "pages.css", "theme.css"]) {
  const css = await fs.readFile(path.join(output, "styles", file), "utf8");
  for (const match of css.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) {
    if (match[1].startsWith("data:")) continue;
    try {
      await fs.access(path.resolve(output, "styles", match[1]));
    } catch {
      errors.push(`${file}: 리소스 없음 ${match[1]}`);
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "확인 완료: 한·영 페이지의 내부 링크·이미지·폰트·데이터 자리 정상",
  );
