import React, { useState } from 'react'
import { Modal, Button } from 'antd'
import type { Car } from '../types'
import './CarModal.scss'

interface CarModalProps {
  car: Car
  visible: boolean
  onClose: () => void
}

export default function CarModal({ car, visible, onClose }: CarModalProps) {
  const placeholder =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="100%" height="100%" fill="%23000"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23aaa" font-size="20">Нет фото</text></svg>'

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
          <p><b>Состояние:</b> {car.condition ?? '—'}</p>
          <p><b>Статус:</b> {car.status ?? '—'}</p>
          {/* <p><b>Дата публикации:</b>{car.postDate?}</p> */}
          <Button type="primary" className="car-modal-button" block style={{ marginTop: 'auto' }}>
            Договориться о встрече
          </Button>
        </div>
      </div>
    </Modal>
  )
}
