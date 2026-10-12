const products = [
  {brand:"Prada",name:"Re-Edition Inspired Shoulder Bag",category:"Bags",shape:"bag-shape",tone:"tone-1"},
  {brand:"Saint Laurent",name:"Tailored Wool Outerwear",category:"Ready-to-wear",shape:"coat-shape",tone:"tone-2"},
  {brand:"Gucci",name:"Leather Loafer Style",category:"Shoes",shape:"shoe-shape",tone:"tone-3"},
  {brand:"Bottega Veneta",name:"Woven Leather Wallet",category:"Bags",shape:"wallet-shape",tone:"tone-4"},
  {brand:"Burberry",name:"Printed Silk Scarf",category:"Ready-to-wear",shape:"scarf-shape",tone:"tone-5"},
  {brand:"Dior",name:"Sculpted Sunglasses",category:"Accessories",shape:"sunglasses-shape",tone:"tone-6"},
  {brand:"Loewe",name:"Structured Leather Bag",category:"Bags",shape:"bag-shape",tone:"tone-2"},
  {brand:"Moncler",name:"Quilted Outerwear",category:"Ready-to-wear",shape:"coat-shape",tone:"tone-4"}
];
let activeFilter = "All";
let currentQuery = "";
const grid = document.getElementById("productGrid");
const empty = document.getElementById("emptyState");
const count = document.getElementById("resultCount");

function renderProducts() {
  const filtered = products.filter(p => {
    const matchesFilter = activeFilter === "All" || p.category === activeFilter;
    const q = currentQuery.trim().toLowerCase();
    const matchesQuery = !q || `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });
  grid.innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-art ${p.tone}">
        <span class="product-label">Preview concept</span>
        <div class="shape ${p.shape}" aria-hidden="true"></div>
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-category">${p.category}</div>
        <div class="product-price">Live retailer pricing <strong>coming soon</strong></div>
        <span class="preview-tag">Explore concept ↗</span>
      </div>
    </article>`).join("");
  empty.hidden = filtered.length > 0;
  count.textContent = `${filtered.length} preview ${filtered.length === 1 ? "piece" : "pieces"}`;
}
document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  currentQuery = document.getElementById("searchInput").value;
  renderProducts();
  document.getElementById("discover").scrollIntoView({behavior:"smooth"});
});
document.querySelectorAll(".brand-tile").forEach(button => button.addEventListener("click", () => {
  currentQuery = button.dataset.brand;
  document.getElementById("searchInput").value = currentQuery;
  activeFilter = "All";
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.dataset.filter === "All"));
  renderProducts();
  document.getElementById("discover").scrollIntoView({behavior:"smooth"});
}));
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === button));
  renderProducts();
}));
document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
