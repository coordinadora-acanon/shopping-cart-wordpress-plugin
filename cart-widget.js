class CartWidget {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.cart = [];
    this.products = [];
    this.modal = null;
    this.init();
  }

  async init() {
    await this.loadProducts();
    await this.loadCart();
    this.render();
  }

  async loadProducts() {
    const response = await fetch(`${this.apiUrl}/products`);
    this.products = await response.json();
  }

  async loadCart() {
    const response = await fetch(`${this.apiUrl}/cart`);
    this.cart = await response.json();
  }

  openToast(message, duration) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.top = "75px";
    toast.style.right = "35px";
    toast.style.background = "#4eb46a";
    toast.style.color = "#fff";
    toast.style.padding = "10px";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = "1000";
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, duration);
  }

  async addItem(item, quantity) {
    const itemToSend = { ...item, quantity };
    await fetch(`${this.apiUrl}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemToSend),
    });
    this.openToast(
      `El producto ${item.name} ha sido agregado al carrito`,
      3000
    );
    await this.loadCart();
    await this.updateCartList();
    this.render();
  }

  async removeItem(itemId) {
    await fetch(`${this.apiUrl}/cart/${itemId}`, { method: "DELETE" });
    await this.loadCart();
    this.render();
    if (this.modal) {
      this.updateCartList();
    }
  }

  async clearCart() {
    await fetch(`${this.apiUrl}/cart`, { method: "DELETE" });
    await this.loadCart();
    this.render();
    if (this.modal) {
      this.updateCartList();
    }
  }

  render() {
    this.renderProducts();
    this.renderCartButton();
  }

  renderProducts() {
    const container = document.getElementById("product-grid");
    container.innerHTML = this.products
      .map(
        (product) => `
          <ion-col size="12" size-sm="6" size-lg="4">
              <ion-card>
                  <ion-card-header>
                      <ion-card-title>${product.name}</ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                      Precio: $${product.price}
                      <ion-input type="number" min="1" id="quantity-${product.id}" value="1"></ion-input>
                      <ion-button expand="block" fill="outline" onclick="cartWidget.addItem({ productId: '${product.id}', name: '${product.name}', price: ${product.price} }, document.getElementById('quantity-${product.id}').value)">Agregar al Carrito</ion-button>
                  </ion-card-content>
              </ion-card>
          </ion-col>
      `
      )
      .join("");
  }

  renderCartButton() {
    const cartButton = document.getElementById("cart-button");
    cartButton.innerHTML = `Carrito de Compras (${this.cart.length})`;
  }

  showCart = async () => {
    if (!this.modal) {
      this.modal = document.createElement("ion-modal");
      this.modal.component = "cart-modal";
      this.modal.cssClass = "my-custom-class";
      this.modal.componentProps = {
        cart: this.cart,
        removeItem: this.removeItem.bind(this),
        clearCart: this.clearCart.bind(this),
      };
      document.body.appendChild(this.modal);
    }
    await this.modal.present();
  };

  updateCartList() {
    const cartList = document.getElementById("cartList");
    cartList.innerHTML = this.cart
      .map(
        (item) => `
          <ion-item>
              <ion-label>
                  ${item.quantity} ${item.name} ($${item.price} c/u): $${
          item.price * item.quantity
        }
              </ion-label>
              <ion-button fill="outline" color="danger" slot="end" onclick="cartWidget.removeItem('${
                item.id
              }')">Eliminar</ion-button>
          </ion-item>
      `
      )
      .join("");
    const total = this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    document.getElementById("cartTotal").innerHTML = `Total: $${total}`;
  }
}

customElements.define(
  "cart-modal",
  class extends HTMLElement {
    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
          <ion-header>
              <ion-toolbar>
                  <ion-title>Carrito de Compras</ion-title>
                  <ion-buttons slot="end">
                      <ion-button onclick="dismissModal()">Cerrar</ion-button>
                  </ion-buttons>
              </ion-toolbar>
          </ion-header>
          <ion-content>
              <ion-list id="cartList">
                  ${cartWidget.cart
                    .map(
                      (item) => `
                      <ion-item>
                          <ion-label>
                              ${item.quantity} ${item.name} ($${
                        item.price
                      } c/u): $${item.price * item.quantity}
                          </ion-label>
                          <ion-button fill="outline" color="danger" slot="end" onclick="cartWidget.removeItem('${
                            item.id
                          }')">Remove</ion-button>
                      </ion-item>
                  `
                    )
                    .join("")}
              </ion-list>
              <ion-item id="cartTotal"></ion-item>
              <ion-button expand="full" color="danger" onclick="cartWidget.clearCart()">Vaciar Carrito</ion-button>
          </ion-content>
      `;
      const total = this.cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      document.getElementById("cartTotal").innerHTML = `Total: $${total}`;
    }
  }
);

function dismissModal() {
  const modal = document.querySelector("ion-modal");
  modal.dismiss();
}

const cartWidget = new CartWidget("http://localhost:3000");
document.addEventListener("DOMContentLoaded", () => cartWidget.init());
