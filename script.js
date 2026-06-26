/* =========================
   ALEXVERSE SCRIPT
========================= */

/* -------------------------
   PRODUCT DATA
-------------------------- */

const products = [

   {
      id: 1,
      name: "Leather Tote Bag",
      category: "Bags",
      price: 129.99,
      rating: 4.8,
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa"
   },

   {
      id: 2,
      name: "Luxury Chronograph Watch",
      category: "Watches",
      price: 249.99,
      rating: 4.9,
      badge: "Premium",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49"
   },

   {
      id: 3,
      name: "Designer Sneakers",
      category: "Footwear",
      price: 159.99,
      rating: 4.7,
      badge: "Trending",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
   },

   {
      id: 4,
      name: "Classic Sunglasses",
      category: "Accessories",
      price: 89.99,
      rating: 4.6,
      badge: "Hot",
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083"
   },

   {
      id: 5,
      name: "Wireless Earbuds Pro",
      category: "Electronics",
      price: 119.99,
      rating: 4.8,
      badge: "Top Rated",
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1"
   },

   {
      id: 6,
      name: "Premium Coffee Set",
      category: "Home",
      price: 79.99,
      rating: 4.5,
      badge: "New",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
   }

];

/* -------------------------
   STATE
-------------------------- */

let cart = JSON.parse(localStorage.getItem("alexverse_cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("alexverse_wishlist")) || [];

let activeCategory = null;
let minPrice = null;
let maxPrice = null;
let sortOption = "default";
let searchQuery = "";

/* -------------------------
   ELEMENTS
-------------------------- */

const productGrid = document.getElementById("productGrid");
const cartCounter = document.getElementById("cartCounter");
const wishlistCounter = document.getElementById("wishlistCounter");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");

const categoryFilters = document.getElementById("categoryFilters");
const priceMinInput = document.getElementById("priceMin");
const priceMaxInput = document.getElementById("priceMax");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");

/* -------------------------
   INIT
-------------------------- */

document.addEventListener("DOMContentLoaded", () => {
   /* =========================
      PANEL CONTROLS
   ========================= */

   const cartBtn = document.getElementById("cartBtn");
   const cartSidebar = document.getElementById("cartSidebar");
   const cartOverlay = document.getElementById("cartOverlay");
   const cartClose = document.getElementById("cartClose");

   const filterBtn = document.getElementById("filterToggleBtn");
   const filterSidebar = document.getElementById("filterSidebar");
   const filterOverlay = document.getElementById("filterOverlay");
   const filterClose = document.getElementById("filterClose");

   const userBtn = document.getElementById("userBtn");
   const authOverlay = document.getElementById("authOverlay");
   const authClose = document.getElementById("authClose");

   const searchBtn = document.getElementById("searchToggleBtn");
   const searchContainer = document.getElementById("searchContainer");

   /* CART */

   cartBtn.addEventListener("click", () => {
      cartSidebar.classList.add("active");
      cartOverlay.classList.add("active");
   });

   cartClose.addEventListener("click", closeCart);
   cartOverlay.addEventListener("click", closeCart);

   function closeCart() {
      cartSidebar.classList.remove("active");
      cartOverlay.classList.remove("active");
   }

   /* FILTER */

   filterBtn.addEventListener("click", () => {
      filterSidebar.classList.add("active");
      filterOverlay.classList.add("active");
   });

   filterClose.addEventListener("click", closeFilter);
   filterOverlay.addEventListener("click", closeFilter);

   function closeFilter() {
      filterSidebar.classList.remove("active");
      filterOverlay.classList.remove("active");
   }

   /* LOGIN */

   userBtn.addEventListener("click", () => {
      authOverlay.classList.add("active");
   });

   authClose.addEventListener("click", () => {
      authOverlay.classList.remove("active");
   });

   authOverlay.addEventListener("click", (e) => {
      if (e.target === authOverlay) {
         authOverlay.classList.remove("active");
      }
   });

   /* SEARCH */

   searchBtn.addEventListener("click", () => {
      searchContainer.classList.toggle("active");
   });
   renderProducts();
   renderCategories();
   updateCartUI();
   updateWishlistUI();

});

/* -------------------------
   RENDER PRODUCTS
-------------------------- */

function renderProducts() {

   let filtered = [...products];

   if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory);
   }

   if (minPrice !== null) {
      filtered = filtered.filter(p => p.price >= minPrice);
   }

   if (maxPrice !== null) {
      filtered = filtered.filter(p => p.price <= maxPrice);
   }

   if (searchQuery) {
      filtered = filtered.filter(p =>
         p.name.toLowerCase().includes(searchQuery)
      );
   }

   if (sortOption === "priceAsc") {
      filtered.sort((a, b) => a.price - b.price);
   }

   if (sortOption === "priceDesc") {
      filtered.sort((a, b) => b.price - a.price);
   }

   if (sortOption === "nameAsc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
   }

   if (sortOption === "nameDesc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
   }

   productGrid.innerHTML = "";

   filtered.forEach(product => {

      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `

${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}

<img src="${product.image}" class="product-image">

<div class="product-info">

<div class="product-name">${product.name}</div>

<div class="product-price">$${product.price.toFixed(2)}</div>

<div class="rating">⭐ ${product.rating}</div>

<button class="add-to-cart-btn" onclick="addToCart(${product.id})">
Add to Cart
</button>

<button class="add-to-cart-btn"
style="margin-top:8px;background:#fff;color:#111;border:1px solid #ddd"
onclick="addToWishlist(${product.id})">
Add to Wishlist
</button>

</div>
`;

      productGrid.appendChild(card);

   });

}

