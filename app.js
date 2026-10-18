"use strict";

let products = [];
let activeFilter = "All";
let currentQuery = "";

const grid = document.getElementById("productGrid");
const empty = document.getElementById("emptyState");
const count = document.getElementById("resultCount");

const visualDefaults = [
  { shape: "bag-shape", tone: "tone-1" },
  { shape: "coat-shape", tone: "tone-2" },
  { shape: "wallet-shape", tone: "tone-3" },
  { shape: "wallet-shape", tone: "tone-4" },
  { shape: "scarf-shape", tone: "tone-5" },
  { shape: "sunglasses-shape", tone: "tone-6" }
];

function normalizeCategory(category = "") {
  const value = String(category).toLowerCase();

  if (value.includes("bag")) return "Bags";
  if (value.includes("shoe")) return "Shoes";

  if (
    value.includes("clothing") ||
    value.includes("ready-to-wear") ||
    value.includes("outerwear")
  ) {
    return "Ready-to-wear";
  }

  if (value.includes("accessor")) return "Accessories";

  return category || "Accessories";
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function prepareProduct(product, index) {
  const visual = visualDefaults[index % visualDefaults.length];

  return {
    ...product,
    brand: product.brand || "Designer",
    name: product.name || `${product.brand || "Designer"} preview`,
    category: normalizeCategory(product.category),
    shape: product.shape || visual.shape,
    tone: product.tone || visual.tone
  };
}

function renderProducts() {
  if (!grid || !empty || !count) {
    console.error("ZELQENO: Required product-grid elements are missing.");
    return;
  }

  const query = currentQuery.trim().toLowerCase();

  const filtered = products.filter(product => {
    const matchesFilter =
      activeFilter === "All" ||
      product.category === activeFilter;

    const searchable =
      `${product.brand} ${product.name} ${product.category}`.toLowerCase();

    return matchesFilter && (!query || searchable.includes(query));
  });

  grid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-art ${escapeHTML(product.tone)}">
        <span class="product-label">Preview concept</span>
        <div class="shape ${escapeHTML(product.shape)}"
             aria-hidden="true"></div>
      </div>
      <div class="product-info">
        <div class="product-brand">${escapeHTML(product.brand)}</div>
        <h3 class="product-name">${escapeHTML(product.name)}</h3>
        <div class="product-category">${escapeHTML(product.category)}</div>
        <div class="product-price">
          Live retailer pricing <strong>coming soon</strong>
        </div>
        <span class="preview-tag">Explore concept ↗</span>
      </div>
    </article>
  `).join("");

  empty.hidden = filtered.length > 0;
  empty.textContent = query
    ? `No matching pieces for "${currentQuery.trim()}". Try another brand or product.`
    : "No pieces are available in this category yet.";

  count.textContent =
    `${filtered.length} of ${products.length} preview pieces`;
}

async function loadProducts() {
  count.textContent = "Loading products…";

  try {
    const response = await fetch(
      new URL("./zelqeno-products.json", document.baseURI).href,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`JSON request failed: HTTP ${response.status}`);
    }

    const catalogue = await response.json();

    if (!catalogue || !Array.isArray(catalogue.products)) {
      throw new Error('JSON must contain a "products" array.');
    }

    products = catalogue.products.map(prepareProduct);

    console.info(`ZELQENO: Loaded ${products.length} products.`);
    renderProducts();

  } catch (error) {
    console.error("ZELQENO product loading failed:", error);

    products = [];
    grid.innerHTML = "";
    empty.hidden = false;
    count.textContent = "Unable to load products. Please try again.";
  }
}

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    currentQuery = searchInput.value;
    renderProducts();

    document.getElementById("discover")?.scrollIntoView({
      behavior: "smooth"
    });
  });

  searchInput.addEventListener("input", () => {
    currentQuery = searchInput.value;
    renderProducts();
  });
}

document.querySelectorAll(".brand-tile").forEach(button => {
  button.addEventListener("click", () => {
    currentQuery = button.dataset.brand || "";
    if (searchInput) searchInput.value = currentQuery;

    activeFilter = "All";

    document.querySelectorAll(".filter").forEach(filterButton => {
      const value = filterButton.dataset.filter;
      filterButton.classList.toggle(
        "active",
        value === "All" || value === "all"
      );
    });

    renderProducts();

    document.getElementById("discover")?.scrollIntoView({
      behavior: "smooth"
    });
  });
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    const value = (button.dataset.filter || "All").trim();

    activeFilter =
      value.toLowerCase() === "all" ||
      value.toLowerCase() === "all pieces"
        ? "All"
        : normalizeCategory(value);

    document.querySelectorAll(".filter").forEach(filterButton => {
      const filterValue = (filterButton.dataset.filter || "").toLowerCase();

      filterButton.classList.toggle(
        "active",
        filterButton === button ||
        (activeFilter === "All" &&
          (filterValue === "all" || filterValue === "all pieces"))
      );
    });

    renderProducts();
  });
});

const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

loadProducts();
