import React, { useEffect, useState } from 'react'
import { Layout, Table, Spin, Tag } from 'antd'
import HeaderBar from '../components/HeaderBar'
import { fetchUserAppointments, type Appointment } from '../api'
import { getUser } from '../utils/auth'
import dayjs from 'dayjs'
import './UserMeet.scss'

const { Content } = Layout

export default function UserMeet() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const user = getUser()
        if (!user) {
          setError('Пользователь не авторизован')
          setLoading(false)
          return
        }
        const data = await fetchUserAppointments(user.id)
        setAppointments(data)
      } catch (err) {
        setError('Ошибка загрузки встреч')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Функция для перевода статуса встречи
  const translateStatus = (status: string): string => {
    switch (status) {
      case 'Scheduled':
        return 'Запланирована'
      case 'Completed':
        return 'Завершена'
      case 'Cancelled':
        return 'Отменена'
      default:
        return status
    }
  }

  // Функция для перевода цели встречи
  const translatePurpose = (purpose: string): string => {
    switch (purpose) {
      case 'Car pickup and contract signing':
        return 'Получение автомобиля и подписание договора'
      case 'Test drive':
        return 'Тест-драйв'
      case 'Consultation':
        return 'Консультация'
      case 'Payment discussion':
        return 'Обсуждение оплаты'
      case 'Car inspection':
        return 'Осмотр автомобиля'
      default:
        return purpose
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return '#7a3cff'
      case 'Completed':
        return '#52c41a'
      case 'Cancelled':
        return '#ff4d4f'
      default:
        return '#888'
    }
  }

  const columns = [
    {
      title: 'Дата встречи',
      dataIndex: 'appointment_date',
      render: (val: string) => (
        <span style={{ color: '#7a3cff', fontWeight: '600' }}>
          {dayjs(val).format('DD.MM.YYYY HH:mm')}
        </span>
      )
    },
    {
      title: 'Автомобиль',
      render: (row: Appointment) => (
        <div>
          <div style={{ color: '#fff', fontWeight: '600' }}>
            {row.car_brand} {row.car_model}
          </div>
          <div style={{ color: '#888', fontSize: '12px' }}>
            VIN: {row.car_vin}
          </div>
        </div>
      )
    },
    {
      title: 'Менеджер',
      render: (row: Appointment) => (
        <div>
          {row.manager_name ? (
            <span style={{ color: '#7a3cff' }}>{row.manager_name}</span>
          ) : (
            <span style={{ color: '#888', fontStyle: 'italic' }}>Не назначен</span>
          )}
        </div>
      )
    },
    {
      title: 'Цель встречи',
      dataIndex: 'purpose',
      render: (purpose: string) => (
        <span style={{ color: '#fff' }}>{translatePurpose(purpose)}</span>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag 
          color={getStatusColor(status)}
          style={{ 
            border: 'none',
            fontWeight: '600',
            padding: '4px 12px',
            borderRadius: '6px'
          }}
        >
          {translateStatus(status)}
        </Tag>
      )
    },
    {
      title: 'Длительность',
      dataIndex: 'duration_minutes',
      render: (minutes: number) => (
        <span style={{ color: '#7a3cff' }}>{minutes || 60} мин</span>
      )
    }
  ]

  return (
    <Layout className="user-meet-layout">
      <HeaderBar />
      <Content className="user-meet-content">
        <div className="user-meet-header">
          <h1>Мои встречи</h1>
          <div className="user-meet-stats">
            Всего встреч: <span>{appointments.length}</span>
          </div>
        </div>

        {loading && (
          <div className="spinner-container">
            <Spin size="large" />
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>У вас пока нет запланированных встреч</h3>
                <p>Забронируйте автомобиль, чтобы назначить первую встречу</p>
              </div>
            ) : (
              <div className="appointments-table-container">
                <Table
                  dataSource={appointments}
                  columns={columns}
                  rowKey="appointment_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `Показаны ${range[0]}-${range[1]} из ${total} встреч`
                  }}
                  className="appointments-table"
                />
              </div>
            )}
          </>
        )}
      </Content>
    </Layout>
  )
}