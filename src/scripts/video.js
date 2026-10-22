/**
 * Medallia 영상 섹션 전용 동작입니다.
 * 화면의 35% 이상이 보일 때 음소거 자동 재생하고, 벗어나면 정지합니다.
 * 사용자가 화면 안에서 직접 일시정지한 경우에는 재생을 강제하지 않습니다.
 */
const video = document.querySelector("#cx-video video");
if (video) {
  let inView = false;
  let autoPaused = false;
  const start = () => {
    video.muted = true;
    const request = video.play();
    if (request)
      request.catch(() => {
        /* 자동 재생이 제한되면 기본 재생 버튼을 사용합니다. */
      });
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      if (visible && !inView) start();
      if (!visible && inView && !video.paused) {
        autoPaused = true;
        video.pause();
      }
      inView = visible;
    },
    { threshold: 0.35 },
  );
  observer.observe(video);
  video.addEventListener("playing", () => {
    video.closest(".video-stage").dataset.playing = "true";
    autoPaused = false;
  });
  video.addEventListener("pause", () => {
    video.closest(".video-stage").dataset.playing = "false";
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !video.paused) {
      autoPaused = true;
      video.pause();
    } else if (!document.hidden && inView && autoPaused) start();
  });
}
