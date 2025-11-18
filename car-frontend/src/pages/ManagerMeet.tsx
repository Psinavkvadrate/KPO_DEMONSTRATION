import React, { useEffect, useState } from 'react'
import { Layout, Table, Spin, Tag, Button, message } from 'antd'
import HeaderBar from '../components/HeaderBar'
import { 
  fetchManagerAppointments, 
  assignManagerToAppointment, 
  unassignManagerFromAppointment, 
  type ManagerAppointment 
} from '../api'
import { getUser } from '../utils/auth'
import dayjs from 'dayjs'
import './UserMeet.scss'

const { Content } = Layout

export default function ManagerMeet() {
  const [appointments, setAppointments] = useState<ManagerAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = getUser()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchManagerAppointments()
      setAppointments(data)
    } catch (err) {
      setError('Ошибка загрузки встреч')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ---- UI HELPERS ----

  const translateStatus = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'Запланирована'
      case 'Completed': return 'Завершена'
      case 'Cancelled': return 'Отменена'
      default: return status
    }
  }

  const translatePurpose = (purpose: string) => {
    switch (purpose) {
      case 'Car pickup and contract signing': return 'Подписание договора и выдача авто'
      case 'Test drive': return 'Тест-драйв'
      case 'Consultation': return 'Консультация'
      case 'Payment discussion': return 'Обсуждение оплаты'
      case 'Car inspection': return 'Осмотр авто'
      default: return purpose
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return '#7a3cff'
      case 'Completed': return '#52c41a'
      case 'Cancelled': return '#ff4d4f'
      default: return '#888'
    }
  }

  // ---- ACTIONS ----

  const handleAssign = async (id: number) => {
    if (!user) return
    try {
      const res = await assignManagerToAppointment(id, user.id)
      if (res.error) message.error(res.error)
      else message.success("Вы назначены на встречу")
      loadData()
    } catch {
      message.error("Ошибка назначения")
    }
  }

  const handleUnassign = async (id: number) => {
    if (!user) return
    try {
      const res = await unassignManagerFromAppointment(id, user.id)
      if (res.error) message.error(res.error)
      else message.success("Вы сняты со встречи")
      loadData()
    } catch {
      message.error("Ошибка")
    }
  }

  // ---- TABLE ----

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'appointment_date',
      render: (val: string) => (
        <span style={{ color: '#7a3cff', fontWeight: '600' }}>
          {dayjs(val).format('DD.MM.YYYY HH:mm')}
        </span>
      )
    },
    {
      title: 'Клиент',
      render: (row: ManagerAppointment) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.client_name}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{row.client_phone}</div>
        </div>
      )
    },
    {
      title: 'Автомобиль',
      render: (row: ManagerAppointment) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {row.car_brand} {row.car_model}
          </div>
          <div style={{ color: '#888', fontSize: 12 }}>VIN: {row.car_vin}</div>
        </div>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag 
          color={getStatusColor(status)} 
          style={{ border: 'none', fontWeight: '600' }}
        >
          {translateStatus(status)}
        </Tag>
      )
    },
    {
      title: 'Менеджер',
      render: (row: ManagerAppointment) => (
        row.manager_id 
          ? <span style={{ color: '#7a3cff' }}>{row.manager_name}</span>
          : <span style={{ color: '#888', fontStyle: 'italic' }}>Не назначен</span>
      )
    },
    {
      title: 'Действие',
      render: (row: ManagerAppointment) => {
        const isMine = row.manager_id === user?.id
        const isFree = !row.manager_id

        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {isFree && (
              <Button type="primary" onClick={() => handleAssign(row.appointment_id)}>
                Назначиться
              </Button>
            )}

            {isMine && (
              <Button danger onClick={() => handleUnassign(row.appointment_id)}>
                Отменить
              </Button>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <Layout className="user-meet-layout">
      <HeaderBar />
      <Content className="user-meet-content">
        <div className="user-meet-header">
          <h1>Все встречи</h1>
          <div className="user-meet-stats">
            Всего встреч: <span>{appointments.length}</span>
          </div>
        </div>

        {loading && (
          <div className="spinner-container"><Spin size="large" /></div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {!loading && !error && (
          <>
            {appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>Пока нет доступных встреч</h3>
                <p>Ожидайте, пока клиенты забронируют авто и назначат встречи</p>
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
