import React from 'react'
import { Layout, Menu, Dropdown, Avatar } from 'antd'
import { UserOutlined, LogoutOutlined, CarOutlined, ScheduleOutlined } from '@ant-design/icons'
import { clearUser, getUser } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import './HeaderBar.scss'

const { Header } = Layout

export default function HeaderBar() {
  const nav = useNavigate()
  const user = getUser();
  const isUser = user.role === 'User';
  const handleLogout = () => {
    clearUser()
    nav('/login')
  }

  const menu = (
    <Menu className="profile-menu">
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Выйти
      </Menu.Item>
    </Menu>
  )

  return (
    <Header className="home-header">
      <div className="logo">ЖСПД</div>
      <Menu mode="horizontal" theme="dark" selectable={false} className="nav-menu">
        <Menu.Item key="catalog" icon={<CarOutlined />} onClick={() => nav('/home')}>
          Каталог
        </Menu.Item>
        { isUser && (
          <Menu.Item key="meet" icon={<ScheduleOutlined />} onClick={() => nav('/meet')}>
            Мои встречи
          </Menu.Item>
        )}
      </Menu>
      <div className="profile">
        <Dropdown overlay={menu} placement="bottomRight" arrow>
          <Avatar icon={<UserOutlined />} className="profile-avatar" />
        </Dropdown>
        <span className="username">{getUser()?.full_name}</span>
      </div>
    </Header>
  )
}
