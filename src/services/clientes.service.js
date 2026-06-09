import { ClienteModel } from "../models/cliente.models.js";
import { UserModel } from "../models/user.models.js";
import { calculateTotalPages } from "../utils/paginacion.js";
import db from "../config/db.js";
import { generateId } from "../utils/genId.js";
const transfromEstado = ['activo', 'inactivo']
export const obtenerClientes = async (pagina = 1, limite = 15, filtros = {}) => {
  // Asegurar valores numéricos
  const paginaActual = parseInt(pagina, 10) || 1;
  const limitePagina = parseInt(limite, 10) || 15;
  const offset = (paginaActual - 1) * limitePagina;

  // Obtener total y datos en paralelo
  const [total, filas] = await Promise.all([
    ClienteModel.getAll(limitePagina, offset, filtros),
    ClienteModel.getTotalClientes(filtros)
  ]);
  console.log(total)
  // Mapear filas al formato deseado
  const data = total.map(row => {
    // Separar cliNom en nombre y apellido (primer palabra y resto)
    // const partes = (row.cliNom || '').trim().split(/\s+/);
    // const nombre = partes[0] || '';
    // const apellido = partes.slice(1).join(' ') || '';

    return {
      cliente_id: String(row.cliId),
      cliente_nombre: row.cliNom,
      cliente_apellido: row.cliApe,
      cliente_email: row.cliCorr || null,
      cliente_direccion: row.cliDir || null,
      estado: transfromEstado[row.cliEst - 1],
      fecha_creacion: row.cliFecReg // directamente el valor de la BD (string/fecha)
    };
  });

  return {
    meta: {
      paginas_totales: calculateTotalPages(filas, limitePagina),
      pagina_actual: paginaActual,
      total: filas,
      limite: limitePagina
    },
    data
  };
}

export const obtenerClientePorId = async (id) => {
  // Usamos el método getById del modelo (devuelve { status, data } o false)
  
  const resultado = await ClienteModel.getById(id);

  if (!resultado || !resultado.status) {
    return null; // No encontrado
  }

  const cliente = resultado.data; // fila de la tabla cliente

  // Obtener usuario si existe (asumimos que cliente tiene usuIdFk)
  let usuario = null;

  if (cliente.usuIdFk) {
    const usuarios = await UserModel.getById(cliente.usuIdFk);
    // console.log(cliente.usuIdFk);
    if (usuarios.length > 0) {
      const u = usuarios[0];
      const partesUsu = (u.usuNom || '').trim().split(/\s+/);
      usuario = {
        user_id: String(u.usuId),
        user_nombres: u.usuNom,
        user_apellido: u.usuApe
      };
    }
  }

  // Si no hay usuario relacionado, devolvemos un objeto vacío (según el JSON de ejemplo)
  if (!usuario) {
    usuario = {
      user_id: "",
      user_nombres: "",
      user_apellido: ""
    };
  }

  // Obtener teléfonos
  const telefonosRaw = await ClienteModel.getTelefonoByClienteId(id);

  const telefonos = telefonosRaw.map(tel => ({
    numero_telefono: tel.cliTel
  }));

  // Construir la respuesta
  return {
    cliente_id: String(cliente.cliId),
    cliente_nombre: cliente.cliNom,
    cliente_apellido: cliente.cliApe,
    cliente_email: cliente.cliCorr || null,
    cliente_direccion: cliente.cliDir || null,
    usuario,
    telefonos,
    estado: transfromEstado[cliente.cliEst - 1],
    fecha_creacion: cliente.cliFecReg,
    historial_pedido: []  // Por ahora vacío
  };
}

export const crearCliente = async (body) => {
  const {
    cliente_id = generateId('CLI'),
    cliente_nombre,
    cliente_apellido,
    cliente_email,
    cliente_direccion,
    telefono = [],
    user_id
  } = body;
  console.log(cliente_id);
  
  // Fecha actual para fecha_creacion
  const fechaCreacion = new Date().toISOString().slice(0, 19).replace('T', ' '); // Formato MySQL

  // Construir objeto cliente (estado por defecto "activo")
  const nuevoCliente = {
    cliId: cliente_id,
    cliNom: cliente_nombre,
    cliApe: cliente_apellido,
    cliCorr: cliente_email || null,
    cliDir: cliente_direccion || null,
    cliFecReg: fechaCreacion,
    usuIdFk: user_id || null
  };

  // El SP sp_registrar_cliente maneja internamente el cliente + teléfonos
  await ClienteModel.create(nuevoCliente, telefono);

  // Devolver los datos completos recién creados (igual que GET /:id)
  return await obtenerClientePorId(cliente_id);
}

export const changeStatusServices = async ({id, estado}) => {
  try {
    const cliente = await ClienteModel.getById(id);
    if (!cliente || !cliente.status) return null;
    
    if(cliente.data.cliEst == 2) throw new Error("El cliente ya sen encuntra eliminado")

    await ClienteModel.changeStatus(id, estado)

  } catch (error) {
    throw error;
  }
}

 export const actualizarCliente = async (id, body) => {
    // Verificar que el cliente existe
    const existe = await ClienteModel.getById(id);
    if (!existe || !existe.status) {
      throw new Error('Cliente no encontrado');
    }

    const {
      cliente_nombre,
      cliente_apellido,
      cliente_email,
      cliente_direccion,
      telefono = []
    } = body;

    // Transacción para actualizar cliente y reemplazar teléfonos
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Actualizar datos del cliente
      await ClienteModel.update(id, {
        cliNom: cliente_nombre,
        cliApe: cliente_apellido,
        cliCorr: cliente_email || null,
        cliDir: cliente_direccion || null
      });

      // Reemplazar teléfonos: eliminar todos los existentes, luego insertar los nuevos
      await ClienteModel.deleteTelByClienteId(id, connection);
      await ClienteModel.createBatch(id, telefono, connection);

      await connection.commit();

      return {
        status: true,
        msg: 'Se actualizó con éxito los datos del cliente'
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }