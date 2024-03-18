import moment from "moment";

export const validation = (schema) => {
  return (req, res, next) => {
    let inputs = { ...req.body, ...req.params, ...req.query };

    let { error } = schema.validate(inputs, { abortEarly: false });
    if (error) {
      let errors = error.details.map((detail) => detail.message);
      res.json(errors);
    } else {
      next();
    }
  };
};

export const customDateValidator = (value, helpers) => {
  const date = moment(value, 'D/M/YYYY', true);
  if (!date.isValid()) {
    return helpers.error('any.invalid');
  }
  return date.toDate();
};