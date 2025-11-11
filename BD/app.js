const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Настройка PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'car_system',
    password: 'pass',
    port: 5432,
});

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// ==================== AUTH MODULE ====================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query(
            'SELECT id, username, email, role, full_name FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            error: null,
            data: { user: result.rows[0] }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, email, full_name } = req.body;
        const result = await pool.query(
            'INSERT INTO users (username, password, email, role, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role',
            [username, password, email, 'User', full_name]
        );

        res.json({
            error: null,
            data: { user: result.rows[0] }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== CAR MANAGEMENT ====================
app.get('/api/cars', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT vin as "VIN", brand as mark, model, year as "prodYear",
                   price as amount, mileage, status, condition, img, post_date as "postDate"
            FROM cars 
            ORDER BY post_date DESC
        `);

        res.json({
            error: null,
            data: { data: result.rows, messages: null }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Бронирование автомобиля
app.post('/api/cars/:vin/book', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { vin } = req.params;
        const { user_id, client_name, client_phone, amount } = req.body;

        // 1. Проверяем, доступен ли автомобиль
        const carCheck = await client.query(
            'SELECT status FROM cars WHERE vin = $1',
            [vin]
        );

        if (carCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Car not found' });
        }

        if (carCheck.rows[0].status !== 'Available') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Car is not available for booking' });
        }

        // 2. Обновляем статус автомобиля на "Rented"
        await client.query(
            'UPDATE cars SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE vin = $2',
            ['Rented', vin]
        );

        // 3. Создаем договор
        const contractResult = await client.query(`
            INSERT INTO contracts (client_name, client_phone, car_vin, amount, status)
            VALUES ($1, $2, $3, $4, 'Active')
            RETURNING contract_id
        `, [client_name, client_phone, vin, amount]);

        const contract_id = contractResult.rows[0].contract_id;

        // 4. Создаем встречу без менеджера
        const appointmentResult = await client.query(`
            INSERT INTO appointments (
                contract_id, 
                user_id, 
                appointment_date, 
                purpose, 
                status
            ) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '1 day', 'Car pickup and contract signing', 'Scheduled')
            RETURNING appointment_id
        `, [contract_id, user_id]);

        await client.query('COMMIT');

        res.json({
            error: null,
            data: { 
                message: 'Car booked successfully',
                contract_id: contract_id,
                appointment_id: appointmentResult.rows[0].appointment_id
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Book car error:', error);
        res.status(500).json({ 
            error: 'Booking failed: ' + error.message,
            data: null 
        });
    } finally {
        client.release();
    }
});

// ==================== APPOINTMENT MANAGEMENT ====================
// Получить встречи пользователя
app.get('/api/appointments/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await pool.query(`
            SELECT 
                a.appointment_id,
                a.appointment_date,
                a.duration_minutes,
                a.purpose,
                a.status,
                a.notes,
                c.contract_id,
                car.brand as car_brand,
                car.model as car_model,
                car.vin as car_vin,
                u.full_name as manager_name,
                u.email as manager_email
            FROM appointments a
            JOIN contracts c ON a.contract_id = c.contract_id
            JOIN cars car ON c.car_vin = car.vin
            LEFT JOIN users u ON a.manager_id = u.id
            WHERE a.user_id = $1
            ORDER BY a.appointment_date DESC
        `, [userId]);

        res.json({
            error: null,
            data: { appointments: result.rows }
        });
    } catch (error) {
        console.error('Appointments error:', error);
        res.status(500).json({ 
            error: 'Appointments loading failed: ' + error.message,
            data: null 
        });
    }
});

// Получить все встречи (для менеджера) - включая непривязанные
app.get('/api/appointments/manager', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.appointment_id,
                a.appointment_date,
                a.duration_minutes,
                a.purpose,
                a.status,
                a.notes,
                a.manager_id,
                c.contract_id,
                car.brand as car_brand,
                car.model as car_model,
                car.vin as car_vin,
                c.client_name,
                c.client_phone,
                u.full_name as user_name,
                u.email as user_email,
                m.full_name as manager_name
            FROM appointments a
            JOIN contracts c ON a.contract_id = c.contract_id
            JOIN cars car ON c.car_vin = car.vin
            JOIN users u ON a.user_id = u.id
            LEFT JOIN users m ON a.manager_id = m.id
            ORDER BY 
                CASE WHEN a.manager_id IS NULL THEN 0 ELSE 1 END,
                a.appointment_date DESC
        `);

        res.json({
            error: null,
            data: { appointments: result.rows }
        });
    } catch (error) {
        console.error('Manager appointments error:', error);
        res.status(500).json({ 
            error: 'Manager appointments loading failed: ' + error.message,
            data: null 
        });
    }
});

