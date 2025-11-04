import React, { useState } from 'react'
import type { Car } from '../types'
import CarModal from './CarModal'

export default function CarCard({ car }: { car: Car }) {
  const [modalVisible, setModalVisible] = useState(false)

  const placeholder =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="100%" height="100%" fill="%23000"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23aaa" font-size="20">Нет фото</text></svg>'

  return (
    <>
      <article className="card car-card" onClick={() => setModalVisible(true)}>
        <img src={car.img ?? placeholder} alt={`${car.mark} ${car.model}`} />
        <div className="card-body">
          <h3>
            {car.mark} {car.model} <small>({car.prodYear})</small>
          </h3>
          <p className="price">{car.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₽</p>
          <p className="mile">Пробег: {car.mileage?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} км</p>
        </div>
      </article>

      <CarModal car={car} visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  )
}
