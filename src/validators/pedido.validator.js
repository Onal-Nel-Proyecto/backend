import { body, check } from 'express-validator';
const tipoPedido = ["personalizado", "retoques", "modificaciones",]
const estadoPedido = ["pendiente", "retoques", "modificaciones",]

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
    .custom(value => {
      // Obtener la fecha local actual en formato YYYY-MM-DD
      const ahora = new Date();
      const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;

      // value ya viene como YYYY-MM-DD validado por isISO8601
      if (value < hoy) {
        throw new Error('La fecha no puede ser anterior a hoy');
      }

      // Calcular fecha máxima (1 año a partir de hoy)
      const fechaMax = new Date(ahora);
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
  body("cliente_id")
    .optional()
    .isLength({ max: 15, min: 7 })
    .withMessage("El id del cliente debe tener entre 7 y 15 caracteres"),

  body('fecha_estimada')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("La fecha debe tener formato válido (YYYY-MM-DD)")
    .custom(value => {
      // Obtener la fecha local actual en formato YYYY-MM-DD
      const ahora = new Date();
      const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;

      // value ya viene como YYYY-MM-DD validado por isISO8601
      if (value < hoy) {
        throw new Error('La fecha no puede ser anterior a hoy');
      }

      // Calcular fecha máxima (1 año a partir de hoy)
      const fechaMax = new Date(ahora);
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