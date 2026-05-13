import { body, check } from 'express-validator';
const tipoPedido = ["personalizado", "retoques", "modificaciones",]
const estadoPedido = ["pendiente", "retoques", "modificaciones",]

// validacion basica para registro de pedido
export const basePedidoValidator = [
  body("id_cliente")
    .notEmpty()
    .withMessage("id del cliente requerido")
    .isLength({ max: 15, min: 7 })
    .withMessage("el id del cliente debe de tener como minimo 7 caracteres maximo 15 caracteres"),

  body('fecha_estimada')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("La fecha debe tener formato válido (YYYY-MM-DD)")
    .custom(value => {
      // console.log(value) 
      const hoy = new Date().toISOString().split('T')[0]; // obtener solo año, mes y día
      const fecha = new Date(value).toISOString().split('T')[0]; // convertir la fecha ingresada al mismo formato

      // console.log(hoy, fecha);

      if (fecha < hoy) {
        throw new Error('La fecha no puede ser anterior a hoy');
      }

      return true;
    }),

  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage("Observaciones debe ser texto"),

  body('recordatorio')
    .optional({ nullable: true })
    .isInt()
    .withMessage("El recordatorio debe ser un numero"),

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
    .isIn(["pendiente", "terminado", "cancelado", "en_proceso"])
    .withMessage("el estado debe ser: pendiente | terminado | cancelado | en_proceso"),

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
    .withMessage("tipo_pedido debe ser: personalizado | retoques | modificaciones")
]

export const updateValidator = [
  body("id_cliente")
    .optional()
    .isLength({ max: 15, min: 7 })
    .withMessage("El id del cliente debe tener entre 7 y 15 caracteres"),

  body('fecha_estimada')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("La fecha debe tener formato válido (YYYY-MM-DD)")
    .custom(value => {
      const hoy = new Date().toISOString().split('T')[0];
      const fecha = new Date(value).toISOString().split('T')[0];

      if (fecha < hoy) {
        throw new Error('La fecha no puede ser anterior a hoy');
      }

      return true;
    }),

  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage("Observaciones debe ser texto"),

  body('recordatorio')
    .optional({ nullable: true })
    .isInt()
    .withMessage("El recordatorio debe ser un número"),

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

export const cancelPedidoValidator = [
  body('motivo')
    .notEmpty()
    .withMessage('El motivo de cancelación es obligatorio')
    .isString()
    .withMessage('El motivo debe ser texto')
    .isLength({ max: 255 })
    .withMessage('El motivo no puede superar los 255 caracteres')
];