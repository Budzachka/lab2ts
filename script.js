"use strict";
const app = document.getElementById("app");
const homeLink = document.getElementById("home-link");
const catalogLink = document.getElementById("catalog-link");
async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Не вдалося завантажити файл: ${url}`);
    }
    return (await response.json());
}
function getProductImageUrl(productName) {
    const encodedName = encodeURIComponent(productName);
    return `https://placehold.co/200x200?text=${encodedName}`;
}
function renderHome() {
    app.innerHTML = `
    <h1 class="page-title">Ласкаво просимо до каталогу товарів</h1>
    <p class="page-subtitle">
      Для перегляду категорій натисніть кнопку <strong>Catalog</strong>.
    </p>
  `;
}
function renderError(message) {
    app.innerHTML = `
    <div class="error-message">
      <strong>Помилка:</strong> ${message}
    </div>
  `;
}
async function loadCatalog() {
    try {
        const categories = await fetchJSON("./data/categories.json");
        const categoryCardsHtml = categories
            .map((category) => {
            return `
          <div class="category-card">
            <h3>${category.name}</h3>
            <p>${category.notes || "Опис категорії відсутній."}</p>
            <button class="category-btn" data-shortname="${category.shortname}">
              Відкрити категорію
            </button>
          </div>
        `;
        })
            .join("");
        app.innerHTML = `
      <h1 class="page-title">Каталог категорій</h1>
      <div class="categories-list">
        ${categoryCardsHtml}
      </div>
      <div class="specials-wrapper">
        <button class="specials-btn" id="specials-btn">Specials</button>
      </div>
    `;
        const categoryButtons = document.querySelectorAll(".category-btn");
        categoryButtons.forEach((button) => {
            button.addEventListener("click", async (event) => {
                const target = event.currentTarget;
                const shortname = target.dataset.shortname;
                if (shortname) {
                    await loadCategory(shortname);
                }
            });
        });
        const specialsButton = document.getElementById("specials-btn");
        specialsButton.addEventListener("click", async () => {
            await loadRandomCategory(categories);
        });
    }
    catch (error) {
        renderError(error.message);
    }
}
async function loadCategory(shortname) {
    try {
        const categoryData = await fetchJSON(`./data/${shortname}.json`);
        const productsHtml = categoryData.items
            .map((product) => {
            const imageUrl = getProductImageUrl(product.name);
            return `
          <div class="product-card">
            <img src="${imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">${product.price}</div>
          </div>
        `;
        })
            .join("");
        app.innerHTML = `
      <div class="actions">
        <button class="back-btn" id="back-to-catalog">← Назад до каталогу</button>
      </div>
      <h1 class="page-title">${categoryData.categoryName}</h1>
      <div class="products-grid">
        ${productsHtml}
      </div>
    `;
        const backButton = document.getElementById("back-to-catalog");
        backButton.addEventListener("click", async () => {
            await loadCatalog();
        });
    }
    catch (error) {
        renderError(error.message);
    }
}
async function loadRandomCategory(categories) {
    if (categories.length === 0) {
        renderError("Список категорій порожній.");
        return;
    }
    const randomIndex = Math.floor(Math.random() * categories.length);
    const randomCategory = categories[randomIndex];
    await loadCategory(randomCategory.shortname);
}
function initNavigation() {
    homeLink.addEventListener("click", (event) => {
        event.preventDefault();
        renderHome();
    });
    catalogLink.addEventListener("click", async (event) => {
        event.preventDefault();
        await loadCatalog();
    });
}
function initApp() {
    initNavigation();
    renderHome();
}
initApp();
