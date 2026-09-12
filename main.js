const config = window.LEMPOY_CONFIG || {};

const hello = document.querySelector("[data-say-hello]");
if (hello && (config.email || config.instagramUrl)) {
  hello.hidden = false;
  hello.href = config.email ? `mailto:${config.email}` : config.instagramUrl;
  if (!config.email) {
    hello.target = "_blank";
    hello.rel = "noopener noreferrer";
  }
}

const support = document.querySelector("[data-support-link]");
if (support && config.supportUrl) {
  support.hidden = false;
  support.href = config.supportUrl;
  support.target = "_blank";
  support.rel = "noopener noreferrer";
}

document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => link.closest("details")?.removeAttribute("open"));
});
