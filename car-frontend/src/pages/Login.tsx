import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api'
import { setUser } from '../utils/auth'
import { Input, Button, Form, Typography, Card } from 'antd'
import { motion } from 'framer-motion'
import { EyeInvisibleOutlined, EyeOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import './Auth.scss'
import { useSnackbar } from '../hooks/useSnackbar'

const { Title, Text } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { showSnackbar, SnackbarElement } = useSnackbar()

  async function handleSubmit(values: any) {
    setLoading(true)
    try {
      const res = await login(values.username, values.password)

      if (res?.error) {
        showSnackbar('Неверный логин или пароль', 'error')
        return
      }

      setUser(res.data.user)
      localStorage.setItem('welcome', 'true')
      nav('/')
    } catch (err: any) {
      const messageText =
        err.response?.data?.error ||
        err.response?.statusText ||
        'Ошибка при подключении к серверу'

      showSnackbar('Неверный логин или пароль', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="auth-bg strict">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-brand">
            <img
              src="/logo.png"
              alt="Логотип ЖСПД"
              className="auth-logo"
            />
          </div>
          <Card className="auth-card strict">
            <Title level={3} className="auth-title strict">
              Вход в аккаунт
            </Title>

            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="username"
                label={<span className="auth-label">Логин</span>}
                rules={[{ required: true, message: 'Введите логин' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Введите логин"
                  className="auth-input strict"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="auth-label">Пароль</span>}
                rules={[{ required: true, message: 'Введите пароль' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Введите пароль"
                  className="auth-input strict"
                  iconRender={(visible) =>
                    visible ? (
                      <EyeOutlined className="auth-eye-icon" />
                    ) : (
                      <EyeInvisibleOutlined className="auth-eye-icon" />
                    )
                  }
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="auth-button strict"
              >
                Войти
              </Button>
            </Form>

            <div className="auth-footer">
              <Text className="auth-text">
                Нет аккаунта?{' '}
                <Link to="/register" className="auth-link strict">
                  Зарегистрироваться
                </Link>
              </Text>
            </div>
          </Card>
        </motion.div>
      </div>

      {SnackbarElement}
    </>
  )
}
