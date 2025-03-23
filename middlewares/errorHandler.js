import { Sequelize } from "sequelize"

export const handleErrors = (error, res) => {
  if (error instanceof Sequelize.Error.ValidationError) {
    const validationErrors = Object.values(error.errors).map(err => err.message)
    return res
      .status(400)
      .json({ success: false, error: 'Not Found.', details: validationErrors })
  } else {
    console.error(error)
    return res.status(500).json({ success: false, error: 'Something went wrong, please try again.'})
  }
}