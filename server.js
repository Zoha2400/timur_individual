const { error } = require("console");
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3012;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/registration", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "registration.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/orders", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "orders.html"));
});

app.get("/employees", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "employees.html"));
});

app.get("/clients", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "clients.html"));
});

const { Client } = require("pg");

async function getDbClient() {
  const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "constructionmaterialsdb",
    password: "05350535",
    port: 5432,
  });
  await client.connect();
  return client;
}

app.get("/api/products", async (req, res) => {
  try {
    const client = new Client({
      user: "postgres",
      host: "localhost",
      database: "constructionmaterialsdb",
      password: "05350535",
      port: 5432,
    });
    await client.connect();
    const result = await client.query("SELECT * FROM products");
    await client.end();
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
app.post("/api/orders", async (req, res) => {
  const { order_details, client_id, size_sqm } = req.body;
  const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "constructionmaterialsdb",
    password: "05350535",
    port: 5432,
  });
  await client.connect();

  try {
    // Проверяем, существует ли клиент с данным client_id
    const clientCheck = await client.query(
      "SELECT id FROM clients WHERE id = $1",
      [client_id]
    );

    if (clientCheck.rowCount === 0) {
      return res.status(404).json({ error: "Клиент с таким ID не существует" });
    }

    const result = await client.query(
      "INSERT INTO orders (order_details, client_id, size_sqm, total_amount) VALUES ($1, $2, $3, $4) RETURNING id",
      [order_details, client_id, size_sqm, size_sqm * 1200] // Пример расчета стоимости
    );

    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Ошибка при создании заказа:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    await client.end();
  }
});

app.post("/api/orders", async (req, res) => {
  const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "constructionmaterialsdb",
    password: "05350535",
    port: 5432,
  });
  await client.connect();
  const { order_details, client_id, size_sqm } = req.body;

  if (!order_details || !client_id || typeof size_sqm !== "number") {
    return res.status(400).json({ error: "Неверные данные" });
  }

  try {
    const client = await getDbClient();
    const result = await client.query(
      "INSERT INTO orders (order_details, client_id, size_sqm, total_amount) VALUES ($1, $2, $3, $4) RETURNING id",
      [order_details, client_id, size_sqm, size_sqm * 1200]
    );
    await client.end();
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Ошибка при создании заказа:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.get("/api/orders", async (req, res) => {
  const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "constructionmaterialsdb",
    password: "05350535",
    port: 5432,
  });
  await client.connect();

  try {
    const result = await client.query(`
      SELECT 
      o.id,
      o.order_details,
      o.client_id,
      o.size_sqm,
      o.total_amount,
        c.full_name AS client_name
      FROM orders o
      JOIN clients c ON o.client_id = c.id
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении заказов:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    await client.end();
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const client = await getDbClient(); // Получаем клиент для подключения к базе
    const result = await client.query("DELETE FROM orders WHERE id = $1", [id]);
    await client.end(); // Закрываем подключение
    if (result.rowCount > 0) {
      res.status(200).json({ message: "Заказ удален" });
    } else {
      res.status(404).json({ message: "Заказ не найден" });
    }
  } catch (error) {
    console.error("Ошибка при удалении заказа:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.get("/api/clients", async (req, res) => {
  try {
    const client = await getDbClient(); // Получаем клиент для подключения к базе
    const result = await client.query(
      "SELECT id, full_name, phone FROM clients"
    );
    await client.end(); // Закрываем подключение
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/api/clients", async (req, res) => {
  const { full_name, phone } = req.body;
  try {
    const client = await getDbClient(); // Получаем клиент для подключения к базе
    const result = await client.query(
      "INSERT INTO clients (full_name, phone) VALUES ($1, $2) RETURNING id",
      [full_name, phone]
    );
    await client.end(); // Закрываем подключение
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Ошибка при добавлении клиента:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.delete("/api/clients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const client = await getDbClient(); // Получаем клиент для подключения к базе
    const result = await client.query("DELETE FROM clients WHERE id = $1", [
      id,
    ]);
    await client.end(); // Закрываем подключение
    if (result.rowCount > 0) {
      res.status(200).json({ message: "Клиент удален" });
    } else {
      res.status(404).json({ message: "Клиент не найден" });
    }
  } catch (error) {
    console.error("Ошибка при удалении клиента:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    const client = await getDbClient(); // Получаем клиент для подключения к базе
    const result = await client.query(
      "SELECT id, full_name, position, hire_date, salary FROM employees"
    );
    await client.end(); // Закрываем подключение
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Маршрут для добавления нового сотрудника
app.post("/api/employees", async (req, res) => {
  const { full_name, position, hire_date, salary } = req.body;
  try {
    const client = await getDbClient(); // Получаем клиент для подключения к базе
    const result = await client.query(
      "INSERT INTO employees (full_name, position, hire_date, salary) VALUES ($1, $2, $3, $4) RETURNING id",
      [full_name, position, hire_date, salary]
    );
    await client.end(); // Закрываем подключение
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Маршрут для удаления сотрудника
app.delete("/api/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const client = await getDbClient(); // Получаем клиент для подключения к базе
    const result = await client.query("DELETE FROM employees WHERE id = $1", [
      id,
    ]);
    await client.end(); // Закрываем подключение
    if (result.rowCount > 0) {
      res.status(200).json({ message: "Employee deleted" });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Добавление нового продукта
app.post("/api/products", async (req, res) => {
  const {
    texture,
    color,
    price_per_sqm,
    sqm_per_package,
    package_weight,
    tile_size,
    img_url,
  } = req.body;

  if (
    !texture ||
    !color ||
    !price_per_sqm ||
    !sqm_per_package ||
    !package_weight ||
    !tile_size ||
    !img_url
  ) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  const img_fixed = img_url;
  const client = await getDbClient();

  try {
    const query = `
      INSERT INTO products (texture, color, price_per_sqm, sqm_per_package, package_weight, tile_size, img)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const values = [
      texture,
      color,
      price_per_sqm,
      sqm_per_package,
      package_weight,
      tile_size,
      img_fixed,
    ];
    const result = await client.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при добавлении продукта:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Удаление продукта по ID
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const client = await getDbClient();

  try {
    const result = await client.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Продукт не найден" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при удалении продукта:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/reg", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const client = await getDbClient();

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await client.query(
      "INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING *;",
      [name, email, hashed]
    );

    if (result.rows.length > 0) {
      const oneDay = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
      res.cookie("email", email, { httpOnly: false, maxAge: oneDay });
      return res
        .status(201)
        .json({ success: "Admin registered successfully!" });
    } else {
      return res.status(500).json({ error: "Failed to register admin!" });
    }
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists!" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const client = await getDbClient();

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required!" });
  }

  try {
    const result = await client.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found!" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password!" });
    }

    const oneDay = 24 * 60 * 60 * 1000;
    res.cookie("email", email, { httpOnly: false, maxAge: oneDay });
    res.status(200).json({ success: "Login successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
