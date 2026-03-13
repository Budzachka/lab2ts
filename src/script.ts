interface Category {
  id: number;
  name: string;
  shortname: string;
  notes: string;
}

interface Product {
  id: number;
  name: string;
  shortname: string;
  description: string;
  price: string;
}

interface CategoryData {
  categoryName: string;
  items: Product[];
}

interface SpecialProduct extends Product {
  categoryName: string;
}

const app = document.getElementById("app") as HTMLElement;
const homeLink = document.getElementById("home-link") as HTMLAnchorElement;
const catalogLink = document.getElementById("catalog-link") as HTMLAnchorElement;

async function fetchJSON<T>(url: string): Promise<T> {
  const response: Response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Не вдалося завантажити файл: ${url}`);
  }

  return (await response.json()) as T;
}

function getProductImageUrl(productName: string): string {
  const encodedName: string = encodeURIComponent(productName);
  return `https://placehold.co/200x200?text=${encodedName}`;
}

function getRandomItems<T>(items: T[], count: number): T[] {
  const shuffled: T[] = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function renderHome(): void {
  app.innerHTML = `
    <h1 class="page-title">Ласкаво просимо до каталогу товарів</h1>
    <p class="page-subtitle">
      Це односторінковий веб-застосунок, створений за допомогою TypeScript.
      Для перегляду категорій натисніть кнопку <strong>Catalog</strong>.
    </p>
  `;
}

function renderError(message: string): void {
  app.innerHTML = `
    <div class="error-message">
      <strong>Помилка:</strong> ${message}
    </div>
  `;
}

async function loadCatalog(): Promise<void> {
  try {
    const categories: Category[] = await fetchJSON<Category[]>("./data/categories.json");

    const categoryCardsHtml: string = categories
      .map((category: Category) => {
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
    categoryButtons.forEach((button: Element) => {
      button.addEventListener("click", async (event: Event) => {
        const target = event.currentTarget as HTMLButtonElement;
        const shortname = target.dataset.shortname;

        if (shortname) {
          await loadCategory(shortname);
        }
      });
    });

    const specialsButton = document.getElementById("specials-btn") as HTMLButtonElement;
    specialsButton.addEventListener("click", async () => {
      await loadSpecials(categories);
    });
  } catch (error) {
    renderError((error as Error).message);
  }
}

async function loadCategory(shortname: string): Promise<void> {
  try {
    const categoryData: CategoryData = await fetchJSON<CategoryData>(`./data/${shortname}.json`);

    const productsHtml: string = categoryData.items
      .map((product: Product) => {
        const imageUrl: string = getProductImageUrl(product.name);

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

    const backButton = document.getElementById("back-to-catalog") as HTMLButtonElement;
    backButton.addEventListener("click", async () => {
      await loadCatalog();
    });
  } catch (error) {
    renderError((error as Error).message);
  }
}

async function loadSpecials(categories: Category[]): Promise<void> {
  try {
    const specials: SpecialProduct[] = [];

    for (const category of categories) {
      const categoryData: CategoryData = await fetchJSON<CategoryData>(`./data/${category.shortname}.json`);

      if (categoryData.items.length > 0) {
        const randomProducts: Product[] = getRandomItems(categoryData.items, 2);

        randomProducts.forEach((product: Product) => {
          specials.push({
            ...product,
            categoryName: categoryData.categoryName
          });
        });
      }
    }

    if (specials.length === 0) {
      renderError("Не вдалося сформувати список Specials.");
      return;
    }

    const shuffledSpecials: SpecialProduct[] = getRandomItems(specials, specials.length);

    const productsHtml: string = shuffledSpecials
      .map((product: SpecialProduct) => {
        const imageUrl: string = getProductImageUrl(product.name);

        return `
          <div class="product-card">
            <img src="${imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p><strong>Категорія:</strong> ${product.categoryName}</p>
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
      <h1 class="page-title">Specials</h1>
      <p class="page-subtitle">
        Тут відображаються випадкові товари з різних категорій.
      </p>
      <div class="products-grid">
        ${productsHtml}
      </div>
    `;

    const backButton = document.getElementById("back-to-catalog") as HTMLButtonElement;
    backButton.addEventListener("click", async () => {
      await loadCatalog();
    });
  } catch (error) {
    renderError((error as Error).message);
  }
}

function initNavigation(): void {
  homeLink.addEventListener("click", (event: MouseEvent) => {
    event.preventDefault();
    renderHome();
  });

  catalogLink.addEventListener("click", async (event: MouseEvent) => {
    event.preventDefault();
    await loadCatalog();
  });
}

function initApp(): void {
  initNavigation();
  renderHome();
}

initApp();