/* -------------------------
   CATEGORIES
-------------------------- */

function renderCategories() {

   const categories = [...new Set(products.map(p => p.category))];

   categories.forEach(cat => {

      const btn = document.createElement("button");
      btn.textContent = cat;

      btn.onclick = () => {
         activeCategory = cat;
         renderProducts();
      };

      categoryFilters.appendChild(btn);

   });

}

/* -------------------------
   CART
-------------------------- */

function addToCart(id) {

   const item = products.find(p => p.id === id);
   cart.push(item);

   localStorage.setItem("alexverse_cart", JSON.stringify(cart));

   updateCartUI();
   showToast("Item added to cart");

}

function updateCartUI() {

   cartCounter.textContent = cart.length;

   cartItemsContainer.innerHTML = "";

   let total = 0;

   cart.forEach((item, index) => {

      total += item.price;

      const div = document.createElement("div");
      div.style.marginBottom = "15px";
      div.innerHTML = `
${item.name} - $${item.price.toFixed(2)}
<button onclick="removeFromCart(${index})">✕</button>
`;

      cartItemsContainer.appendChild(div);

   });

   cartTotal.textContent = "$" + total.toFixed(2);

}

function removeFromCart(index) {

   cart.splice(index, 1);
   localStorage.setItem("alexverse_cart", JSON.stringify(cart));
   updateCartUI();

}

/* -------------------------
   WISHLIST
-------------------------- */

function addToWishlist(id) {

   const item = products.find(p => p.id === id);
   wishlist.push(item);

   localStorage.setItem("alexverse_wishlist", JSON.stringify(wishlist));

   updateWishlistUI();
   showToast("Added to wishlist");

}

function updateWishlistUI() {

   wishlistCounter.textContent = wishlist.length;

}

/* -------------------------
   FILTER EVENTS
-------------------------- */

sortSelect.addEventListener("change", (e) => {
   sortOption = e.target.value;
   renderProducts();
});

priceMinInput.addEventListener("input", (e) => {
   minPrice = e.target.value ? parseFloat(e.target.value) : null;
   renderProducts();
});

priceMaxInput.addEventListener("input", (e) => {
   maxPrice = e.target.value ? parseFloat(e.target.value) : null;
   renderProducts();
});

searchInput.addEventListener("input", (e) => {
   searchQuery = e.target.value.toLowerCase();
   renderProducts();
});

/* -------------------------
   TOAST
-------------------------- */

function showToast(message) {

   toast.textContent = message;
   toast.classList.add("show");

   setTimeout(() => {
      toast.classList.remove("show");
   }, 2000);

}