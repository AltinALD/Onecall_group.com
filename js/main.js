const COMPANY_EMAIL = document.body.dataset.email || "hiring@oncallgroup.net";
const SHIFT_START = 15 * 60 + 30;
const SHIFT_END = 23 * 60 + 30;
const FLOOR_ZONE = "Europe/Belgrade";

document.documentElement.classList.add("js");

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

function setMenu(open) {
  if (!toggle || !nav) return;
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("nav-open", open);
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    setMenu(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
}

const navLinks = [...document.querySelectorAll(".nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => spy.observe(section));
}

const revealNodes = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-in"));
}

const clockNodes = document.querySelectorAll("[data-zone]");
const statusText = document.querySelector("#floor-status");
const statusDot = document.querySelector(".status-dot");

function clockInZone(timeZone, date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function partsInZone(timeZone, date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value || "";
  return {
    weekday: value("weekday"),
    minutes: Number(value("hour")) * 60 + Number(value("minute")),
  };
}

function renderClocks() {
  const now = new Date();
  clockNodes.forEach((node) => {
    node.textContent = clockInZone(node.dataset.zone, now);
  });

  if (!statusText || !statusDot) return;
  const { weekday, minutes } = partsInZone(FLOOR_ZONE, now);
  const open = weekday !== "Sat" && weekday !== "Sun" && minutes >= SHIFT_START && minutes < SHIFT_END;
  statusText.textContent = open ? "On the floor" : "Off hours";
  statusDot.classList.toggle("is-off", !open);
}

let clockTimer = 0;
function startClocks() {
  renderClocks();
  clearInterval(clockTimer);
  clockTimer = setInterval(renderClocks, 1000);
}

if (clockNodes.length) {
  startClocks();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(clockTimer);
    else startClocks();
  });
}

const video = document.querySelector(".hero-video");
const videoToggle = document.querySelector(".video-toggle");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (video && reduceMotion) {
  video.pause();
  videoToggle?.classList.add("is-paused");
  if (videoToggle) videoToggle.setAttribute("aria-pressed", "false");
}

function setVideoLabel() {
  const label = videoToggle.querySelector(".sr-only");
  if (!label) return;
  label.textContent = video.paused ? "Play background video" : "Pause background video";
}

if (video && videoToggle) {
  setVideoLabel();
  videoToggle.addEventListener("click", () => {
    if (video.paused) {
      video.play();
      videoToggle.classList.remove("is-paused");
      videoToggle.setAttribute("aria-pressed", "true");
    } else {
      video.pause();
      videoToggle.classList.add("is-paused");
      videoToggle.setAttribute("aria-pressed", "false");
    }
    setVideoLabel();
  });
}

const form = document.querySelector(".contact-form");
const formNote = document.querySelector("#form-note");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (form.elements.company_site.value) return;

    const data = new FormData(form);
    const subject = `Website inquiry from ${data.get("name")} - ${data.get("interest")}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Company: ${data.get("company")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "-"}`,
      `Interest: ${data.get("interest")}`,
      "",
      String(data.get("message") || ""),
    ].join("\n");

    window.location.href = `mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (formNote) {
      formNote.textContent = `Your email app should open with this message addressed to ${COMPANY_EMAIL}. If it does not, send the note there directly.`;
    }
  });
}
