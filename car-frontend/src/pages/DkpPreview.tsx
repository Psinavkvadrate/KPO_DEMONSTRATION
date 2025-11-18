import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, message } from "antd";
import styles from "./DKP.module.scss";

export default function DKPPreview() {
  const { dkpId } = useParams();
  const [loading, setLoading] = useState(true);
  const [dkp, setDKP] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/dkp/${dkpId}`);
      const data = await res.json();

      if (!data.error) setDKP(data.data);
      else message.error(data.error);
    } catch {
      message.error("Ошибка загрузки ДКП");
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    window.open(`http://localhost:3000/api/dkp/${dkpId}/pdf`, "_blank");
  };

  if (loading) return <Spin size="large" />;

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardWide}>
        <h1 className={styles.title}>Предпросмотр ДКП</h1>

        <div className={styles.previewBlock}>
          <h2>ДОГОВОР КУПЛИ-ПРОДАЖИ ТРАНСПОРТНОГО СРЕДСТВА</h2>

          <p><b>Место составления:</b> {dkp.place}</p>
          <p><b>Дата:</b> {dkp.date}</p>

          <h3>Продавец</h3>
          <p>{dkp.owner_fullname}</p>

          <h3>Покупатель</h3>
          <p>{dkp.buyer_fullname}</p>

          <h3>Транспортное средство</h3>
          <p><b>VIN:</b> {dkp.vin}</p>
          <p><b>Марка и модель:</b> {dkp.car_brand_model}</p>
          <p><b>Год:</b> {dkp.car_year}</p>
          <p><b>Цвет:</b> {dkp.color}</p>
          <p><b>Цена:</b> {dkp.price} ₽</p>

          <h3>Количество экземпляров</h3>
          <p>{dkp.copies}</p>
        </div>

        <div className={styles.previewActions}>
          <button className={styles.button} onClick={downloadPDF}>
            Скачать PDF
          </button>

          <button
            className={styles.buttonSecondary}
            onClick={() => window.history.back()}
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
