document.addEventListener("DOMContentLoaded", async () => {
  const logoutbtn = document.querySelector(".logout");
  logoutbtn.addEventListener("click", () => {
    logout();
  });
  function logout() {
    console.log("logout");
    document.cookie = "email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/registration.html";
  }

  const productsContainer = document.getElementById("products");

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    console.log(value);
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const email = getCookie("email");
  console.log("Email from cookie:", email);

  if (!email) {
    window.location.href = "/registration.html";
  }

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }
      const products = await response.json();
      renderProducts(products);
    } catch (error) {
      console.error("Ошибка при загрузке товаров:", error);
    }
  }

  function renderProducts(products) {
    productsContainer.innerHTML = "";
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "relative p-4 bg-gray-800 rounded-lg shadow-md";

      productCard.innerHTML = `
            <div class="h-48 w-40  absolute right-4 rounded-md flex justify-end"><img src="./images/${product.img}" class="h-full w-auto rounded absolute"/></div>
            <h3 class="text-xl font-bold mb-2 text-indigo-300">${product.texture}</h3>
            <p>Цвет: <span class="text-gray-400">${product.color}</span></p>
            <p>Цена за м²: <span class="text-green-500">${product.price_per_sqm} $</span></p>
            <p>Площадь в упаковке: <span class="text-gray-400">${product.sqm_per_package} м²</span></p>
            <p>Вес упаковки: <span class="text-gray-400">${product.package_weight} кг</span></p>
            <p>Размер плитки: <span class="text-gray-400">${product.tile_size}</span></p>
            <p class="text-xl font-semibold mt-4">Общая цена: <span class="text-green-500">${product.total_price} сум</span></p>
            `;

      productsContainer.appendChild(productCard);
    });
  }

  fetchProducts();

  const ordersContainer = document.getElementById("orders");
  const createOrderForm = document.getElementById("create-order-form");

  async function fetchOrders() {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }
      const orders = await response.json();
      renderOrders(orders);
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error);
    }
  }

  // Функция для отрисовки заказов
  function renderOrders(orders) {
    ordersContainer.innerHTML = ""; // Очищаем контейнер
    orders.forEach((order) => {
      const orderCard = document.createElement("div");
      orderCard.className = "p-4 bg-gray-800 rounded-lg shadow-md";

      orderCard.innerHTML = `
              <h3 class="text-xl foordersContainernt-bold mb-2">Заказ #${order.id}</h3>
              <p>Клиент: <span class="text-gray-400">${order.client_name}</span></p>
              <p>Детали заказа: <span class="text-gray-400">${order.order_details}</span></p>
              <p>Размер: <span class="text-gray-400">${order.size_sqm} м²</span></p>
              <p class="text-xl font-semibold mt-4">Сумма: <span class="text-green-500">${order.total_amount} сум</span></p>
              <button class="delete-order bg-red-500 text-white p-2 rounded mt-4" data-id="${order.id}">Удалить заказ</button>
          `;

      ordersContainer.appendChild(orderCard);
    });

    // Добавление обработчиков для удаления заказов
    document.querySelectorAll(".delete-order").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const orderId = event.target.dataset.id;
        await deleteOrder(orderId);
      });
    });
  }

  // Функция для удаления заказа
  async function deleteOrder(orderId) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Заказ удален");
        fetchOrders(); // Обновляем список заказов
      } else {
        alert("Ошибка при удалении заказа");
      }
    } catch (error) {
      console.error("Ошибка при удалении заказа:", error);
    }
  }

  // Обработчик для создания нового заказа
  createOrderForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const orderDetails = document.getElementById("order-details").value;
    const clientId = document.getElementById("client-id").value;
    const sizeSqm = document.getElementById("size-sqm").value;
    const texture = document.getElementById("texture").value;
    const color = document.getElementById("color").value;

    const order = {
      order_details: `${texture}, ${color}`,
      client_id: clientId,
      size_sqm: sizeSqm,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        alert("Заказ создан");
        console.log(response);
        fetchOrders(); // Обновляем список заказов
      } else {
        alert("Ошибка при создании заказа");
      }
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
    }
  });

  // Загружаем заказы при загрузке страницы
  fetchOrders();
});

