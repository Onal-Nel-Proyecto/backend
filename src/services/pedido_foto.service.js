import fs from 'node:fs';
import path from 'node:path';
import { PedidoFotoModel } from '../models/pedido_foto.models.js';
import cloudinary from '../config/cloudinary.js';
import { PedidoModel } from '../models/pedido.models.js';

// Servicio para subir una foto a un pedido
export const subirFotoService = async (pedidoId, file) => {
  // Validar pedido
  const pedido = await PedidoModel.getById(pedidoId);
  if (!pedido) {
    return { err: 'Pedido no encontrado', errorCode: 404 };
  }

  // Validar máximo 15 imágenes
  const totalFotos = await PedidoFotoModel.countFotosByPedidoId(pedidoId);
  if (totalFotos >= 15) {
    // eliminar de Cloudinary porque ya se subió
    if (file.filename) {
      await cloudinary.uploader.destroy(file.filename);
    }

    return { err: 'El pedido ya tiene el máximo de 15 imágenes permitidas', errorCode: 400 };
  }

  // 📌 Cloudinary ya te da la URL
  const fotoUrl = file.path;        // URL final
  const publicId = file.filename;   // importantísimo

  await PedidoFotoModel.createFoto(pedidoId, {
    fotoUrl,
    publicId
  });

  return {
    msg: 'Imagen subida correctamente',
    data: {
      foto_url: fotoUrl,
      public_id: publicId
    }
  };
};

// Servicio para eliminar una foto de un pedido
export const eliminarFotoService = async (pedidoId, fotoId) => {
  const pedido = await PedidoModel.getById(pedidoId);
  if (!pedido) return { err: 'Pedido no encontrado', errorCode: 404 };

  const foto = await PedidoFotoModel.getFotoById(fotoId);
  if (!foto) return { err: 'Foto no encontrada', errorCode: 404 };

  if (String(foto.pedIdFk) !== String(pedidoId)) {
    return { err: 'La foto no pertenece a este pedido', errorCode: 400 };
  }

  // 🔥 ELIMINAR EN CLOUDINARY
  try {
    if (foto.pubId) {
      await cloudinary.uploader.destroy(foto.pubId);
    }
  } catch (err) {
    console.warn('[Cloudinary delete error]:', err.message);
  }

  // 🧹 eliminar registro en BD
  await PedidoFotoModel.deleteFoto(fotoId);

  return { msg: 'Imagen eliminada correctamente' };
};