// Менеджер привязывается к встрече
app.post('/api/appointments/:appointmentId/assign', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { manager_id } = req.body;

        const result = await pool.query(`
            UPDATE appointments 
            SET manager_id = $1, 
                updated_at = CURRENT_TIMESTAMP
            WHERE appointment_id = $2 AND manager_id IS NULL
            RETURNING *
        `, [manager_id, appointmentId]);

        if (result.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Appointment not found or already assigned to another manager',
                data: null 
            });
        }

        res.json({
            error: null,
            data: { 
                message: 'Manager assigned successfully',
                appointment: result.rows[0] 
            }
        });
    } catch (error) {
        console.error('Assign manager error:', error);
        res.status(500).json({ 
            error: 'Manager assignment failed: ' + error.message,
            data: null 
        });
    }
});

// Менеджер открепляется от встречи
app.post('/api/appointments/:appointmentId/unassign', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { manager_id } = req.body;

        const result = await pool.query(`
            UPDATE appointments 
            SET manager_id = NULL, 
                updated_at = CURRENT_TIMESTAMP
            WHERE appointment_id = $1 AND manager_id = $2
            RETURNING *
        `, [appointmentId, manager_id]);

        if (result.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Appointment not found or manager not assigned',
                data: null 
            });
        }

        res.json({
            error: null,
            data: { 
                message: 'Manager unassigned successfully',
                appointment: result.rows[0] 
            }
        });
    } catch (error) {
        console.error('Unassign manager error:', error);
        res.status(500).json({ 
            error: 'Manager unassignment failed: ' + error.message,
            data: null 
        });
    }
});

// Обновить встречу (только менеджер)
app.put('/api/appointments/:appointmentId', async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { 
            appointment_date, 
            duration_minutes, 
            purpose, 
            status, 
            notes 
        } = req.body;

        const result = await pool.query(`
            UPDATE appointments 
            SET appointment_date = $1, 
                duration_minutes = $2, 
                purpose = $3, 
                status = $4, 
                notes = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE appointment_id = $6
            RETURNING *
        `, [appointment_date, duration_minutes, purpose, status, notes, appointmentId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Appointment not found',
                data: null 
            });
        }

        res.json({
            error: null,
            data: { appointment: result.rows[0] }
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ 
            error: 'Appointment update failed: ' + error.message,
            data: null 
        });
    }
});

// ==================== CONTRACT MANAGEMENT ====================
app.get('/api/contracts', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.contract_id, 
                c.date, 
                c.client_name,
                c.client_phone,
                c.amount, 
                c.status,
                car.brand as car_brand, 
                car.model as car_model, 
                car.vin as car_vin
            FROM contracts c
            JOIN cars car ON c.car_vin = car.vin
            ORDER BY c.date DESC
        `);

        res.json({
            error: null,
            data: { contracts: result.rows }
        });
    } catch (error) {
        console.error('Contracts error:', error);
        res.status(500).json({
            error: 'Contracts loading failed: ' + error.message,
            data: null
        });
    }
});

// ==================== USER MANAGEMENT ====================
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, role, full_name, created_at FROM users'
        );

        res.json({
            error: null,
            data: { users: result.rows }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получить всех менеджеров
app.get('/api/users/managers', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, full_name FROM users WHERE role = $1',
            ['Manager']
        );

        res.json({
            error: null,
            data: { managers: result.rows }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== жив ли сервер ====================
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'OK',
            message: 'All modules are working with PostgreSQL',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`🚗 Full Car Rental API running on http://localhost:${port}`);
    console.log('📊 Available endpoints:');
    console.log('   👤 AUTH:    POST /api/auth/login, /api/auth/register');
    console.log('   👥 USERS:   GET /api/users, GET /api/users/managers');
    console.log('   🚗 CARS:    GET /api/cars, POST /api/cars/:vin/book');
    console.log('   📅 APPOINTMENTS:');
    console.log('        GET /api/appointments/user/:userId');
    console.log('        GET /api/appointments/manager');
    console.log('        POST /api/appointments/:appointmentId/assign');
    console.log('        POST /api/appointments/:appointmentId/unassign');
    console.log('        PUT /api/appointments/:appointmentId');
    console.log('   📝 CONTRACT: GET /api/contracts');
    console.log('   ❤️  HEALTH:  GET /api/health');
});