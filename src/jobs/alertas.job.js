//⏰ JOB DE ALERTAS — CONFIGURACIÓN DEL INTERVALO
//=================================================
//
//Ubicación:    src/jobs/alertas.job.js
//Intervalo:    CADA 15 MINUTOS
//
//📌 Para cambiar la frecuencia, modifica el primer argumento de cron.schedule():
//
//   Actual:    '*/15 * * * *'   (cada 15 minutos)
//   Cada hora: '0 * * * *'      (minuto 0 de cada hora)
//   Cada día:  '0 8 * * *'      (08:00 AM todos los días)
//   Cada 5min: '*/5 * * * *'
//
//Formato cron: minuto hora día-del-mes mes día-de-la-semana
// 
import cron from 'node-cron';
import { ejecutarVerificacionPagos } from '../services/alertas.service.js';

export const iniciarJobAlertas = () => {
  // ──────────────────────────────────────────────────────
  //  CAMBIA EL CRON AQUÍ para modificar el intervalo
  // ──────────────────────────────────────────────────────
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Ejecutando job de alertas (cada 15 minutos)...');
    await ejecutarVerificacionPagos();
  });

  // Ejecutar también una verificación inicial al arrancar el servidor
  console.log('[CRON] Job de alertas configurado. Ejecutando verificación inicial...');
  ejecutarVerificacionPagos();

  console.log('[CRON] Job de alertas programado — cada 15 minutos (*/15 * * * *)');
};
