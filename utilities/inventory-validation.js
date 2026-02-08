const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Inventory Validation Rules for adding
  * ********************************* */
validate.addInventoryRules = () => {
  return [
    // classification_id is required and must be integer
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .isInt()
      .withMessage("Please select a classification."),

    // inv_make is required and must be string
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."),

    // inv_model is required and must be string
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a model."),

    // inv_description is required
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a description."),

    // inv_price is required and must be numeric
    body("inv_price")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide a valid price."),

    // inv_year is required, must be numeric and within range
    body("inv_year")
      .trim()
      .notEmpty()
      .isInt({ min: 1900, max: 2024 })
      .withMessage("Please provide a valid year between 1900 and 2024."),

    // inv_miles is required and must be numeric
    body("inv_miles")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide valid mileage."),

    // inv_color is required
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a color."),
  ]
}

/* ******************************
 * Check inventory data and return errors or continue to add
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { 
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body
  
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    
    res.render("inventory/add-inventory", {
      errors: errors.array(),
      title: "Add New Inventory",
      nav,
      classificationSelect,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    })
    return
  }
  next()
}

/* ******************************
 * Check update data and return errors or continue to update
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { 
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body
  
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    
    res.render("inventory/edit-inventory", {
      errors: errors.array(),
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    })
    return
  }
  next()
}

module.exports = validate