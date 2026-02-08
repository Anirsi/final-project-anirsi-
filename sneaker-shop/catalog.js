// catalog.js - Логика страницы каталога

let allProducts = []; // Все товары из JSON
let filteredProducts = []; // Отфильтрованные товары
let currentPage = 1;
const productsPerPage = 12;
let currentView = 'grid'; // 'grid' или 'list'

// DOM элементы
const catalogProducts = document.getElementById('catalog-products');
const loadMoreBtn = document.getElementById('load-more');
const pageNumbers = document.getElementById('page-numbers');
const noResults = document.getElementById('no-results');
const sortSelect = document.getElementById('sort-select');
const searchInput = document.getElementById('search-input');
const clearFiltersBtn = document.getElementById('clear-filters');
const viewGridBtn = document.getElementById('view-grid');
const viewListBtn = document.getElementById('view-list');
const totalProductsSpan = document.getElementById('total-products');
const shownProductsSpan = document.getElementById('shown-products');

// Элементы фильтров
const categoryCheckboxes = document.querySelectorAll('.filter-checkbox input');
const priceMinInput = document.getElementById('price-min');
const priceMaxInput = document.getElementById('price-max');
const sliderMin = document.getElementById('slider-min');
const sliderMax = document.getElementById('slider-max');

// ==================== ЗАГРУЗКА ТОВАРОВ ====================
async function loadCatalogProducts() {
    try {
        const response = await fetch('data/products.json');
        allProducts = await response.json();
        console.log('Загружено товаров:', allProducts.length);
        
        // Обновляем статистику
        totalProductsSpan.textContent = allProducts.length;
        
        // Применяем фильтры и сортировку
        applyFiltersAndSort();
        
        // Рендерим первую страницу
        renderCatalogPage();
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        catalogProducts.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3>Ошибка загрузки каталога</h3>
                <p>Попробуйте обновить страницу</p>
            </div>
        `;
    }
}

// ==================== ФИЛЬТРАЦИЯ И СОРТИРОВКА ====================
function applyFiltersAndSort() {
    // 1. Копируем все товары
    filteredProducts = [...allProducts];
    
    // 2. Применяем фильтр по категориям
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
            selectedCategories.includes(product.category)
        );
    }
    
    // 3. Применяем фильтр по цене
    const minPrice = parseInt(priceMinInput.value) || 0;
    const maxPrice = parseInt(priceMaxInput.value) || 50000;
    
    filteredProducts = filteredProducts.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
    );
    
    // 4. Применяем поиск
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // 5. Применяем сортировку
    applySorting();
    
    // 6. Обновляем статистику
    updateStats();
    
    // 7. Сбрасываем на первую страницу
    currentPage = 1;
}

function applySorting() {
    const sortValue = sortSelect.value;
    
    switch(sortValue) {
        case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // По умолчанию - по ID (как в JSON)
            break;
    }
}

// ==================== РЕНДЕРИНГ СТРАНИЦЫ ====================
function renderCatalogPage() {
    // Считаем, какие товары показывать
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    // Очищаем контейнер
    catalogProducts.innerHTML = '';
    
    // Если товаров нет - показываем сообщение
    if (filteredProducts.length === 0) {
        noResults.style.display = 'block';
        loadMoreBtn.style.display = 'none';
        pageNumbers.innerHTML = '';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Рендерим товары
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-category">${product.category}</div>
                <div class="product-price">${product.price.toLocaleString()} ₽</div>
                <div class="product-actions">
                    <button class="btn-details" onclick="showProductDetails(${product.id})">
                        <i class="fas fa-info-circle"></i> Подробнее
                    </button>
                    <button class="btn-add" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> В корзину
                    </button>
                </div>
            </div>
        `;
        catalogProducts.appendChild(productCard);
    });
    
    // Применяем выбранный вид (сетка/список)
    catalogProducts.className = `products-grid catalog-grid ${currentView}-view`;
    
    // Обновляем пагинацию
    updatePagination();
    
    // Показываем/скрываем кнопку "Показать ещё"
    loadMoreBtn.style.display = endIndex < filteredProducts.length ? 'flex' : 'none';
    loadMoreBtn.disabled = endIndex >= filteredProducts.length;
}

// ==================== ПАГИНАЦИЯ ====================
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    // Очищаем номера страниц
    pageNumbers.innerHTML = '';
    
    // Показываем максимум 5 страниц
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageBtn);
    }
}

