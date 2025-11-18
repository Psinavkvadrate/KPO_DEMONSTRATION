import React, { useEffect, useState } from 'react'
import { Layout, Table, Spin, Tag, Button, Modal, Form, Input, DatePicker, Select, message } from 'antd'
import HeaderBar from '../components/HeaderBar'
import { 
  fetchManagerAppointments, 
  unassignManagerFromAppointment, 
  updateAppointment, 
  type ManagerAppointment 
} from '../api'
import { getUser } from '../utils/auth'
import dayjs from 'dayjs'
import './UserMeet.scss'

const { Content } = Layout
const { TextArea } = Input

export default function ManagerMyMeet() {
  const [appointments, setAppointments] = useState<ManagerAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editModal, setEditModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<ManagerAppointment | null>(null)

  const [form] = Form.useForm()
  const user = getUser()

  // ---- LOAD DATA ----
  const loadData = async () => {
    setLoading(true)
    try {
      const all = await fetchManagerAppointments()
      const mine = all.filter(a => a.manager_id === user?.id)
      setAppointments(mine)
    } catch {
      setError('Ошибка загрузки встреч')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ---- HELPERS ----

  const translateStatus = (s: string) => ({
    Scheduled: 'Запланирована',
    Completed: 'Завершена',
    Cancelled: 'Отменена'
  }[s] || s)

  const translatePurpose = (p: string) => ({
    'Car pickup and contract signing': 'Подписание договора и выдача авто',
    'Test drive': 'Тест-драйв',
    'Consultation': 'Консультация',
    'Payment discussion': 'Обсуждение оплаты',
    'Car inspection': 'Осмотр авто'
  }[p] || p)

  const getStatusColor = (status: string) => ({
    Scheduled: '#7a3cff',
    Completed: '#52c41a',
    Cancelled: '#ff4d4f'
  }[status] || '#888')

  // ---- ACTIONS ----

  const openEditModal = (row: ManagerAppointment) => {
    setSelectedAppointment(row)
    form.setFieldsValue({
      appointment_date: dayjs(row.appointment_date),
      duration_minutes: row.duration_minutes,
      purpose: row.purpose,
      status: row.status,
      notes: row.notes
    })
    setEditModal(true)
  }

  const startDKP = (appointment) => {
    window.location.href = `/dkp/create/${appointment.appointment_id}`;
    };


  const saveAppointment = async () => {
    if (!selectedAppointment) return

    const values = form.getFieldsValue()

    try {
      await updateAppointment(selectedAppointment.appointment_id, {
        appointment_date: values.appointment_date?.toISOString(),
        duration_minutes: values.duration_minutes,
        purpose: values.purpose,
        status: values.status,
        notes: values.notes
      })
      message.success("Встреча обновлена")
      setEditModal(false)
      loadData()
    } catch {
      message.error("Ошибка обновления")
    }
  }

  const handleUnassign = async (id: number) => {
    if (!user) return
    try {
      await unassignManagerFromAppointment(id, user.id)
      message.success("Вы сняты со встречи")
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
        <span style={{ color: '#7a3cff', fontWeight: 600 }}>
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
          <div style={{ fontWeight: 600 }}>{row.car_brand} {row.car_model}</div>
          <div style={{ color: '#888', fontSize: 12 }}>VIN: {row.car_vin}</div>
        </div>
      )
    },
    {
      title: 'Цель',
      dataIndex: 'purpose',
      render: (p: string) => translatePurpose(p)
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ border: 'none', fontWeight: 600 }}>
          {translateStatus(status)}
        </Tag>
      )
    },
    {
      title: 'Действие',
      render: (row: ManagerAppointment) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button danger onClick={() => handleUnassign(row.appointment_id)}>
            Отменить назначение
          </Button>

          <Button onClick={() => openEditModal(row)}>
            Изменить
          </Button>

          <Button 
            type="primary"
            style={{ background: '#7a3cff' }}
            onClick={() => startDKP(row)}
        >
            Составить ДКП
        </Button>
        </div>
      )
    }
  ]

  return (
    <Layout className="user-meet-layout">
      <HeaderBar />
      <Content className="user-meet-content">
        <div className="user-meet-header">
          <h1>Мои встречи</h1>
        </div>

        {loading && (
          <div className="spinner-container"><Spin size="large" /></div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <>
            {appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>У вас пока нет встреч</h3>
                <p>Назначьтесь на встречи в разделе «Все встречи»</p>
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
                    showQuickJumper: true
                  }}
                  className="appointments-table"
                />
              </div>
            )}
          </>
        )}

        {/* MODAL */}
        <Modal
          open={editModal}
          title="Редактировать встречу"
          onCancel={() => setEditModal(false)}
          onOk={saveAppointment}
          okText="Сохранить"
          className="custom-edit-modal"
        >
          <Form layout="vertical" form={form}>
            <Form.Item label="Дата и время" name="appointment_date">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Длительность (мин)" name="duration_minutes">
              <Input type="number" />
            </Form.Item>

            <Form.Item label="Цель" name="purpose">
              <Select>
                <Select.Option value="Consultation">Консультация</Select.Option>
                <Select.Option value="Test drive">Тест-драйв</Select.Option>
                <Select.Option value="Car inspection">Осмотр авто</Select.Option>
                <Select.Option value="Payment discussion">Обсуждение оплаты</Select.Option>
                <Select.Option value="Car pickup and contract signing">
                  Подписание договора
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Статус" name="status">
              <Select>
                <Select.Option value="Scheduled">Запланирована</Select.Option>
                <Select.Option value="Completed">Завершена</Select.Option>
                <Select.Option value="Cancelled">Отменена</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Заметки" name="notes">
              <TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  )
}
