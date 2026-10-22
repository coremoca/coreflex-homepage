/** 모든 페이지의 메뉴·현재 페이지 표시·스크롤 진입 효과를 담당합니다. 내용 데이터는 이 파일에서 관리하지 않습니다. */
// 원문 데이터와 화면 표현을 분리합니다. 모션은 화면에 보이는 캔버스만 갱신합니다.

const current = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".masthead nav a").forEach((a) => {
  if (a.getAttribute("href") === current)
    a.setAttribute("aria-current", "page");
});
const menu = document.querySelector(".menu-button");
menu?.addEventListener("click", () => {
  const open = document.querySelector("#navigation").classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});
const revealObserver = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    }),
  { threshold: 0.08 },
);
document
  .querySelectorAll(
    ".home-about .split-heading,.section-heading,.solution-index>a,.latest-records>a,.company-record,.product-card,.feature-item,.testimonial-card,.project-list article,.logo-grid",
  )
  .forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i % 3, 2) * 65}ms`;
    revealObserver.observe(el);
  });
// 언어를 바꿔도 같은 페이지의 현재 섹션을 유지합니다.
document.querySelectorAll("[data-language]").forEach((link) => {
  if (link.dataset.language === document.documentElement.lang)
    link.setAttribute("aria-current", "true");
  link.addEventListener("click", () => {
    if (location.hash) link.href = link.href.split("#")[0] + location.hash;
  });
});
