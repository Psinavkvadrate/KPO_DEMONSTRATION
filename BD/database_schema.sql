-- Users table (from Auth Module)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('User', 'Manager', 'Administrator')),
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars table (from Car Management Module)
CREATE TABLE IF NOT EXISTS cars (
    vin VARCHAR(17) PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    mileage INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Available', 'Rented', 'Under Maintenance', 'Sold Out')),
    condition VARCHAR(10) NOT NULL CHECK (condition IN ('good', 'medium', 'bad')),
    img TEXT,
    post_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table (from Client Management Module)
CREATE TABLE IF NOT EXISTS clients (
    client_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    contract_id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    client_name VARCHAR(100) NOT NULL,
    client_phone VARCHAR(20),
    car_vin VARCHAR(17) REFERENCES cars(vin),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Completed', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(contract_id),
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'Completed', 'Failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для встреч (добавить к существующим таблицам)
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(contract_id),
    user_id INTEGER REFERENCES users(id),
    manager_id INTEGER REFERENCES users(id),
    appointment_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    purpose VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_manager_id ON appointments(manager_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
[file content end]
