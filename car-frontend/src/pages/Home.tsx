import React, { useEffect, useState } from 'react'
import { fetchCars } from '../api'
import type { Car } from '../types'
import CarCard from '../components/CarCard'
import HeaderBar from '../components/HeaderBar'
import { Layout, Spin, Row, Col, Input, Select, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import './Home.scss'
import { useSnackbar } from '../hooks/useSnackbar'
import { getUser, getFirstAndFatherName } from '../utils/auth'

const { Content } = Layout
const { Option } = Select

export default function Home() {
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{ mark?: string; model?: string; prodYear?: string }>({})
  const { showSnackbar, SnackbarElement } = useSnackbar()

  // Показываем Snackbar только при первом заходе
  useEffect(() => {
    const shouldWelcome = localStorage.getItem('welcome')
    if (shouldWelcome) {
      const user = getUser()
      if (user) {
        showSnackbar(`Добро пожаловать, ${getFirstAndFatherName(user.full_name)}!`, 'success')
      }
      localStorage.removeItem('welcome')
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchCars()
        setCars(data)
        setFilteredCars(data)
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleFilterChange(key: string, value: string) {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    let result = [...cars]
    if (newFilters.mark) result = result.filter(c => c.mark.toLowerCase().includes(newFilters.mark.toLowerCase()))
    if (newFilters.model) result = result.filter(c => c.model.toLowerCase().includes(newFilters.model.toLowerCase()))
    if (newFilters.prodYear) result = result.filter(c => String(c.prodYear) === newFilters.prodYear)

    setFilteredCars(result)
  }

  return (
    <>
      <Layout className="home-layout">
        <HeaderBar />

        <Content className="home-content">
          <div className="filters">
            <Row gutter={12}>
              <Col span={6}>
                <Input
                  placeholder="Марка"
                  prefix={<SearchOutlined />}
                  onChange={e => handleFilterChange('mark', e.target.value)}
                />
              </Col>
              <Col span={6}>
                <Input
                  placeholder="Модель"
                  prefix={<SearchOutlined />}
                  onChange={e => handleFilterChange('model', e.target.value)}
                />
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Год"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={value => handleFilterChange('prodYear', value)}
                >
                  {[...new Set(cars.map(c => c.prodYear))].map(year => (
                    <Option key={year} value={String(year)}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Button onClick={() => { setFilteredCars(cars); setFilters({}) }}>
                  Сбросить фильтры
                </Button>
              </Col>
            </Row>
          </div>

          {loading && <Spin size="large" className="spinner" />}
          {error && <div className="error">{error}</div>}

          <div className="cars-grid">
            {filteredCars.map(car => (
              <CarCard key={car.VIN} car={car} />
            ))}
            {!loading && filteredCars.length === 0 && <div>Автомобили не найдены.</div>}
          </div>
        </Content>
      </Layout>
      {SnackbarElement}
    </>
  )
}
