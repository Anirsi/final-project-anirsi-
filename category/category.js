const categoryConfig = {
    'men': {
        title: 'МУЖСКИЕ КРОССОВКИ',
        subtitle: 'Сила, стиль и технологии для настоящих победителей',
        icon: 'fas fa-dumbbell',
        description: 'От беговых до баскетбольных — выбери свою силу',
        color: '#4ecdc4',
        filter: 'Мужчины'
    },
    'women': {
        title: 'ЖЕНСКИЕ КРОССОВКИ',
        subtitle: 'Лёгкость, грация и невероятный комфорт в каждом шаге',
        icon: 'fas fa-heart',
        description: 'Для спорта, фитнеса и повседневного стиля',
        color: '#ff6b6b',
        filter: 'Женщины'
    },
    'special': {
        title: 'ИНТЕРЕСНЫЕ МОДЕЛИ',
        subtitle: 'Эксклюзив, коллаборации и уникальные решения',
        icon: 'fas fa-star',
        description: 'То, что выделит тебя из толпы',
        color: '#ffd166',
        filter: 'Унисекс' // Или специальная логика
    }
};

function getCurrentCategory() {
    const path = window.location.pathname;
    if (path.includes('men.html') || path.includes('men')) return 'men';
    if (path.includes('women.html') || path.includes('women')) return 'women';
    if (path.includes('special.html') || path.includes('special')) return 'special';
    return 'men';
}

// Загружаем товары категории
async function loadCategoryProducts() {
    const category = getCurrentCategory();
    const config = categoryConfig[category];
    
    try {
        // Загружаем все товары
        const response = await fetch('data/products.json');
        const allProducts = await response.json();
        
     // Фильтруем по категории
    let categoryProducts = allProducts.filter(product => {
    if (category === 'men') return product.category === 'Мужчины';
    if (category === 'women') return product.category === 'Женщины';
    if (category === 'special') {
        return product.category === 'Унисекс' || product.price > 14000;
    }
    return true;
});
        
        // Если товаров меньше 12 - добавляем унисекс
        if (categoryProducts.length < 12) {
            const unisexProducts = allProducts.filter(p => p.category === 'Унисекс');
            categoryProducts = [...categoryProducts, ...unisexProducts.slice(0, 12 - categoryProducts.length)];
        }

        if (category === 'special') {
    // Берём товары с featured: true, либо самые дорогие
    return product.featured === true || product.price > 20000;
}
        
        // Ограничиваем 12 товарами
        categoryProducts = categoryProducts.slice(0, 12);
        
        // Обновляем интерфейс
        updateCategoryUI(config, categoryProducts);
        renderCategoryProducts(categoryProducts);
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showError();
    }
}

// Обновляем интерфейс категории
function updateCategoryUI(config, products) {
    // Заголовки
    document.title = config.title + ' | SNEAKER HUB';
    document.getElementById('hero-title').textContent = config.title;
    document.getElementById('hero-subtitle').textContent = config.subtitle;
    document.getElementById('category-name').textContent = config.title.split(' ')[0]; // "МУЖСКИЕ"
    document.getElementById('category-description').textContent = config.description;
    
    // Иконка
    const icon = document.getElementById('category-icon');
    icon.className = config.icon;
    icon.style.color = config.color;
    
    // Статистика
    document.getElementById('products-count').textContent = products.length;
    
    // Средняя цена
    if (products.length > 0) {
        const avgPrice = Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length);
        document.getElementById('avg-price').textContent = avgPrice.toLocaleString() + ' ₽';
    }
    
    // Активное меню
    const currentPage = getCurrentCategory();
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`a[href="${currentPage}.html"]`).classList.add('active');
    
    // Класс для body
    document.body.classList.add(`${currentPage}-page`);
}

// Рендерим товары категории
function renderCategoryProducts(products) {
    const container = document.getElementById('category-products-grid');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <i class="fas fa-box-open fa-4x" style="color: #ddd; margin-bottom: 20px;"></i>
                <h3>Товары скоро появятся</h3>
                <p>Мы готовим для вас лучшие модели</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" 
                     style="width:100%; height:100%; object-fit:cover;">
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
        container.appendChild(productCard);
    });
}

// Показываем детали товара
function showProductDetails(id) {
    fetch('data/products.json')
        .then(res => res.json())
        .then(products => {
            const product = products.find(p => p.id === id);
            if (product) {
                alert(`
${product.name}

Цена: ${product.price.toLocaleString()} ₽
Категория: ${product.category}

${product.description}

Доступные размеры: 38-45
Цвета: в наличии
                `);
            }
        });
}

// Обработка поиска на странице категории
function setupSearch() {
    const searchInput = document.getElementById('category-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const products = document.querySelectorAll('.product-card');
            
            products.forEach(card => {
                const title = card.querySelector('.product-title').textContent.toLowerCase();
                const category = card.querySelector('.product-category').textContent.toLowerCase();
                
                if (title.includes(term) || category.includes(term)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Показываем ошибку
function showError() {
    const container = document.getElementById('category-products-grid');
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
            <i class="fas fa-exclamation-triangle fa-4x" style="color: #ff6b6b; margin-bottom: 20px;"></i>
            <h3>Ошибка загрузки</h3>
            <p>Попробуйте обновить страницу</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #4ecdc4; color: white; border: none; border-radius: 8px; cursor: pointer;">
                Обновить страницу
            </button>
        </div>
    `;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadCategoryProducts();
    setupSearch();
    
    // Добавляем в корзину (функция из script.js уже доступна)
    window.addToCart = window.addToCart || function(id) {
        alert('Товар добавлен в корзину! (функция из script.js)');
    };
});