document.addEventListener('DOMContentLoaded', function() {
    fetchCartItems();
});

function fetchCartItems() {
    fetch('../../backend/userFUNCTIONS/Cart/fetchCART.php')
        .then(response => response.json())
        .then(data => {
            const cartContainer = document.getElementById('cart-items');
            let total = 0;

            if (data.length === 0) {
                cartContainer.innerHTML = '<p class="text-center">Your cart is empty</p>';
                return;
            }

            let html = '<div class="list-group">';
            data.forEach(item => {
                const itemTotal = item.price * item.quantity;
                html += `
                    <div class="list-group-item cart-item">
                        <div class="row align-items-center">
                            <div class="col-md-1 checkbox-container">
                                <input type="checkbox" class="item-checkbox" data-item-id="${item.product_id}" data-item-total="${itemTotal}" onchange="updateTotal()">
                            </div>
                            <div class="col-md-2">
                                <img src="../../uploads/${item.image_url}" class="img-fluid" alt="${item.name}">
                            </div>
                            <div class="col-md-3">
                                <h5>${item.name}</h5>
                                <p class="text-muted">₱${item.price}</p>
                            </div>
                            <div class="col-md-3">
                                <div class="input-group quantity-control">
                                    <button class="btn btn-outline-secondary" onclick="updateQuantity(${item.product_id}, -1)">-</button>
                                    <input type="number" class="form-control text-center" value="${item.quantity}" readonly>
                                    <button class="btn btn-outline-secondary" onclick="updateQuantity(${item.product_id}, 1)">+</button>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <p class="mb-0">₱${itemTotal.toFixed(2)}</p>
                            </div>
                            <div class="col-md-1">
                                <button class="btn btn-danger btn-sm" onclick="removeItem(${item.product_id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            cartContainer.innerHTML = html;

            // Restore checkbox states
            restoreCheckboxStates();
            updateTotal();
        })
        .catch(error => console.error('Error fetching cart:', error));
}

function updateTotal() {
    let total = 0;
    document.querySelectorAll('.item-checkbox:checked').forEach(checkbox => {
        total += parseFloat(checkbox.getAttribute('data-item-total'));
    });
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

function updateQuantity(productId, change) {
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('change', change);

    fetch('../../backend/userFUNCTIONS/Cart/updateCART.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            fetchCartItems();
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error updating quantity:', error));
}

function removeItem(productId) {
    if (confirm('Are you sure you want to remove this item?')) {
        const formData = new FormData();
        formData.append('product_id', productId);

        fetch('../../backend/userFUNCTIONS/Cart/removeFromCART.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                fetchCartItems();
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error removing item:', error));
    }
}

// Store checkbox states in local storage
function storeCheckboxStates() {
    const checkboxStates = {};
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkboxStates[checkbox.getAttribute('data-item-id')] = checkbox.checked;
    });
    localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
}

// Restore checkbox states from local storage
function restoreCheckboxStates() {
    const checkboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        const itemId = checkbox.getAttribute('data-item-id');
        if (checkboxStates[itemId]) {
            checkbox.checked = true;
        }
    });
}

// Update total and store checkbox states on checkbox change
document.addEventListener('change', function(event) {
    if (event.target.classList.contains('item-checkbox')) {
        updateTotal();
        storeCheckboxStates();
    }
});