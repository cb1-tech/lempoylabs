(() => {
  const products = document.querySelectorAll(
    ".shop-product[id], .saree-design[id], .japan-find-product[id]"
  );

  const canonical = document.querySelector('link[rel="canonical"]')?.href;

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  };

  products.forEach((product) => {
    const destination = product.querySelector(
      ".product-info, .saree-details, .japan-find-content"
    );
    if (!destination || !product.id) return;

    const productName =
      product.querySelector("h2, h3")?.textContent.trim() || "this item";
    const button = document.createElement("button");
    button.className = "copy-product-link";
    button.type = "button";
    button.setAttribute("aria-label", `Copy link to ${productName}`);
    button.title = "Copy link for sharing";
    button.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><span>Copy link</span>';

    button.addEventListener("click", async () => {
      const pageUrl = canonical || `${location.origin}${location.pathname}`;
      const shareUrl = `${pageUrl.split("#")[0]}#${product.id}`;
      try {
        await copyText(shareUrl);
        button.classList.add("is-copied");
        button.querySelector("span").textContent = "Link copied";
        button.setAttribute("aria-label", `Link to ${productName} copied`);
        window.setTimeout(() => {
          button.classList.remove("is-copied");
          button.querySelector("span").textContent = "Copy link";
          button.setAttribute("aria-label", `Copy link to ${productName}`);
        }, 2200);
      } catch {
        button.querySelector("span").textContent = "Copy failed";
      }
    });

    destination.append(button);
  });
})();
