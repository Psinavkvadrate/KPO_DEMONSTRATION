-- Users
INSERT INTO users (username, password, email, role, full_name) VALUES
('admin', 'admin', 'admin@cars.com', 'Administrator', 'Ivanov Ivan Ivanovich'),
('manager', 'manager', 'manager@cars.com', 'Manager', 'Petrov Petr Petrovich'),
('client', 'client', 'client@mail.com', 'User', 'Sidorov Alexey Vladimirovich');

-- Clients
INSERT INTO clients (full_name, phone, email, user_id) VALUES
('Sidorov Alexey Vladimirovich', '+79161234567', 'client@mail.com', 3),
('Kozlova Maria Sergeevna', '+79167654321', 'maria@mail.com', NULL);

-- Cars
INSERT INTO cars (vin, brand, model, year, price, mileage, status, condition, img) VALUES
('ZFA22300005556777', 'Toyota', 'Prado', 2007, 1010500.00, 150000, 'Available', 'good', 'https://avatars.mds.yandex.net/get-autoru-vos/5088607/a4a79901bee22921331924e3ad87cf54/456x342'),
('WDB9640651J123456', 'Mercedes', 'E-Class', 2018, 2850000.00, 75000, 'Available', 'good', "https://avatars.mds.yandex.net/get-autoru-vos/6491990/09b3d1fbfacdf75fc71d4f30f9e0b70d/456x342"),
('WAUZZZ8K9FA123456', 'Audi', 'A6', 2015, 2200000.00, 120000, 'Rented', 'medium', 'https://s.auto.drom.ru/i24195/c/photos/generations/500x_audi_a6_g4523.jpg?453409');

-- Contracts
INSERT INTO contracts (client_name, client_phone, car_vin, amount, status) VALUES
('Sidorov Alexey Vladimirovich', '+79161234567', 'WAUZZZ8K9FA123456', 2200000.00, 'Active'),
('Kozlova Maria Sergeevna', '+79167654321', 'ZFA22300005556777', 1010500.00, 'Completed');

-- Payments
INSERT INTO payments (contract_id, amount, method, status) VALUES
(1, 2200000.00, 'Credit Card', 'Completed');
