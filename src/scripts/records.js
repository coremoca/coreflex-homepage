/** 회사별 지역/검색 필터와 연도별 실적 탐색만 담당합니다. 실적 추가는 src/data의 JSON에서 합니다. */
const yearLinks = [...document.querySelectorAll(".timeline-rail a")];
if (yearLinks.length) {
  let active = null;
  const update = () => {
    const sections = [...document.querySelectorAll(".timeline-year")];
    let nearest = sections[0];
    for (const s of sections) {
      if (s.getBoundingClientRect().top < 260) nearest = s;
    }
    if (nearest && active !== nearest.id) {
      active = nearest.id;
      yearLinks.forEach((a) => {
        const on = a.hash === "#" + active;
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }
  };
  addEventListener("scroll", update, { passive: true });
  update();
}

// 지역과 검색어를 함께 적용하며 원본 실적은 전체 유지합니다.
const regionButtons = [...document.querySelectorAll(".record-filters button")];
let selectedRegion = "all";
const input = document.querySelector("#company-search");
function filterRecords() {
  const term = input.value.trim().toLowerCase();
  let found = 0;
  document.querySelectorAll(".company-record").forEach((card) => {
    const visible =
      (selectedRegion === "all" || card.dataset.region === selectedRegion) &&
      card.dataset.company.toLowerCase().includes(term);
    card.hidden = !visible;
    if (visible) {
      found++;
      card.classList.add("visible");
    }
  });
  document.querySelector(".search-empty").hidden = found > 0;
}
regionButtons.forEach((button) =>
  button.addEventListener("click", () => {
    selectedRegion = button.dataset.region;
    regionButtons.forEach((b) => {
      const on = b === button;
      b.classList.toggle("selected", on);
      b.setAttribute("aria-pressed", String(on));
    });
    filterRecords();
  }),
);
input?.addEventListener("input", filterRecords);