document.addEventListener("DOMContentLoaded", async () => {
  const clientsContainer = document.getElementById("clients");
  const createClientForm = document.getElementById("create-client-form");

  // Функция для загрузки клиентов с бэкенда
  async function fetchClients() {
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }
      const clients = await response.json();
      renderClients(clients);
    } catch (error) {
      console.error("Ошибка при загрузке клиентов:", error);
    }
  }

  // Функция для отрисовки клиентов
  function renderClients(clients) {
    clientsContainer.innerHTML = ""; // Очищаем контейнер
    clients.forEach((client) => {
      const clientCard = document.createElement("div");
      clientCard.className = "p-4 bg-gray-800 rounded-lg shadow-md";

      clientCard.innerHTML = `
                <h3 class="text-xl font-bold mb-2">#${client.id} ${client.full_name}</h3>
                <p>Телефон: <span class="text-gray-400">${client.phone}</span></p>
                <button class="delete-client bg-red-500 text-white p-2 rounded mt-4" data-id="${client.id}">Удалить клиента</button>
            `;

      clientsContainer.appendChild(clientCard);
    });

    // Добавление обработчиков для удаления клиентов
    document.querySelectorAll(".delete-client").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const clientId = event.target.dataset.id;
        await deleteClient(clientId);
      });
    });
  }

  // Функция для удаления клиента
  async function deleteClient(clientId) {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Клиент удален");
        fetchClients(); // Обновляем список клиентов
      } else {
        alert("Ошибка при удалении клиента");
      }
    } catch (error) {
      console.error("Ошибка при удалении клиента:", error);
    }
  }

  createClientForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const clientName = document.getElementById("client-name").value;
    const clientPhone = document.getElementById("client-phone").value;

    const client = {
      full_name: clientName,
      phone: clientPhone,
    };

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      });

      if (response.ok) {
        alert("Клиент добавлен");
        fetchClients();
      } else {
        alert("Ошибка при добавлении клиента");
      }
    } catch (error) {
      console.error("Ошибка при добавлении клиента:", error);
    }
  });

  fetchClients();
});

document.addEventListener("DOMContentLoaded", async () => {
  const employeesContainer = document.getElementById("employees");
  const createEmployeeForm = document.getElementById("create-employee-form");

  async function fetchEmployees() {
    try {
      const response = await fetch("/api/employees");
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }
      const employees = await response.json();
      renderEmployees(employees);
    } catch (error) {
      console.error("Ошибка при загрузке сотрудников:", error);
    }
  }

  function renderEmployees(employees) {
    employeesContainer.innerHTML = "";
    employees.forEach((employee) => {
      const employeeCard = document.createElement("div");
      employeeCard.className = "p-4 bg-gray-800 rounded-lg shadow-md";

      employeeCard.innerHTML = `
                <h3 class="text-xl font-bold mb-2">${employee.full_name}</h3>
                <p>Position: <span class="text-gray-400">${employee.position}</span></p>
                <p>Hire Date: <span class="text-gray-400">${employee.hire_date}</span></p>
                <p>Salary: <span class="text-gray-400">${employee.salary}</span></p>
                <button class="delete-employee bg-red-500 text-white p-2 rounded mt-4" data-id="${employee.id}">Delete Employee</button>
            `;

      employeesContainer.appendChild(employeeCard);
    });

    // Добавление обработчиков для удаления сотрудников
    document.querySelectorAll(".delete-employee").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const employeeId = event.target.dataset.id;
        await deleteEmployee(employeeId);
      });
    });
  }

  async function deleteEmployee(employeeId) {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Employee deleted");
        fetchEmployees();
      } else {
        alert("Error deleting employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  }

  createEmployeeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const employeeName = document.getElementById("employee-name").value;
    const employeePosition = document.getElementById("employee-position").value;
    const employeeHireDate =
      document.getElementById("employee-hire-date").value;
    const employeeSalary = document.getElementById("employee-salary").value;

    const employee = {
      full_name: employeeName,
      position: employeePosition,
      hire_date: employeeHireDate,
      salary: employeeSalary,
    };

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      });

      if (response.ok) {
        alert("Employee added");
        fetchEmployees();
      } else {
        alert("Error adding employee");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  });

  fetchEmployees();
});
