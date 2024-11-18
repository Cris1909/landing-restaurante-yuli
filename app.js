const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

class RestaurantComponent {
  constructor() {
    this.menu = [];
    this.products = [];
    this.cart = [];
    this.initializeData();
    this.setupCart();
    this.renderInfo();
    this.renderMenu();
    this.setupCartButton();
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  loadCart() {
    const cart = localStorage.getItem("cart");
    this.cart = cart ? JSON.parse(cart) : [];
  }

  initializeData() {
    this.menu = DATA.menu;
    this.products = DATA.menu.map((category) => category.dishes).flat();
  }

  renderInfo() {
    const infoList = $("#info-list");
    infoList.innerHTML = this.renderInfoItems();
  }

  renderInfoItems() {
    return DATA.info
      .map(({ icon, title, description }) =>
        this.renderInfoItem(icon, title, description)
      )
      .join("");
  }

  renderInfoItem(icon, title, description) {
    return `
     <li>
      <div class="icon-container">
        <iconify-icon icon=${icon}></iconify-icon>
      </div>
      <div class="info-container">
        <h3>${title}</h3>
          ${description}
      </div>
    </li>
    `;
  }

  renderMenu() {
    const menuElement = $("#menu");
    menuElement.innerHTML = `
      <h2 class="title">Nuestro menú</h2>
      ${this.menu
        .map(
          ({ title, icon, dishes }) =>
            this.renderCategory(title, icon) + this.renderDishes(dishes)
        )
        .join("")}
    `;

    this.addEventListenersDishCards();
  }

  renderCategory(title, icon) {
    return `
      <div class="menu-separator">
        <iconify-icon icon="${icon}" aria-hidden="true"></iconify-icon>
        <h3 class="subtitle">${title}</h3>
      </div>
    `;
  }

  renderDishes(dishes) {
    return `
      <div class="dish-grid">
        ${dishes.map((dish) => this.renderDishCard(dish)).join("")}
      </div>
    `;
  }

  renderDishCard({ id, name, description, price, image }) {
    const initialQuantity =
      this.cart.find((item) => item.id === id)?.quantity || 0;

    return `
      <div class="dish-card ${
        initialQuantity ? "with-quantity" : ""
      }" id="dish-card-${id}">
        <img src="${image}" alt="${name}" />
        <div class="dish-info">
          <h3>${name}</h3>
          <p>${description}</p>
          <div class="dish-footer">
           <button 
            class="btn btn-primary add-to-cart"
            id="add-to-cart-${id}"
            data-id=${id} 
            data-price=${price}
            >
              Agregar al Carrito
            </button>
            <span class="quantity-selector">
              <button
                class="quantity-left"
                id="decrease-${id}"
                data-id=${id}
              >
                <iconify-icon icon="mdi:minus"></iconify-icon>
              </button>
              <span 
                id="quantity-${id}"
                data-id=${id}
              >
                ${initialQuantity}
              </span>
              <button
                class="quantity-right"
                id="increase-${id}"
                data-id=${id}
              >
                <iconify-icon icon="mdi:plus"></iconify-icon>
              </button>
            </span>
            <span>$ ${price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  }

  updateQuantityView(id, quantity) {
    const quantityElement = $(`#quantity-${id}`);
    if (quantityElement) {
      quantityElement.textContent = quantity;
    }
  }

  addEventListenersDishCards() {
    this.products.forEach((product) => {
      const dishCard = $(`#dish-card-${product.id}`);

      $(`#add-to-cart-${product.id}`).addEventListener("click", (e) => {
        this.addToCart(product.id);
        dishCard.classList.add("with-quantity");
        this.updateQuantityView(product.id, 1);
      });

      $(`#decrease-${product.id}`).addEventListener("click", (e) => {
        this.decreaseQuantity(product.id);

        const quantity =
          this.cart.find((item) => item.id === product.id)?.quantity || 0;

        if (!quantity) {
          dishCard.classList.remove("with-quantity");
        }

        this.updateQuantityView(product.id, quantity);
      });

      $(`#increase-${product.id}`).addEventListener("click", (e) => {
        this.increaseQuantity(product.id);

        const quantity =
          this.cart.find((item) => item.id === product.id)?.quantity || 0;
        this.updateQuantityView(product.id, quantity);
      });
    });
  }

  addToCart(id) {
    const product = this.products.find((product) => product.id === id);
    this.cart.push({ ...product, quantity: 1 });
    this.saveCart();
    this.updateCartView();
    this.updateCartCount();
  }

  decreaseQuantity(id) {
    const cartItem = this.cart.find((item) => item.id === id);

    if (cartItem && cartItem.quantity > 1) {
      cartItem.quantity--;
    } else {
      this.cart = this.cart.filter((item) => item.id !== id);
    }

    this.saveCart();
    this.updateCartView();
    this.updateCartCount();
  }

  increaseQuantity(id) {
    const cartItem = this.cart.find((item) => item.id === id);

    if (cartItem) {
      cartItem.quantity++;
    }

    this.saveCart();
    this.updateCartView();
    this.updateCartCount();
  }

  setupCart() {
    this.loadCart();
    $("#clear-cart").addEventListener("click", () => this.clearCart());
    $("#checkout").addEventListener("click", () => {+
       $("#cart-menu").classList.remove("open");
       $("#backdrop").classList.remove("open");
      alert("Gracias por tu compra. ¡Vuelve pronto!");
      this.clearCart();
    });
    this.updateCartView();
  }

  updateCartView() {
    const cartItems = $("#cart-items");
    const cartTotal = $("#cart-total");

    if (!cartItems || !cartTotal) {
      console.error("No se encontraron los elementos del carrito en el DOM.");
      return;
    }

    if (this.cart.length === 0) {
      cartItems.innerHTML = `<li>El carrito está vacío.</li>`;
      cartTotal.textContent = "Total: $0";
      return;
    }

    cartItems.innerHTML = this.cart
      .map(
        ({ name, price, quantity, image }) =>
          `<li>
            <img src=${image} alt=${name}  />
            <div class="flex-1">
              <div class="flex justify-between">
                <div class="flex gap-1">
                  <h4>${name}</h4> 
                  <span>
                    x ${quantity}
                  </span>
                </div>
                <span>$ ${(price * quantity).toLocaleString()}</span>
              </div>
              <span>$ ${price.toLocaleString()}</span>
            </div>
          </li>`
      )
      .join("");

    const total = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cartTotal.textContent = `Total: $${total.toLocaleString()}`;
  }

  setupCartButton() {
    const cartButton = $("#cart-button");
    const cartMenu = $("#cart-menu");
    const backdrop = $("#backdrop");

    cartButton.addEventListener("click", () => {
      cartMenu.classList.toggle("open");
      backdrop.classList.toggle("open");
    });

    backdrop.addEventListener("click", () => {
      cartMenu.classList.remove("open");
      backdrop.classList.remove("open");
    });

    this.updateCartCount();
  }

  updateCartCount() {
    $("#cart-count").textContent = this.cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartView();
    this.renderMenu();
    this.updateCartCount();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new RestaurantComponent();
});

const DATA = {
  info: [
    {
      icon: "mdi:location-radius-outline",
      title: "Nuestra Ubicación",
      description:
        "Somos un restaurante en la central de transporte en funcionamiento desde el año 2023 en la ciudad de Cúcuta, Norte de Santander.",
    },
    {
      icon: "ion:restaurant-outline",
      title: "¿Qué Ofrecemos?",
      description:
        "Estamos dedicados a la preparación de alimentos como desayunos y almuerzos, buscando siempre deleitar el paladar de nuestros clientes.",
    },
    {
      icon: "mdi:star-outline",
      title: "Calidad Garantizada",
      description:
        "Utilizamos ingredientes de primera calidad en nuestros platos corrientes y especiales del día.",
    },
    {
      icon: "mdi:handshake-outline",
      title: "Nuestro Compromiso",
      description:
        "Ofrecemos un excelente servicio al cliente, enfocado en conductores y pasajeros que se encuentran dentro de la central de transporte.",
    },
    {
      icon: "mdi:hand-heart-outline",
      title: "Te Esperamos",
      description:
        "¡No pierdas la oportunidad! ¿Qué esperas para probar nuestros platos?",
    },
  ],
  menu: [
    {
      title: "Platos Especiales",
      icon: "ep:dish",
      dishes: [
        {
          id: 1,
          name: "Bandeja Paisa",
          description:
            "Un plato tradicional colombiano con frijoles, arroz, carne molida, chicharrón, huevo frito, plátano maduro, arepa, y aguacate.",
          price: 18000,
          image: "./images/bandeja-paisa.webp",
        },
        {
          id: 2,
          name: "Ajiaco Santafereño",
          description:
            "Una sopa de Bogotá con pollo, papas criollas, guasca, y mazorca, acompañado de crema de leche y alcaparras.",
          price: 15000,
          image: "./images/ajiaco.webp",
        },
        {
          id: 3,
          name: "Sancocho de Gallina",
          description:
            "Un caldo espeso con gallina, plátano, yuca, papa, y cilantro, perfecto para disfrutar en familia.",
          price: 20000,
          image: "./images/sancocho.webp",
        },
        {
          id: 4,
          name: "Leche Asada",
          description:
            "Un postre típico a base de leche y huevo, cocido al horno con un toque de canela.",
          price: 8000,
          image: "./images/leche-asada.webp",
        },
        {
          id: 5,
          name: "Arroz con Pollo",
          description:
            "Un plato clásico de arroz amarillo mezclado con pollo desmenuzado, verduras frescas, y un toque de cilantro.",
          price: 12000,
          image: "./images/arroz-con-pollo.webp",
        },
        {
          id: 6,
          name: "Patacones con Hogao",
          description:
            "Deliciosos patacones crujientes acompañados de hogao colombiano, una mezcla de tomate y cebolla sofrita.",
          price: 10000,
          image: "./images/patacones-con-hogao.webp",
        },
      ],
    },
    {
      title: "Platos Corrientes",
      icon: "ion:restaurant-outline",
      dishes: [
        {
          id: 7,
          name: "Arroz con Huevo",
          description:
            "Arroz blanco acompañado de huevo frito, plátano maduro y ensalada fresca.",
          price: 7000,
          image: "./images/arroz-con-huevo.webp",
        },
        {
          id: 8,
          name: "Pollo Guisado",
          description:
            "Pechuga de pollo en salsa con papas, zanahoria y arroz blanco.",
          price: 9000,
          image: "./images/pollo-guisado.webp",
        },
        {
          id: 9,
          name: "Chuleta de Cerdo",
          description:
            "Chuleta empanizada acompañada de arroz, frijoles y plátano frito.",
          price: 10000,
          image: "./images/chuleta-de-cerdo.webp",
        },
        {
          id: 10,
          name: "Carne Molida",
          description: "Carne molida bien sazonada con arroz, papa y ensalada.",
          price: 8000,
          image: "./images/carne-molida.webp",
        },
        {
          id: 11,
          name: "Lentejas con Arroz",
          description:
            "Un plato saludable de lentejas guisadas con arroz, plátano y ensalada.",
          price: 7500,
          image: "./images/lentejas-con-arroz.webp",
        },
        {
          id: 12,
          name: "Hígado Encebollado",
          description:
            "Hígado tierno con cebolla caramelizada, arroz y papa al vapor.",
          price: 8500,
          image: "./images/higado-encebollado.webp",
        },
      ],
    },
  ],
};
