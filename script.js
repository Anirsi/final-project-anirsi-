let products = [];

let cart = JSON.parse(localStorage.getItem('sneakerCart')) || [];

const productsContainer = document.getElementById('products-container');
const cartSticky = document.getElementById('cart-sticky');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
const showAllBtn = document.getElementById('show-all-btn');

async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        products = await response.json();
        console.log('Товары загружены:', products.length, 'шт.');
        renderProducts(products);
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        products = getDemoProducts();
        renderProducts(products);
        showNotification('Используются демо-товары (проблема с загрузкой JSON)');
    }
}

function getDemoProducts() {
    return [
        {
            id: 1,
            name: "Демо: Nike Air Max",
            price: 9999,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            category: "Мужчины",
            description: "Демонстрационный товар"
        }
    ];
}

function renderProducts(productsArray) {
    productsContainer.innerHTML = '';
    
    if (productsArray.length === 0) {
        productsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3>Товары не найдены</h3>
                <p>Попробуйте позже</p>
            </div>
        `;
        return;
    }
    
    productsArray.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price.toLocaleString()} ₽</div>
                <div class="product-actions">
                    <button class="btn-details" onclick="showDetails(${product.id})">Подробнее</button>
                    <button class="btn-add" onclick="addToCart(${product.id})">В корзину</button>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

function showDetails(id) {
    const product = products.find(p => p.id === id);
    alert(`${product.name}\nЦена: ${product.price.toLocaleString()} ₽\nКатегория: ${product.category}\n\n${product.description}`);
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
        showNotification('Товар не найден!');
        return;
    }
    
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    showNotification(`${product.name} добавлен в корзину!`);
}

function updateCart() {
    localStorage.setItem('sneakerCart', JSON.stringify(cart));
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    renderCartItems();
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = `${totalPrice.toLocaleString()} ₽`;
}

function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Корзина пуста</p>';
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toLocaleString()} ₽ × ${item.quantity}</p>
                <p class="cart-item-price">${(item.price * item.quantity).toLocaleString()} ₽</p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">&times;</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    showNotification('Товар удалён из корзины');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: #4ecdc4;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 9999;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: fadeInOut 3s ease-in-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

cartSticky.addEventListener('click', () => {
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeCartBtn.addEventListener('click', () => {
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Корзина пуста!');
        return;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (confirm(`Оформить заказ на ${total.toLocaleString()} ₽?`)) {
        showNotification('Заказ оформлен! Это демо-версия.');
        cart = [];
        updateCart();
        cartModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

showAllBtn.addEventListener('click', () => {
    alert('Здесь будет открытие полного каталога с 40+ товарами. Пока что у нас 6 демо-товаров из JSON.\n\nДобавляй новые товары в файл data/products.json!');
});


window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCart();
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            15% { opacity: 1; transform: translateY(0); }
            85% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
});