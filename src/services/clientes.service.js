import { ClienteModel } from "../models/cliente.models.js";
import { UserModel } from "../models/user.models.js";
import { calculateTotalPages } from "../utils/paginacion.js";
import db from "../config/db.js";
import { generateId } from "../utils/genId.js";
import { toTitleCase } from "../utils/normalizacion_datos.js";
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

  // Recolectar todos los IDs para traer teléfonos en una sola consulta
  const ids = total.map(row => row.cliId);
  let telefonosPorCliente = {};

  if (ids.length > 0) {
    const todasLasFilasTel = await ClienteModel.getTelefonosByClientesIds(ids);
    telefonosPorCliente = todasLasFilasTel.reduce((acc, tel) => {
      if (!acc[tel.cliIdFk]) acc[tel.cliIdFk] = [];
      acc[tel.cliIdFk].push({ numero_telefono: tel.cliTel });
      return acc;
    }, {});
  }

  // Mapear filas al formato deseado
  const data = total.map(row => {
    return {
      cliente_id: String(row.cliId),
      cliente_nombre: row.cliNom,
      cliente_apellido: row.cliApe,
      cliente_email: row.cliCorr || null,
      cliente_direccion: row.cliDir || null,
      cliente_tipo_doc: toTitleCase(row.cliTipDoc),
      cliente_documento: row.cliNumDoc,
      cliente_telefonos: telefonosPorCliente[row.cliId] || [],
      estado: transfromEstado[row.cliEst - 1],
      fecha_creacion: row.cliFecReg
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
  console.log(resultado, id);
  
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
    cliente_tipo_doc: cliente.cliTipDoc,
    cliente_documento: cliente.cliNumDoc,
    usuario,
    cliente_telefonos: telefonos,
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
    cliente_documento,
    cliente_tipo_doc,
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
    cliTipDoc: cliente_tipo_doc,
    cliNumDoc: cliente_documento,
    cliFecReg: fechaCreacion,
    usuIdFk: user_id || null
  };

  // Validar que no exista otro cliente con el mismo tipo y número de documento
  if (cliente_documento && cliente_tipo_doc) {
    const existe = await ClienteModel.existsByDocumento({
      tipoDoc: cliente_tipo_doc,
      numDoc: cliente_documento
    });
    if (existe) {
      throw new Error('Ya existe un cliente registrado con ese tipo y número de documento');
    }
  }

  // El SP sp_registrar_cliente maneja internamente el cliente + teléfonos
  const { tipoOperacion } = await ClienteModel.create(nuevoCliente, telefono);

  // Devolver los datos completos recién creados (igual que GET /:id)
  const clienteData = await obtenerClientePorId(cliente_id);
  
  return { data: clienteData, tipoOperacion };
}

export const changeStatusServices = async ({id, estado}) => {
  try {
    const cliente = await ClienteModel.getById(id);
    if (!cliente || !cliente.status) return null;
    
    if(cliente.data.cliEst == 2 && estado == 2) throw new Error("El cliente ya se encuntra eliminado")

    await ClienteModel.changeStatus(id, estado)

  } catch (error) {
    throw error;
  }
}

// export const obtenerClientePorDocumento = async (documento) => {
//   const resultado = await ClienteModel.getByDocumento(documento);

//   if (!resultado || !resultado.status) {
//     return null;
//   }

//   const cliente = resultado.data;

//   // Obtener usuario si existe
//   let usuario = null;
//   if (cliente.usuIdFk) {
//     const usuarios = await UserModel.getById(cliente.usuIdFk);
//     if (usuarios.length > 0) {
//       const u = usuarios[0];
//       usuario = {
//         user_id: String(u.usuId),
//         user_nombres: u.usuNom,
//         user_apellido: u.usuApe
//       };
//     }
//   }

//   if (!usuario) {
//     usuario = {
//       user_id: "",
//       user_nombres: "",
//       user_apellido: ""
//     };
//   }

//   const telefonosRaw = await ClienteModel.getTelefonoByClienteId(cliente.cliId);
//   const telefonos = telefonosRaw.map(tel => ({
//     numero_telefono: tel.cliTel
//   }));

//   return {
//     cliente_id: String(cliente.cliId),
//     cliente_nombre: cliente.cliNom,
//     cliente_apellido: cliente.cliApe,
//     cliente_email: cliente.cliCorr || null,
//     cliente_direccion: cliente.cliDir || null,
//     cliente_tipo_doc: cliente.cliTipDoc,
//     cliente_documento: cliente.cliNumDoc,
//     usuario,
//     cliente_telefonos: telefonos,
//     estado: transfromEstado[cliente.cliEst - 1],
//     fecha_creacion: cliente.cliFecReg,
//     historial_pedido: []
//   };
// };

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
      cliente_documento,
      cliente_tipo_doc,
      telefono = []
    } = body;

    // Validar que no exista otro cliente con el mismo tipo y número de documento (excluyendo el actual)
    if (cliente_documento && cliente_tipo_doc) {
      const existe = await ClienteModel.existsByDocumento({
        tipoDoc: cliente_tipo_doc,
        numDoc: cliente_documento,
        excludeId: id
      });
      if (existe) {
        throw new Error('Ya existe un cliente registrado con ese tipo y número de documento');
      }
    }

    // Transacción para actualizar cliente y reemplazar teléfonos
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Actualizar datos del cliente
      await ClienteModel.update(id, {
        cliNom: cliente_nombre,
        cliApe: cliente_apellido,
        cliCorr: cliente_email || null,
        cliDir: cliente_direccion || null,
        cliTipDoc: cliente_tipo_doc,
        cliNumDoc: cliente_documento
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