function goToPage(page) {
    currentPage = page;
    renderCatalogPage();
    
    // Прокручиваем к началу товаров
    catalogProducts.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function loadMoreProducts() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (currentPage < totalPages) {
        currentPage++;
        renderCatalogPage();
    }
}

// ==================== ОБНОВЛЕНИЕ СТАТИСТИКИ ====================
function updateStats() {
    shownProductsSpan.textContent = filteredProducts.length;
    
    // Обновляем ползунки цены
    if (filteredProducts.length > 0) {
        const minPrice = Math.min(...filteredProducts.map(p => p.price));
        const maxPrice = Math.max(...filteredProducts.map(p => p.price));
        
        // Обновляем значения, но не триггерим событие
        priceMinInput.placeholder = minPrice;
        priceMaxInput.placeholder = maxPrice;
    }
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
function setupEventListeners() {
    // Кнопка "Показать ещё"
    loadMoreBtn.addEventListener('click', loadMoreProducts);
    
    // Сортировка
    sortSelect.addEventListener('change', () => {
        applyFiltersAndSort();
        renderCatalogPage();
    });
    
    // Поиск
    searchInput.addEventListener('input', () => {
        applyFiltersAndSort();
        renderCatalogPage();
    });
    
    // Сброс фильтров
    clearFiltersBtn.addEventListener('click', () => {
        // Сбрасываем чекбоксы
        categoryCheckboxes.forEach(cb => cb.checked = true);
        
        // Сбрасываем цену
        priceMinInput.value = '';
        priceMaxInput.value = '';
        sliderMin.value = 0;
        sliderMax.value = 50000;
        
        // Сбрасываем поиск
        searchInput.value = '';
        
        // Сбрасываем сортировку
        sortSelect.value = 'default';
        
        // Обновляем
        applyFiltersAndSort();
        renderCatalogPage();
    });
    
    // Фильтры категорий
    categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            applyFiltersAndSort();
            renderCatalogPage();
        });
    });
    
    // Фильтры цены
    priceMinInput.addEventListener('input', () => {
        sliderMin.value = priceMinInput.value || 0;
        applyFiltersAndSort();
        renderCatalogPage();
    });
    
    priceMaxInput.addEventListener('input', () => {
        sliderMax.value = priceMaxInput.value || 50000;
        applyFiltersAndSort();
        renderCatalogPage();
    });
    
    // Ползунки цены
    sliderMin.addEventListener('input', () => {
        priceMinInput.value = sliderMin.value;
        if (parseInt(sliderMin.value) > parseInt(sliderMax.value)) {
            sliderMax.value = sliderMin.value;
            priceMaxInput.value = sliderMin.value;
        }
        applyFiltersAndSort();
        renderCatalogPage();
    });
    
    sliderMax.addEventListener('input', () => {
        priceMaxInput.value = sliderMax.value;
        if (parseInt(sliderMax.value) < parseInt(sliderMin.value)) {
            sliderMin.value = sliderMax.value;
            priceMinInput.value = sliderMax.value;
        }
        applyFiltersAndSort();
        renderCatalogPage();
    });
    
    // Переключение вида
    viewGridBtn.addEventListener('click', () => {
        currentView = 'grid';
        viewGridBtn.classList.add('active');
        viewListBtn.classList.remove('active');
        renderCatalogPage();
    });
    
    viewListBtn.addEventListener('click', () => {
        currentView = 'list';
        viewListBtn.classList.add('active');
        viewGridBtn.classList.remove('active');
        renderCatalogPage();
    });
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function showProductDetails(id) {
    const product = allProducts.find(p => p.id === id);
    if (product) {
        alert(`${product.name}\nЦена: ${product.price.toLocaleString()} ₽\nКатегория: ${product.category}\n\n${product.description}`);
    }
}

// Функция addToCart уже есть в script.js - она будет работать

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    loadCatalogProducts();
    setupEventListeners();
    
    // Инициализируем ползунки цены
    updatePriceSlider();
});

function updatePriceSlider() {
    if (allProducts.length > 0) {
        const prices = allProducts.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        sliderMin.min = minPrice;
        sliderMin.max = maxPrice;
        sliderMin.value = minPrice;
        
        sliderMax.min = minPrice;
        sliderMax.max = maxPrice;
        sliderMax.value = maxPrice;
        
        priceMinInput.placeholder = minPrice;
        priceMaxInput.placeholder = maxPrice;
        priceMinInput.min = minPrice;
        priceMinInput.max = maxPrice;
        priceMaxInput.min = minPrice;
        priceMaxInput.max = maxPrice;
    }
}