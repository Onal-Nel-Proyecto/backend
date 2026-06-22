import { body, check, param } from 'express-validator';
import db from "../config/db.js";
const tipoPedido = ["personalizado", "retoques", "modificaciones",]

// Obtener la fecha actual desde el servidor MySQL (no confiar en hora local)
const getCurrentDate = async () => {
  const [[{ hoy }]] = await db.query("SELECT CURDATE() AS hoy");
  return hoy; // string YYYY-MM-DD
};

// validacion basica para registro de pedido
export const basePedidoValidator = [
  body("cliente_id")
    .notEmpty()
    .withMessage("id del cliente requerido")
    .isLength({ max: 15, min: 7 })
    .withMessage("el id del cliente debe de tener como minimo 7 caracteres maximo 15 caracteres"),

  body('fecha_estimada')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("La fecha debe tener formato válido (YYYY-MM-DD)")
    .custom(async (value) => {
      // Obtener la fecha actual desde MySQL (no confiar en hora local)
      const hoy = await getCurrentDate();

      // value ya viene como YYYY-MM-DD validado por isISO8601
      if (value < hoy) {
        throw new Error('La fecha no puede ser anterior a hoy');
      }

      // Calcular fecha máxima (1 año a partir de hoy)
      const fechaMax = new Date(hoy);
      fechaMax.setFullYear(fechaMax.getFullYear() + 1);
      const maxStr = `${fechaMax.getFullYear()}-${String(fechaMax.getMonth() + 1).padStart(2, '0')}-${String(fechaMax.getDate()).padStart(2, '0')}`;

      if (value > maxStr) {
        throw new Error('La fecha estimada no puede superar un año a partir de hoy');
      }

      return true;
    }),

  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage("Observaciones debe ser texto"),

  body('recordatorio')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("El recordatorio debe tener formato válido (YYYY-MM-DD)")
    .custom(async (value, { req }) => {
      // Si se envía recordatorio, fecha_estimada es obligatoria
      if (!req.body.fecha_estimada) {
        throw new Error('Si se envía un recordatorio, la fecha estimada de entrega es obligatoria');
      }

      // El recordatorio no puede ser posterior a la fecha estimada
      if (value > req.body.fecha_estimada) {
        throw new Error('El recordatorio no puede ser mayor a la fecha estimada de entrega');
      }

      return true;
    }),

  body('tipo_pedido')
    .optional({ nullable: true, checkFalsy: true })
    .toLowerCase()
    .isIn(tipoPedido)
    .withMessage("Tipo de pedido inválido"),

  body('descripcion')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage("La descripción debe ser texto")
    .isLength({ max: 100 })
    .withMessage("La descripción no puede tener más de 100 caracteres"),
]

