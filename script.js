
// Update Cart Counter
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];  //Get the cart from localStorage, parse it into a JavaScript array.If there's nothing in storage, use an empty array.

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
//Sum the quantity of all products to get the total number of items.


const cartCountElement = document.getElementById('cart-count');
//Find the HTML element where the cart count should be displayed.


if (cartCount > 0) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = 'inline'; // Show badge
    } else {
        cartCountElement.style.display = 'none'; // Hide badge if cart is empty
    }
}
//Show or hide the badge depending on whether items exist.





// Add to Cart Functionality
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
//Get the current cart or initialize a new array.

    // Check if the item is already in the cart
    let existingProduct = cart.find(item => item.id === product.id);
//    Check if the product is already in the cart.


    if (existingProduct) {
        existingProduct.quantity += product.quantity;
    } else {
        cart.push(product);
    }
//If found, increase quantity; otherwise, add it as a new item.


    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart!');
    updateCartCounter();
}
//Save the updated cart and update the badge count.




// Fetch Products from JSON
async function fetchProducts() {
    try {
        const response = await fetch('products.json');
//Load the products.json file asynchronously.


        if (!response.ok) throw new Error('Failed to load products.');
        return await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
        return { products: [] };
    }
}
//Handle errors and fallback to empty list if failed.



// Initialize product-related functionalities
async function initializeProducts() {
    const productContainer = document.querySelector('#featured-products-container');
    if (!productContainer) return;
//Find the container to place product cards in. Exit if not found.


    const data = await fetchProducts();
    const products = data.products || [];
//Load and store products.

    products.forEach(product => {
        const stars = Array.from({ length: 5 }, (_, i) =>
            `<i class="bi ${i < product.rating ? 'bi-star-fill' : 'bi-star'}"></i>`
        ).join('');
//Create HTML for star ratings.


        const productCard = `
            <div class="col-6 col-sm-6 col-md-6 col-lg-3">
                <a href="sproduct.html?id=${product.id}" class="product-link">
                    <div class="card">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="card-body">
                            <span class="brand">${product.brand}</span>
                            <p>${product.name}</p>
                            <div class="rating">${stars}</div>
                            <span class="price">${product.price}</span>
                            <button class="add-to-cart-btn mt-3" 
                                data-id="${product.id}" 
                                data-name="${product.name}" 
                                data-price="${product.price.replace('$', '')}" 
                                data-image="${product.image}">
                                <i class="bi bi-cart3"></i>
                            </button>
                        </div>
                    </div>
                </a>
            </div>
        `;
        productContainer.innerHTML += productCard;
    });

//Generate and inject product cards into the DOM.



    // Attach event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
//Add click listeners to all "Add to Cart" buttons.


            const product = {
                id: parseInt(this.dataset.id),
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: this.dataset.image,
                quantity: 1
            };
            addToCart(product);
        });
    });
}

//Extract product data from button, create product object, and add it to cart.






// Initialize single product page
async function initializeSingleProduct() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const productDetails = document.getElementById('product-details');

    if (!productId || !productDetails) return;

//Get product ID from URL and target the section to display it.


    const data = await fetchProducts();
    const product = data.products.find(p => p.id === parseInt(productId));
//Find the product based on ID.



    if (!product) {
        productDetails.innerHTML = '<p>Product not found.</p>';
        return;
    }
//Show message if the product is not found.



    // Populate product details
    document.getElementById('MainImg').src = product.image;
    document.querySelector('.sproduct-details h4').textContent = product.name;
    document.querySelector('.sproduct-details h2').textContent = product.price;
//Populate the product detail page.





    // Add to Cart button functionality
    const addToCartButton = document.querySelector('.sproduct-details button');
    addToCartButton.addEventListener('click', () => {
        const quantity = parseInt(document.querySelector('.sproduct-details input[type="number"]').value) || 1;

        addToCart({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price.replace('$', '')),
            image: product.image,
            quantity: quantity
        });
    });
}
//Let users add the product to cart with selected quantity.





// Initialize cart page
function initializeCart() {
    const cartItemsContainer = document.querySelector('#cart-items');
    const cartSubtotal = document.querySelector('#cart-subtotal');
    const cartTotal = document.querySelector('#cart-total');
    const couponInput = document.querySelector('.coupon-input');
    const applyBtn = document.querySelector('.apply-btn');

    if (!cartItemsContainer || !cartSubtotal || !cartTotal) return;
//Select cart elements; stop if any is missing.


    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let appliedCoupon = null;
//Load cart and initialize coupon.



    // Function to update cart totals
    function updateCartTotals() {
        let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let discount = appliedCoupon ? subtotal * appliedCoupon : 0;
        let total = subtotal - discount;
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTotal.innerHTML = `<strong>$${total.toFixed(2)}</strong>`;
    }
//Calculate and show subtotal, discount, and total.


    // Function to render cart items
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';

//Clear previous items.

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<tr><td colspan="6">Your cart is empty.</td></tr>';
            updateCartTotals();
            return;
        }
//Show empty message if no items in cart.



        cart.forEach(item => {
            const cartRow = `
                <tr data-id="${item.id}">
                    <td><a href="#" class="remove-item"><i class="bi bi-x-circle"></i></a></td>
                    <td><img src="${item.image}" alt="${item.name}" width="50"></td>
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td><input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}"></td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
            `;
            cartItemsContainer.innerHTML += cartRow;
        });

        updateCartTotals();
    }
//Render cart rows with quantity and price.



    // Update quantity and subtotal when quantity changes
    cartItemsContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const productId = parseInt(e.target.dataset.id);
            const newQuantity = parseInt(e.target.value);
            const product = cart.find(item => item.id === productId);

            if (product) {
                product.quantity = newQuantity > 0 ? newQuantity : 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCartItems();
                updateCartCounter();
            }
        }
    });

    //Allow users to change quantities, and update cart.


    // Remove item from cart
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) {
            const productId = parseInt(e.target.closest('tr').dataset.id);
            cart = cart.filter(item => item.id !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
            updateCartCounter();
        }
    });
//Handle removing items from the cart.



    // Initialize cart items
    renderCartItems();
}
//Load items when cart page is opened.



// Initialize based on the page
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    initializeProducts();
    initializeSingleProduct();
    initializeCart();
});
//Wait for the DOM to load, then initialize all features depending on the page.

