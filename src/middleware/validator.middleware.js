import { validationResult } from 'express-validator';

const validateFields = (req, res, next) => {
  const errors = validationResult(req); // obtiene los errores de validación

  if (!errors.isEmpty()) {

    const formatErr = {}

    errors.array().forEach(err => {
       if (!formatErr[err.path]) {
      formatErr[err.path] = [];
    }
    formatErr[err.path].push(err.msg);
    })
    // formatea los errores para que sean más legibles
    return res.status(400).json({
      status: false,
      msg: "Errores de validación",
      errors: formatErr // devuelve un objeto con los campos y sus errores correspondientes
    });
  }

  next();
};

export default validateFields;