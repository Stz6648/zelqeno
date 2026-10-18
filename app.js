let products = [];
let activeFilter = "All";
let currentQuery = "";

const grid = document.getElementById("productGrid");
const empty = document.getElementById("emptyState");
const count = document.getElementById("resultCount");

const visualDefaults = [
  { shape: "bag-shape", tone: "tone-1" },
  { shape: "coat-shape", tone: "tone-2" },
  { shape: "shoe-shape", tone: "tone-3" },
  { shape: "wallet-shape", tone: "tone-4" },
  { shape: "scarf-shape", tone: "tone-5" },
  { shape: "sunglasses-shape", tone: "tone-6" }
];

function normalizeCategory(category = "") {
  const value = category.toLowerCase();

  if (value.includes("bag")) return "Bags";

  if (
    value.includes("clothing") ||
    value.includes("ready-to-wear") ||
    value.includes("outerwear")
  ) {
    return "Ready-to-wear";
  }

  if (value.includes("shoe")) return "Shoes";
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
  const filtered = products.filter(product => {
    const matchesFilter =
      activeFilter === "All" ||
      product.category === activeFilter;

    const query = currentQuery.trim().toLowerCase();

    const searchable =
      `${product.brand} ${product.name} ${product.category}`.toLowerCase();

    return matchesFilter &&
      (!query || searchable.includes(query));
  });

  grid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-art ${escapeHTML(product.tone)}">
        <span class="product-label">Preview concept</span>
        <div class="shape ${escapeHTML(product.shape)}"
             aria-hidden="true"></div>
      </div>

      <div class="product-info">
        <div class="product-brand">
          ${escapeHTML(product.brand)}
        </div>

        <h3 class="product-name">
          ${escapeHTML(product.name)}
        </h3>

        <div class="product-category">
          ${escapeHTML(product.category)}
        </div>

        <div class="product-price">
          Live retailer pricing <strong>coming soon</strong>
        </div>

        <span class="preview-tag">Explore concept ↗</span>
      </div>
    </article>
  `).join("");

  empty.hidden = filtered.length > 0;

  count.textContent =
    `${filtered.length} preview ${
      filtered.length === 1 ? "piece" : "pieces"
    }`;
}

async function loadProducts() {
  try {
    const response = await fetch(
      "./zelqeno-products.json",
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Catalogue loading failed: ${response.status}`);
    }

    const catalogue = await response.json();

    if (!Array.isArray(catalogue.products)) {
      throw new Error("Invalid catalogue format.");
    }

    products = catalogue.products.map(prepareProduct);
    renderProducts();

  } catch (error) {
    console.error("ZELQENO catalogue error:", error);

    grid.innerHTML = "";
    empty.hidden = false;
    count.textContent = "Catalogue temporarily unavailable";
  }
}

document.getElementById("searchForm").addEventListener("submit", event => {
  event.preventDefault();

  currentQuery = document.getElementById("searchInput").value;

  renderProducts();

  document.getElementById("discover").scrollIntoView({
    behavior: "smooth"
  });
});

document.querySelectorAll(".brand-tile").forEach(button => {
  button.addEventListener("click", () => {
    currentQuery = button.dataset.brand;

    document.getElementById("searchInput").value = currentQuery;

    activeFilter = "All";

    document.querySelectorAll(".filter").forEach(filterButton => {
      filterButton.classList.toggle(
        "active",
        filterButton.dataset.filter === "All"
      );
    });

    renderProducts();

    document.getElementById("discover").scrollIntoView({
      behavior: "smooth"
    });
  });
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
   activeFilter =
  button.dataset.filter.toLowerCase() === "all pieces" ||
  button.dataset.filter.toLowerCase() === "all"
    ? "All"
    : button.dataset.filter;

    document.querySelectorAll(".filter").forEach(filterButton => {
      filterButton.classList.toggle(
        "active",
        filterButton === button
      );
    });

    renderProducts();
  });
});

document.getElementById("year").textContent =
  new Date().getFullYear();

loadProducts();
