const request = require('supertest');
const { Pool } = require('pg');
const app = require('./app');

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

console.error = jest.fn();

describe('Car Rental API Tests', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    console.error.mockClear();
  });

  // тест автлоризацт
  describe('Auth Module', () => {
    test('POST /api/auth/login - успешный логин', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'User',
        full_name: 'Test User'
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.data.user).toEqual(mockUser);
    });

    test('POST /api/auth/login - неверные учетные данные', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'wronguser',
          password: 'wrongpass'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('POST /api/auth/register - успешная регистрация', async () => {
      const mockNewUser = {
        id: 2,
        username: 'newuser',
        email: 'new@example.com',
        role: 'User'
      };

      pool.query.mockResolvedValue({ rows: [mockNewUser] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123',
          email: 'new@example.com',
          full_name: 'New User'
        });

      expect(response.status).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.data.user).toEqual(mockNewUser);
    });
  });

  // тнст ошибок оавторизации
  describe('Auth Error Cases', () => {
    test('POST /api/auth/register - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('Database constraint violation'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'password123',
          email: 'existing@example.com',
          full_name: 'Existing User'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Database constraint');
    });
  });

  //тесты менеджмента машин
  describe('Car Management', () => {
    test('GET /api/cars - успешное получение списка автомобилей', async () => {
      const mockCars = [{
        VIN: 'ABC123',
        mark: 'Toyota',
        model: 'Camry',
        prodYear: 2022,
        amount: 25000,
        mileage: 15000,
        status: 'Available',
        condition: 'Excellent',
        img: 'car.jpg',
        postDate: '2023-01-01'
      }];

      pool.query.mockResolvedValue({ rows: mockCars });

      const response = await request(app).get('/api/cars');

      expect(response.status).toBe(200);
      expect(response.body.error).toBeNull();
      expect(response.body.data.data).toEqual(mockCars);
    });

    test('GET /api/cars - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('DB connection failed'));

      const response = await request(app).get('/api/cars');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('DB connection failed');
    });
  });

  // бронировангие тестов
  describe('Car Booking', () => {
    test('POST /api/cars/:vin/book - успешное бронирование', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };

      mockClient.query
        .mockResolvedValueOnce() 
        .mockResolvedValueOnce({ rows: [{ status: 'Available' }] }) 
        .mockResolvedValueOnce({ rows: [] }) 
        .mockResolvedValueOnce({ rows: [{ contract_id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ appointment_id: 1 }] }) 
        .mockResolvedValueOnce(); 

      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app)
        .post('/api/cars/ABC123/book')
        .send({
          user_id: 1,
          client_name: 'John Doe',
          client_phone: '+1234567890',
          amount: 25000
        });

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Car booked successfully');
    });
  });

  // тест брони машин
  describe('Car Booking Error Cases', () => {
    test('POST /api/cars/:vin/book - автомобиль не найден', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };

      mockClient.query
        .mockResolvedValueOnce() 
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce(); 

      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app)
        .post('/api/cars/INVALID_VIN/book')
        .send({
          user_id: 1,
          client_name: 'John Doe',
          client_phone: '+1234567890',
          amount: 25000
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Car not found');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    test('POST /api/cars/:vin/book - автомобиль недоступен', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };

      mockClient.query
        .mockResolvedValueOnce() 
        .mockResolvedValueOnce({ rows: [{ status: 'Rented' }] }) 
        .mockResolvedValueOnce(); 

      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app)
        .post('/api/cars/ABC123/book')
        .send({
          user_id: 1,
          client_name: 'John Doe',
          client_phone: '+1234567890',
          amount: 25000
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Car is not available for booking');
    });

    test('POST /api/cars/:vin/book - ошибка транзакции', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };

      mockClient.query
        .mockResolvedValueOnce() 
        .mockResolvedValueOnce({ rows: [{ status: 'Available' }] })
        .mockRejectedValueOnce(new Error('Transaction failed'))
        .mockResolvedValueOnce();

      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app)
        .post('/api/cars/ABC123/book')
        .send({
          user_id: 1,
          client_name: 'John Doe',
          client_phone: '+1234567890',
          amount: 25000
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Booking failed');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(console.error).toHaveBeenCalledWith('Book car error:', expect.any(Error));
    });
  });

  // тест встреч
  describe('Appointment Management', () => {
    test('GET /api/appointments/user/:userId - успех', async () => {
      const mockAppointments = [{ appointment_id: 1, purpose: 'Car pickup' }];
      pool.query.mockResolvedValue({ rows: mockAppointments });

      const response = await request(app).get('/api/appointments/user/1');

      expect(response.status).toBe(200);
      expect(response.body.data.appointments).toEqual(mockAppointments);
    });

    test('POST /api/appointments/:id/assign - успешное назначение', async () => {
      pool.query.mockResolvedValue({ rows: [{ appointment_id: 1 }] });

      const response = await request(app)
        .post('/api/appointments/1/assign')
        .send({ manager_id: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('assigned');
    });
  });

  // ТЕСТЫ ошибки ВСТРЕЧ 
  describe('Appointment Error Cases', () => {
    test('GET /api/appointments/user/:userId - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('DB connection error'));

      const response = await request(app).get('/api/appointments/user/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Appointments loading failed');
      expect(console.error).toHaveBeenCalledWith('Appointments error:', expect.any(Error));
    });

    test('GET /api/appointments/manager - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('DB connection error'));

      const response = await request(app).get('/api/appointments/manager');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Manager appointments loading failed');
      expect(console.error).toHaveBeenCalledWith('Manager appointments error:', expect.any(Error));
    });

    test('POST /api/appointments/:id/assign - встреча уже назначена', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/api/appointments/1/assign')
        .send({ manager_id: 2 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already assigned');
    });

    test('POST /api/appointments/:id/assign - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/appointments/1/assign')
        .send({ manager_id: 2 });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Manager assignment failed');
      expect(console.error).toHaveBeenCalledWith('Assign manager error:', expect.any(Error));
    });

    test('POST /api/appointments/:id/unassign - менеджер не назначен', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/api/appointments/1/unassign')
        .send({ manager_id: 2 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('manager not assigned');
    });

    test('POST /api/appointments/:id/unassign - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/appointments/1/unassign')
        .send({ manager_id: 2 });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Manager unassignment failed');
      expect(console.error).toHaveBeenCalledWith('Unassign manager error:', expect.any(Error));
    });

    test('PUT /api/appointments/:id - встреча не найдена', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .put('/api/appointments/999')
        .send({
          appointment_date: '2023-12-01T10:00:00Z',
          purpose: 'Updated purpose'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Appointment not found');
    });

    test('PUT /api/appointments/:id - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .put('/api/appointments/1')
        .send({
          appointment_date: '2023-12-01T10:00:00Z',
          purpose: 'Updated purpose'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Appointment update failed');
      expect(console.error).toHaveBeenCalledWith('Update appointment error:', expect.any(Error));
    });
  });

  // тест контрактов
  describe('Contract Management', () => {
    test('GET /api/contracts - успех', async () => {
      const mockContracts = [{ contract_id: 1, client_name: 'John' }];
      pool.query.mockResolvedValue({ rows: mockContracts });

      const response = await request(app).get('/api/contracts');

      expect(response.status).toBe(200);
      expect(response.body.data.contracts).toEqual(mockContracts);
    });
  });

  //тест ошибок контрактов
  describe('Contract Error Cases', () => {
    test('GET /api/contracts - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('DB connection error'));

      const response = await request(app).get('/api/contracts');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Contracts loading failed');
      expect(console.error).toHaveBeenCalledWith('Contracts error:', expect.any(Error));
    });
  });

  // тест пользователя
  describe('User Management', () => {
    test('GET /api/users - успех', async () => {
      const mockUsers = [{ id: 1, username: 'admin', role: 'Admin' }];
      pool.query.mockResolvedValue({ rows: mockUsers });

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.data.users).toEqual(mockUsers);
    });

    test('GET /api/users/managers - успех', async () => {
      const mockManagers = [{ id: 2, username: 'manager1', role: 'Manager' }];
      pool.query.mockResolvedValue({ rows: mockManagers });

      const response = await request(app).get('/api/users/managers');

      expect(response.status).toBe(200);
      expect(response.body.data.managers).toEqual(mockManagers);
    });
  });

  //тест пользователя ошибочный
  describe('User Error Cases', () => {
    test('GET /api/users - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('DB connection error'));

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('DB connection error');
    });

    test('GET /api/users/managers - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('DB connection error'));

      const response = await request(app).get('/api/users/managers');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('DB connection error');
    });
  });


  describe('Edge Cases', () => {
    test('POST /api/cars/:vin/book - проверка транзакции при ошибке', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };

      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ status: 'Available' }] })
        .mockRejectedValueOnce(new Error('Unexpected error'))
        .mockResolvedValueOnce();

      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app)
        .post('/api/cars/ABC123/book')
        .send({
          user_id: 1,
          client_name: 'John Doe',
          client_phone: '+1234567890',
          amount: 25000
        });

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(response.status).toBe(500);
      expect(console.error).toHaveBeenCalledWith('Book car error:', expect.any(Error));
    });

    test('POST /api/cars/:vin/book - проверка release клиента', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };

      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ status: 'Available' }] })
        .mockRejectedValueOnce(new Error('Test error'))
        .mockResolvedValueOnce();

      pool.connect.mockResolvedValue(mockClient);

      const response = await request(app)
        .post('/api/cars/ABC123/book')
        .send({
          user_id: 1,
          client_name: 'John Doe',
          client_phone: '+1234567890',
          amount: 25000
        });

      expect(mockClient.release).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Book car error:', expect.any(Error));
    });
  });

  describe('Additional Success Cases', () => {
    test('POST /api/appointments/:id/unassign - успешное открепление', async () => {
      const mockAppointment = { appointment_id: 1, manager_id: null };
      pool.query.mockResolvedValue({ rows: [mockAppointment] });

      const response = await request(app)
        .post('/api/appointments/1/unassign')
        .send({ manager_id: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('unassigned');
    });

    test('PUT /api/appointments/:id - успешное обновление', async () => {
      const mockUpdatedAppointment = {
        appointment_id: 1,
        appointment_date: '2023-12-01T10:00:00Z',
        purpose: 'Updated purpose',
        status: 'Completed'
      };

      pool.query.mockResolvedValue({ rows: [mockUpdatedAppointment] });

      const response = await request(app)
        .put('/api/appointments/1')
        .send({
          appointment_date: '2023-12-01T10:00:00Z',
          purpose: 'Updated purpose',
          status: 'Completed',
          notes: 'Test notes'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.appointment).toEqual(mockUpdatedAppointment);
    });

    test('GET /api/appointments/manager - успешное получение', async () => {
      const mockAppointments = [
        {
          appointment_id: 1,
          appointment_date: '2023-12-01T10:00:00Z',
          purpose: 'Car pickup',
          car_brand: 'Toyota',
          client_name: 'John Doe'
        }
      ];

      pool.query.mockResolvedValue({ rows: mockAppointments });

      const response = await request(app).get('/api/appointments/manager');

      expect(response.status).toBe(200);
      expect(response.body.data.appointments).toEqual(mockAppointments);
    });
  });

  describe('Health Check', () => {
    test('GET /api/health - сервер работает', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });

    test('GET /api/health - ошибка базы данных', async () => {
      pool.query.mockRejectedValue(new Error('DB unavailable'));

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('DB unavailable');
    });
  });
});