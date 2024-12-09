-- Таблица для продукции
CREATE TABLE Products (
                          ProductID SERIAL PRIMARY KEY,
                          ProductName VARCHAR(100) NOT NULL,
                          ProductType VARCHAR(50) NOT NULL,
                          Price DECIMAL(10, 2) NOT NULL,
                          StockQuantity INT NOT NULL
);

-- Таблица для клиентов
CREATE TABLE Customers (
                           CustomerID SERIAL PRIMARY KEY,
                           CustomerName VARCHAR(100) NOT NULL,
                           ContactNumber VARCHAR(15),
                           Address TEXT
);

-- Таблица для заказов
CREATE TABLE Orders (
                        OrderID SERIAL PRIMARY KEY,
                        OrderDate DATE NOT NULL,
                        CustomerID INT NOT NULL,
                        TotalAmount DECIMAL(10, 2) NOT NULL,
                        FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- Таблица для деталей заказа
CREATE TABLE OrderDetails (
                              OrderDetailID SERIAL PRIMARY KEY,
                              OrderID INT NOT NULL,
                              ProductID INT NOT NULL,
                              Quantity INT NOT NULL,
                              Price DECIMAL(10, 2) NOT NULL,
                              FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
                              FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- Таблица для поставщиков
CREATE TABLE Suppliers (
                           SupplierID SERIAL PRIMARY KEY,
                           SupplierName VARCHAR(100) NOT NULL,
                           ContactNumber VARCHAR(15),
                           Address TEXT
);

-- Таблица для материалов
CREATE TABLE Materials (
                           MaterialID SERIAL PRIMARY KEY,
                           MaterialName VARCHAR(100) NOT NULL,
                           SupplierID INT NOT NULL,
                           Cost DECIMAL(10, 2) NOT NULL,
                           StockQuantity INT NOT NULL,
                           FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
);

-- Таблица для сотрудников
CREATE TABLE Employees (
                           EmployeeID SERIAL PRIMARY KEY,
                           EmployeeName VARCHAR(100) NOT NULL,
                           Position VARCHAR(50),
                           HireDate DATE NOT NULL,
                           Salary DECIMAL(10, 2) NOT NULL
);