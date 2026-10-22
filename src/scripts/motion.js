/** 보이는 구역에서만 갱신하는 입체 개념 모션입니다. reduced-motion 설정을 존중하고 일시정지 버튼은 표시하지 않습니다. */
const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
const current = location.pathname.split("/").pop() || "index.html";
const cover = document.querySelector(".page-cover");
if (cover && current === "customer-experience.html") {
  const detail = document.createElement("div");
  detail.className = "cover-motion motion-art";
  detail.dataset.art = "signals";
  detail.setAttribute("aria-hidden", "true");
  detail.innerHTML = "<canvas></canvas>";
  cover.append(detail);
}
const stages = [];
let running = false;
function setupArt(el) {
  const canvas = el.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  let w = 0,
    h = 0;
  const stage = { visible: false, draw };
  let kind = el.dataset.art,
    scale = 1;
  new ResizeObserver(() => {
    w = el.clientWidth;
    h = el.clientHeight;
    const pixel = Math.min(devicePixelRatio, 1.5);
    canvas.width = w * pixel;
    canvas.height = h * pixel;
    ctx.setTransform(pixel, 0, 0, pixel, 0, 0);
    scale = Math.min(w, h) / 7.4;
    draw(performance.now() / 1000);
  }).observe(el);
  const project = (x, y, z, t) => {
    const a = t * 0.09 + 0.55,
      b = 0.38;
    const xx = x * Math.cos(a) + z * Math.sin(a),
      zz = -x * Math.sin(a) + z * Math.cos(a);
    const yy = y * Math.cos(b) - zz * Math.sin(b),
      z2 = y * Math.sin(b) + zz * Math.cos(b);
    const perspective = 9 / (9 + z2);
    return [
      (el.closest(".hero") ? w * 0.76 : w * 0.5) + xx * scale * perspective,
      h * 0.46 + yy * scale * perspective,
      perspective,
    ];
  };
  function line(a, b, color, width = 1) {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  function draw(t) {
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    const time = reduced ? 4 : t;
    const centerX = el.closest(".hero") ? w * 0.76 : w * 0.5;
    ctx.strokeStyle = "rgba(114,153,206,.07)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 13; i++) {
      const y = h * 0.24 + i * 30;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    if (kind === "stack") {
      for (let k = 0; k < 6; k++) {
        const y = (k - 2.5) * 0.7 + Math.sin(time * 0.4) * 0.07;
        const p = [
          [-2, y, -1.7],
          [2, y, -1.7],
          [2, y, 1.7],
          [-2, y, 1.7],
        ].map((v) => project(...v, time));
        ctx.beginPath();
        p.forEach((v, i) =>
          i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]),
        );
        ctx.closePath();
        ctx.fillStyle = `rgba(41,68,103,${0.3 + k * 0.035})`;
        ctx.fill();
        p.forEach((v, i) =>
          line(v, p[(i + 1) % 4], `rgba(158,196,246,${0.28 + k * 0.07})`),
        );
        for (let j = 0; j < 3; j++) {
          const a = project(-1.6, y, -1 + j, time),
            b = project(1.6, y, -1 + j, time);
          line(a, b, "rgba(127,179,251,.25)");
          const s = (time * 0.18 + j * 0.2 + k * 0.12) % 1;
          ctx.fillStyle = "#c4dfff";
          ctx.fillRect(
            a[0] + (b[0] - a[0]) * s - 1,
            a[1] + (b[1] - a[1]) * s - 1,
            3,
            3,
          );
        }
      }
    } else {
      const nodes = [];
      const n = kind === "signals" ? 27 : 54;
      for (let i = 0; i < n; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / n),
          theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const radius =
          kind === "signals" ? 2.3 + Math.sin(time * 0.3 + i) * 0.25 : 2.5;
        nodes.push(
          project(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta),
            time,
          ),
        );
      }
      nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
          if (j <= i) return;
          const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
          if (dist < scale * 1.25) {
            line(
              a,
              b,
              `rgba(135,180,241,${Math.max(0.03, 0.22 - dist / (scale * 7))})`,
            );
            if ((i + j) % 9 === 0) {
              const s = (time * 0.14 + i * 0.1) % 1;
              const x = a[0] + (b[0] - a[0]) * s,
                y = a[1] + (b[1] - a[1]) * s;
              ctx.fillStyle = "#dbeaff";
              ctx.beginPath();
              ctx.arc(x, y, 1.7, 0, 7);
              ctx.fill();
            }
          }
        });
        ctx.fillStyle = i % 7 === 0 ? "#e3f0ff" : "#89acd8";
        ctx.globalAlpha = Math.min(1, a[2] * 0.7);
        ctx.beginPath();
        ctx.arc(a[0], a[1], i % 7 === 0 ? 3 : 1.6, 0, 7);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const a = (i / 100) * Math.PI * 2,
            p = project(
              Math.cos(a) * 3.1,
              Math.sin(a) * 3.1 * Math.cos(k * 0.9),
              Math.sin(a) * 3.1 * Math.sin(k * 0.9),
              time,
            );
          i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
        }
        ctx.strokeStyle = "rgba(132,173,229,.23)";
        ctx.stroke();
      }
      const glow = ctx.createRadialGradient(
        centerX,
        h * 0.46,
        0,
        centerX,
        h * 0.46,
        scale * 2,
      );
      glow.addColorStop(0, "rgba(97,160,244,.06)");
      glow.addColorStop(1, "rgba(97,160,244,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }
  }
  stages.push(stage);
  new IntersectionObserver(
    (es) => {
      stage.visible = es[0].isIntersecting;
      start();
    },
    { rootMargin: "70px" },
  ).observe(el);
}
function start() {
  if (running || reduced) return;
  running = true;
  requestAnimationFrame(frame);
}
let last = 0;
function frame(t) {
  if (document.hidden) {
    running = false;
    return;
  }
  if (t - last > 32) {
    stages.forEach((s) => {
      if (s.visible) s.draw(t / 1000);
    });
    last = t;
  }
  if (stages.some((s) => s.visible)) requestAnimationFrame(frame);
  else running = false;
}
document.querySelectorAll(".motion-art").forEach(setupArt);
addEventListener("visibilitychange", () => {
  if (!document.hidden) start();
});