// validaciones para parametros de pedidos
export const parametroValidator = [
  check('pag')
    .optional()
    .isInt()
    .withMessage("el parametro pag debe ser un numero"),

  check('estado')
    .optional()
    .custom((value) => {
      const estados = value.split(',').map(s => s.trim().toLowerCase());
      const validos = ["pendiente", "terminado", "cancelado", "en proceso", "entregado", "completados"];
      for (const est of estados) {
        if (!validos.includes(est)) {
          throw new Error(`Estado inválido: "${est}". Valores permitidos: ${validos.join(', ')}`);
        }
      }
      return true;
    })
    .customSanitizer(val => val.toLowerCase().replace(/_/g, ' ')),

  check('fecha_desde')
    .optional()
    .isISO8601()
    .withMessage("fecha_desde debe tener formato válido (YYYY-MM-DD)"),

  check('fecha_hasta')
    .optional()
    .isISO8601()
    .withMessage("fecha_hasta debe tener formato válido (YYYY-MM-DD)"),

  check('cliente')
    .optional()
    .isString()
    .withMessage("el parametro cliente debe ser texto"),

  check('tipo_pedido')
    .optional()
    .isIn(["personalizado", "retoques", "modificaciones"])
    .withMessage("tipo_pedido debe ser: personalizado | retoques | modificaciones"),

  check('estado_pago')
    .optional()
    .isIn(["SIN PAGAR", "ABONADO", "PAGADO"])
    .withMessage("estado_pago debe ser: SIN PAGAR | ABONADO | PAGADO"),

  check('fecha_entrega_desde')
    .optional()
    .isISO8601()
    .withMessage("fecha_entrega_desde debe tener formato válido (YYYY-MM-DD)"),

  check('fecha_entrega_hasta')
    .optional()
    .isISO8601()
    .withMessage("fecha_entrega_hasta debe tener formato válido (YYYY-MM-DD)"),

  check('descripcion')
    .optional()
    .isString()
    .withMessage("descripcion debe ser texto")
    .isLength({ max: 100 })
    .withMessage("descripcion no puede tener más de 100 caracteres"),

  check('tipo_prenda')
    .optional()
    .toUpperCase()
    .isIn(['CAMISA', 'CAMISETA', 'POLO', 'PANTALON', 'JEAN', 'BERMUDA', 'SHORT', 'FALDA', 'VESTIDO', 'CHAQUETA', 'BUSO', 'SUDADERA', 'HOODIE', 'OVEROL', 'DELANTAL', 'UNIFORME', 'DOTACION', 'GORRA', 'OTRO'])
    .withMessage('tipo_prenda no válido'),

  check('mes')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("mes debe ser un número entre 1 y 12"),
]    

export const updateValidator = [
  body("cliente_id")
    .optional()
    .isLength({ max: 15, min: 7 })
    .withMessage("El id del cliente debe tener entre 7 y 15 caracteres"),

  body('fecha_estimada_entrega')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("La fecha debe tener formato válido (YYYY-MM-DD)")
    .custom(async (value) => {
      // Obtener la fecha actual desde MySQL (no confiar en hora local)
      const hoy = await getCurrentDate();

      // value ya viene como YYYY-MM-DD validado por isISO8601
      if (value < hoy) {
        throw new Error('La fecha no puede ser anterior a hoy');
      }

      // Calcular fecha máxima (1 año a partir de hoy)
      const fechaMax = new Date(hoy);
      fechaMax.setFullYear(fechaMax.getFullYear() + 1);
      const maxStr = `${fechaMax.getFullYear()}-${String(fechaMax.getMonth() + 1).padStart(2, '0')}-${String(fechaMax.getDate()).padStart(2, '0')}`;

      if (value > maxStr) {
        throw new Error('La fecha estimada no puede superar un año a partir de hoy');
      }

      return true;
    }),

  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage("Observaciones debe ser texto"),

  body('recordatorio')
    .optional({ nullable: true })
    .custom(async (value, { req }) => {
      // Si se envía recordatorio, fecha_estimada es obligatoria
      if (!req.body.fecha_estimada_entrega) {
        throw new Error('Si se envía un recordatorio, la fecha estimada de entrega es obligatoria');
      }

      // El recordatorio no puede ser posterior a la fecha estimada
      if (value > req.body.fecha_estimada_entregaa) {
        throw new Error('El recordatorio no puede ser mayor a la fecha estimada de entrega');
      }

      return true;
    }),

  body('tipo_pedido')
    .optional({ nullable: true, checkFalsy: true })
    .toLowerCase()
    .isIn(tipoPedido)
    .withMessage("Tipo de pedido inválido"),

  body('descripcion')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage("La descripción debe ser texto")
    .isLength({ max: 100 })
    .withMessage("La descripción no puede tener más de 100 caracteres"),

];

export const entregarPedidoValidator = [
  param('id')
    .notEmpty()
    .isString()
    .withMessage('ID de pedido requerido'),
];

export const cancelPedidoValidator = [
  body('motivo')
    .notEmpty()
    .withMessage('El motivo de cancelación es obligatorio')
    .isString()
    .withMessage('El motivo debe ser texto')
    .isLength({ max: 255 })
    .withMessage('El motivo no puede superar los 255 caracteres')
];