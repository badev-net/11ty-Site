(function () {
  "use strict";

  const COUNTER_ENDPOINT = "https://visitor-counter.nbadev01.workers.dev";

  async function fetchCount(path) {
    const response = await fetch(
      `${COUNTER_ENDPOINT}?path=${encodeURIComponent(path)}`,
    );
    if (!response.ok) throw new Error("Counter unavailable");
    const data = await response.json();
    return data.count;
  }

  async function updateVisitorCounts() {
    const counters = document.querySelectorAll(".visitor-counter");
    if (!counters.length) return;

    for (const counter of counters) {
      const countElement = counter.querySelector(".visitor-count");
      if (!countElement) continue;

      const path = counter.dataset.path || window.location.pathname;

      try {
        const count = await fetchCount(path);
        countElement.textContent = count.toLocaleString();
        counter.classList.remove("loading");
      } catch (error) {
        countElement.textContent = "-";
        counter.classList.add("error");
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateVisitorCounts);
  } else {
    updateVisitorCounts();
  }
})();
