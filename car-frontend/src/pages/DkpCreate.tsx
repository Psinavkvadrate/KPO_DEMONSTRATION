import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, DatePicker, Spin, message } from 'antd';
import dayjs from 'dayjs';
import styles from "./DKP.module.scss";

export default function DKPCreate() {
  const { appointmentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/dkp/init/${appointmentId}`);
      const data = await res.json();

      if (!data.error) {
        setAppointment(data.data);

        form.setFieldsValue({
          place: "г. Москва, ул. Башенная, д. 11к9",
          date: dayjs(),

          owner_fullname: data.data.manager_full_name,
          buyer_fullname: data.data.client_full_name,

          vin: data.data.car_vin,
          car_brand_model: `${data.data.car_brand} ${data.data.car_model}`,
          car_year: data.data.car_year,

          body_number: "Легковой",
          price: data.data.car_price
        });
      }
    } catch {
      message.error("Ошибка загрузки данных");
    }
    setLoading(false);
  };

  const submit = async () => {
    const values = form.getFieldsValue();

    const res = await fetch("http://localhost:3000/api/dkp/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointment_id: appointmentId,
        ...values
      })
    });

    const data = await res.json();

    if (!data.error) {
      message.success("ДКП успешно создан");
      window.location.href = `/dkp/preview/${data.data.dkp_id}`;
    } else {
      message.error(data.error);
    }
  };

  if (loading) return <Spin size="large" />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Составление ДКП</h1>

        <Form layout="vertical" form={form}>
          <Form.Item label="Место составления" name="place">
            <Input className={styles.input} />
          </Form.Item>

          <Form.Item label="Дата составления" name="date">
            <DatePicker format="DD.MM.YYYY" className={styles.input} />
          </Form.Item>

          <h2 className={styles.sectionTitle}>Информация о владельце (Менеджер)</h2>
          <Form.Item label="ФИО полностью" name="owner_fullname">
            <Input className={styles.input} />
          </Form.Item>

          <h2 className={styles.sectionTitle}>Информация о покупателе</h2>
          <Form.Item label="ФИО полностью" name="buyer_fullname">
            <Input className={styles.input} />
          </Form.Item>

          <h2 className={styles.sectionTitle}>Информация о ТС</h2>

          <Form.Item label="VIN" name="vin">
            <Input className={styles.input} />
          </Form.Item>

          <Form.Item label="Марка и модель" name="car_brand_model">
            <Input className={styles.input} />
          </Form.Item>

          <Form.Item label="Год изготовления" name="car_year">
            <Input className={styles.input} />
          </Form.Item>

          <Form.Item label="Модель/№ двигателя" name="engine_number">
            <Input className={styles.input} />
          </Form.Item>

          <Form.Item label="Шасси" name="chassis_number">
            <Input className={styles.input} />
          </Form.Item>

          <Form.Item label="Кузов" name="body_number">
            <Input className={styles.input} />
          </Form.Item>

          <Form.Item label="Цвет" name="color">
            <Input className={styles.input} />
          </Form.Item>

          <Form.Item label="Стоимость ТС" name="price">
            <Input className={styles.input} />
          </Form.Item>

          <Form.Item label="Количество экземпляров" name="copies">
            <Input className={styles.input} type="number" />
          </Form.Item>

          <button className={styles.button} onClick={submit}>
            Создать ДКП
          </button>
        </Form>
      </div>
    </div>
  );
}
