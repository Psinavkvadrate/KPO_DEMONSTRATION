import React, { useState } from 'react'
import { Modal, Button } from 'antd'
import type { Car } from '../types'
import './CarModal.scss';
import { getUser } from '../utils/auth';
import { bookCar } from '../api';
import { useSnackbar } from '../hooks/useSnackbar';

interface CarModalProps {
  car: Car
  visible: boolean
  onClose: () => void
}

export default function CarModal({ car, visible, onClose }: CarModalProps) {
  const placeholder =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="100%" height="100%" fill="%23000"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23aaa" font-size="20">Нет фото</text></svg>'
  const isReserved = car.status === 'Rented';
  const user = getUser();
  const isUser = user.role === 'User'; 
  const { showSnackbar } = useSnackbar();

  function refactorCondition(condition: string) {
    let result: string;
    switch (condition){
      case 'good':
        result = 'В отличном техническом и внешнем состоянии. Все сервисные работы проводились вовремя, полная история обслуживания. Без вложений на ближайшие годы. Требуется только новый хозяин.';
        break;
      case 'medium':
        result = 'По кузову: есть рыжики (косметические, не сквозные), но в целом смотрится нормально. По технической части: требует внимания, есть что посмотреть и, возможно, поделать. Точнее расскажу и покажу при встрече. Машина ездящая, на ходу, но покупателю стоит быть готовым к вложения. Все скрытые дефекты покажу.'
        break;
      case 'bad':
        result = 'Продаю автомобиль в нерабочем состоянии как есть. Днище полностью сгнило, есть сквозные дыры. Двигатель запускается через раз, работает нестабильно. Коробка передач тоже с проблемами — плохо переключается. Тормозная система требует полной переборки.';
        break;
      default:
        result = 'Ну, норм :)';
        break;
    }
    return result;
  }

  function refactorStatus(status: string) {
    let result: string;
    switch (status){
      case 'Available':
        result = 'Доступна для покупки';
        break;
      case 'Rented':
        result = 'Зарезервирована';
        break;
      default:
        result = 'Продана';
        break;
    }
    return result;
  }

  async function handleBook() {
    try {
      if (!user) return;

      const bookingData = {
        user_id: user.id,
        client_name: user.full_name,
        client_phone: user.phone ?? 'Не указан',
        amount: car.amount
      };

      const res = await bookCar(car.VIN, bookingData);

      if (res.error) {
        alert('Ошибка: ' + res.error);
        return;
      }

      showSnackbar('Машина успешно забронирована! Встреча назначена на завтра.', 'success');

      onClose();

      window.location.reload();

    } catch (err: any) {
      showSnackbar('Не удалось забронировать', 'error');
    }
  }


  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      bodyStyle={{ padding: 0 }}
      centered
    >
      <div className="car-modal">
        <div className="car-modal-left">
          <img src={car.img ?? placeholder} alt={`${car.mark} ${car.model}`} />
        </div>
        <div className="car-modal-right">
          <h2>{car.mark} {car.model} ({car.prodYear})</h2>
          <p><b>VIN:</b> {car.VIN}</p>
          <p><b>Цена:</b> {car.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₽</p>
          <p><b>Пробег:</b> {car.mileage?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} км</p>
          <p><b>Статус:</b> {refactorStatus(car.status)}</p>
          <p><b>Описание:</b> {refactorCondition(car.condition)}</p>
          
          {!isReserved && isUser && (
            <Button 
              type="primary" 
              className="car-modal-button" 
              block 
              style={{ marginTop: 'auto' }}
              onClick={handleBook}
            >
              Договориться о встрече
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}