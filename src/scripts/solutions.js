/** 금융솔루션 상세 링크로 이동했을 때 해당 항목을 펼칩니다. */
if (location.hash.startsWith("#solution-")) {
  const d = document.querySelector(location.hash);
  if (d) d.open = true;
}
// 각 솔루션은 독립 양식으로 열고 닫습니다. 링크로 이동한 상세 항목은 자동으로 펼칩니다.
addEventListener("hashchange", () => {
  if (location.hash.startsWith("#solution-")) {
    const d = document.getElementById(location.hash.slice(1));
    if (d) d.open = true;
  }
});
