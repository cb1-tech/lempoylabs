const shopLinks = window.LEMPOY_SHOP_LINKS || {};

document.querySelectorAll(".product-meta").forEach((productMeta) => {
  const productName = productMeta.closest(".shop-product")?.querySelector("h2")?.textContent?.trim() || "";
  const reference = document.createElement("a");
  reference.className = "material-reference";
  reference.href = "#hand-painted-silk";
  reference.innerHTML = '<span lang="ja">手仕事・素材の特性について</span><span>About hand-painted silk ↓</span>';
  productMeta.insertBefore(reference, productMeta.querySelector(".market-controls"));

  const inquiries = document.createElement("div");
  inquiries.className = "product-inquiries";
  const productSubject = encodeURIComponent(`Product inquiry: ${productName}`);
  const productBody = encodeURIComponent(`Inquiry type: Product Inquiry\nProduct: ${productName}\n\nMessage:\n`);
  const directSubject = encodeURIComponent(`Direct Order: ${productName}`);
  const directBody = encodeURIComponent(`Inquiry type: Direct Order\nProduct: ${productName}\nDestination country/region: \n\nMessage:\n`);
  inquiries.innerHTML = `<a href="mailto:lempoylabs@gmail.com?subject=${productSubject}&body=${productBody}"><span lang="ja">商品について問い合わせる</span><span>Ask about this item →</span></a><a href="mailto:lempoylabs@gmail.com?subject=${directSubject}&body=${directBody}"><span lang="ja">直接注文について問い合わせる</span><span>Direct Order Inquiry →</span></a>`;
  productMeta.append(inquiries);
});

document.querySelectorAll("[data-marketplace]").forEach((control) => {
  const marketplaceName = control.dataset.marketplace === "amazon" ? "Amazon" : "Creema";
  control.innerHTML = `<strong>${marketplaceName}</strong><span lang="ja">販売開始までしばらくお待ちください</span><span>Coming soon</span>`;

  const productLinks = shopLinks[control.dataset.product];
  const url = productLinks?.[control.dataset.marketplace]?.trim();
  if (!url) return;

  const marketplace = control.dataset.marketplace;
  control.href = url;
  control.target = "_blank";
  control.rel = "noopener noreferrer";
  control.removeAttribute("aria-disabled");
  control.classList.remove("is-disabled");
  control.innerHTML = marketplace === "amazon"
    ? "Amazonで購入 <span>Buy on Amazon</span>"
    : "Creemaで購入 <span>Buy on Creema</span>";
});

document.querySelectorAll('[data-marketplace][aria-disabled="true"]').forEach((control) => {
  control.addEventListener("click", (event) => event.preventDefault());
});
