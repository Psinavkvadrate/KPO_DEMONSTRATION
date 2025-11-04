import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api'
import { setUser } from '../utils/auth'
import { Input, Button, Form, Typography, Card, message, Row, Col } from 'antd'
import { motion } from 'framer-motion'
import { LockOutlined, UserOutlined, MailOutlined, IdcardOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import './Auth.scss'

const { Title, Text } = Typography

interface PasswordRequirements {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false
  })
  const [passwordsMatch, setPasswordsMatch] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    setPasswordRequirements({
      minLength: password.length >= 6,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    })
  }, [password])

  useEffect(() => {
    setPasswordsMatch(password === password2 && password !== '')
  }, [password, password2])

  async function handleSubmit(values: any) {
    setLoading(true)
    try {
      if (values.password !== values.password2) {
        message.error('Пароли не совпадают')
        setLoading(false)
        return
      }

      const fullName = values.surname + ' ' + values.name + ' ' + values.fathername;
      const res = await register(values.username, values.password, values.email, fullName);
      if (res.error) {
        message.error(res.error)
      } else {
        setUser(res.data.user)
        localStorage.setItem('welcome', 'true')
        nav('/')
      }
    } catch (err: any) {
      message.error(err.response?.data?.error ?? err.message)
    } finally {
      setLoading(false)
    }
  }

  // Валидаторы
  const validateUsername = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Введите логин'))
    }
    if (value.length < 3) {
      return Promise.reject(new Error('Логин должен содержать минимум 3 символа'))
    }
    return Promise.resolve()
  }

  const validateName = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Введите имя'))
    }
    if (value.length < 2) {
      return Promise.reject(new Error('Имя должно содержать минимум 2 символа'))
    }
    if (!/^[A-ZА-Я][a-zа-яёЁ]*$/.test(value)) {
      return Promise.reject(new Error('Имя должно начинаться с заглавной буквы и содержать только буквы'))
    }
    return Promise.resolve()
  }

  const validateSurname = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Введите фамилию'))
    }
    if (value.length < 2) {
      return Promise.reject(new Error('Фамилия должна содержать минимум 2 символа'))
    }
    if (!/^[A-ZА-Я][a-zа-яёЁ]*$/.test(value)) {
      return Promise.reject(new Error('Фамилия должна начинаться с заглавной буквы и содержать только буквы'))
    }
    return Promise.resolve()
  }

  const validateFathername = (_: any, value: string) => {
    if (value && value.length > 0) {
      if (value.length < 2) {
        return Promise.reject(new Error('Отчество должно содержать минимум 2 символа'))
      }
      if (!/^[A-ZА-Я][a-zа-яёЁ]*$/.test(value)) {
        return Promise.reject(new Error('Отчество должно начинаться с заглавной буквы и содержать только буквы'))
      }
    }
    return Promise.resolve()
  }

  const validatePassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Введите пароль'))
    }
/*     if (value.length < 6) {
      return Promise.reject(new Error('Пароль должен содержать минимум 6 символов'))
    }
    if (!/[a-z]/.test(value)) {
      return Promise.reject(new Error('Пароль должен содержать хотя бы одну строчную букву'))
    }
    if (!/[A-Z]/.test(value)) {
      return Promise.reject(new Error('Пароль должен содержать хотя бы одну заглавную букву'))
    }
    if (!/[0-9]/.test(value)) {
      return Promise.reject(new Error('Пароль должен содержать хотя бы одну цифру'))
    } */
    return Promise.resolve()
  }

  const validatePassword2 = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Подтвердите пароль'))
    }
    if (value !== password) {
      return Promise.reject(new Error('Пароли не совпадают'))
    }
    return Promise.resolve()
  }

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`requirement-item ${met ? 'requirement-met' : 'requirement-not-met'}`}>
      {met ? <CheckOutlined /> : <CloseOutlined />}
      <Text className="requirement-text">{text}</Text>
    </div>
  )

  return (
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
        <Card className="auth-card register-card strict">
          <Title level={3} className="auth-title strict">
            Регистрация
          </Title>

          <Form layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[16, 0]} className="register-form-row">
              {/* Левый столбец */}
              <Col xs={24} md={12} className="register-form-col">
                <Form.Item
                  name="username"
                  label={<span className="auth-label">Логин</span>}
                  rules={[{ validator: validateUsername }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Введите логин" 
                    className="auth-input strict" 
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<span className="auth-label">Email</span>}
                  rules={[
                    { required: true, message: 'Введите email' },
                    { type: 'email', message: 'Некорректный email' },
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="Введите email" 
                    className="auth-input strict" 
                  />
                </Form.Item>

                <Row gutter={8} className="compact-name-fields">
                  <Col span={8} className="register-form-col">
                    <Form.Item
                      name="surname"
                      label={<span className="auth-label">Фамилия</span>}
                      rules={[{ validator: validateSurname }]}
                    >
                      <Input 
                        prefix={<IdcardOutlined />} 
                        placeholder="Фамилия" 
                        className="auth-input strict" 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8} className="register-form-col">
                    <Form.Item
                      name="name"
                      label={<span className="auth-label">Имя</span>}
                      rules={[{ validator: validateName }]}
                    >
                      <Input 
                        prefix={<IdcardOutlined />} 
                        placeholder="Имя" 
                        className="auth-input strict" 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8} className="register-form-col">
                    <Form.Item
                      name="fathername"
                      label={<span className="auth-label">Отчество</span>}
                      rules={[{ validator: validateFathername }]}
                    >
                      <Input 
                        prefix={<IdcardOutlined />} 
                        placeholder="Отчество" 
                        className="auth-input strict" 
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              {/* Правый столбец */}
              <Col xs={24} md={12} className="register-form-col">
                <Form.Item
                  name="password"
                  label={<span className="auth-label">Пароль</span>}
                  rules={[{ validator: validatePassword }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Введите пароль" 
                    className="auth-input strict"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Item>

                <div className="password-requirements compact">
                  <Row gutter={[8, 4]}>
                    <Col span={12}>
                      <RequirementItem 
                        met={passwordRequirements.minLength} 
                        text="6+ символов" 
                      />
                    </Col>
                    <Col span={12}>
                      <RequirementItem 
                        met={passwordRequirements.hasLowercase} 
                        text="Строчная буква" 
                      />
                    </Col>
                    <Col span={12}>
                      <RequirementItem 
                        met={passwordRequirements.hasUppercase} 
                        text="Заглавная буква" 
                      />
                    </Col>
                    <Col span={12}>
                      <RequirementItem 
                        met={passwordRequirements.hasNumber} 
                        text="Цифра" 
                      />
                    </Col>
                  </Row>
                </div>

                <Form.Item
                  name="password2"
                  label={<span className="auth-label">Подтверждение пароля</span>}
                  rules={[{ validator: validatePassword2 }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Повторите пароль" 
                    className="auth-input strict"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                  />
                </Form.Item>

{/*                 {password2 && (
                  <div className="password-match-indicator">
                    <RequirementItem 
                      met={passwordsMatch} 
                      text="Пароли совпадают" 
                    />
                  </div>
                )} */}
              </Col>
            </Row>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="auth-button strict"
              style={{ marginTop: '16px' }}
            >
              Зарегистрироваться
            </Button>
          </Form>

          <div className="auth-footer">
            <Text className="auth-text">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="auth-link strict">
                Войти
              </Link>
            </Text>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}