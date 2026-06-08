import fs from 'node:fs';
import path from 'node:path';
import { PedidoFotoModel } from '../models/pedido_foto.models.js';
import { PedidoModel } from '../models/pedido.models.js';

// Servicio para subir una foto a un pedido
export const subirFotoService = async (pedidoId, file) => {
  // Validar que el pedido exista
  const pedido = await PedidoModel.getById(pedidoId);
  if (!pedido) {
    // Si el pedido no existe, eliminar el archivo subido
    fs.unlinkSync(file.path);
    return { err: 'Pedido no encontrado', errorCode: 404 };
  }

  // Validar máximo 15 imágenes por pedido
  const totalFotos = await PedidoFotoModel.countFotosByPedidoId(pedidoId);
  if (totalFotos >= 15) {
    fs.unlinkSync(file.path);
    return { err: 'El pedido ya tiene el máximo de 15 imágenes permitidas', errorCode: 400 };
  }

  // URL relativa para acceder a la imagen desde el frontend
  const fotoUrl = `/uploads/pedidos/${file.filename}`;

  await PedidoFotoModel.createFoto(pedidoId, fotoUrl);

  return { msg: 'Imagen subida correctamente', data: { foto_url: fotoUrl } };
};

// Servicio para eliminar una foto de un pedido
export const eliminarFotoService = async (pedidoId, fotoId) => {
  // Validar que el pedido exista
  const pedido = await PedidoModel.getById(pedidoId);
  if (!pedido) return { err: 'Pedido no encontrado', errorCode: 404 };

  // Validar que la foto exista y pertenezca al pedido
  const foto = await PedidoFotoModel.getFotoById(fotoId);
  if (!foto) return { err: 'Foto no encontrada', errorCode: 404 };
  if (String(foto.pedIdFk) !== String(pedidoId)) {
    return { err: 'La foto no pertenece a este pedido', errorCode: 400 };
  }

  // Eliminar el archivo del disco
  const filePath = path.resolve(process.cwd(), '.' + foto.fotUrl);
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    // Si el archivo físico no existe, igual eliminamos el registro
    console.warn('[eliminarFotoService] No se pudo eliminar el archivo físico:', err.message);
  }

  await PedidoFotoModel.deleteFoto(fotoId);

  return { msg: 'Imagen eliminada correctamente' };
};
