import React, { useEffect, useState } from "react";
import { Layout, Table, Button, Modal, Form, Input, Select, Spin, message } from "antd";
import HeaderBar from "../components/HeaderBar";
import "./UserMeet.scss";
import api from "../api";

const { Content } = Layout;
const { Option } = Select;

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/users");
      setUsers(response.data.data.users);
      setError("");
    } catch (err) {
      setError("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({ ...user, password: "" });
    setEditModalVisible(true);
  };

  const saveUser = async () => {
    try {
      const values = await form.validateFields();
      const body = { ...values };
      if (!body.password) delete body.password;

      await api.put(`/api/users/${selectedUser.id}`, body);

      message.success("Пользователь обновлён");
      setEditModalVisible(false);
      fetchUsers();
    } catch {
      message.error("Ошибка обновления");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "ФИО", dataIndex: "full_name" },
    { title: "Логин", dataIndex: "username" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Роль",
      dataIndex: "role",
      render: (role) => <span style={{ color: "#7a3cff", fontWeight: 600 }}>{role}</span>,
    },
    {
      title: "Действия",
      render: (_, user) => (
        <Button type="primary" onClick={() => openEditModal(user)}>
          Редактировать
        </Button>
      ),
    },
  ];

  return (
    <Layout className="user-meet-layout">
      <HeaderBar />
      <Content className="user-meet-content">
        <div className="user-meet-header">
          <h1>Управление пользователями</h1>
          <div className="user-meet-stats">
            Всего пользователей: <span>{users.length}</span>
          </div>
        </div>

        {loading && (
          <div className="spinner-container">
            <Spin size="large" />
          </div>
        )}

        {!loading && error && <div className="error-message">{error}</div>}

        {!loading && !error && users.length > 0 && (
          <div className="appointments-table-container">
            <Table
              className="appointments-table"
              columns={columns}
              dataSource={users}
              rowKey="id"
              pagination={{ pageSize: 7 }}
            />
          </div>
        )}

        <Modal
          open={isEditModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={saveUser}
          title="Редактирование пользователя"
          className="custom-edit-modal"
        >
          <Form form={form} layout="vertical">
            <Form.Item name="full_name" label="ФИО" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="username" label="Логин" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="email" label="Email" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="role" label="Роль" rules={[{ required: true }]}>
              <Select>
                <Option value="User">User</Option>
                <Option value="Manager">Manager</Option>
                <Option value="Administrator">Administrator</Option>
              </Select>
            </Form.Item>

            <Form.Item name="password" label="Пароль">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
