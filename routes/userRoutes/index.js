import express from 'express'
import { loginController, registerController, verifyOTPController } from '../../controllers/Users/authControllers.js'
import { registerValidation, loginValidation, verifyOtpValidation } from '../../validations/Users/authValidations.js'
import { validate } from '../../validations/index.js'
import { checkSchema } from 'express-validator'

const userRouter = express.Router()

userRouter.post('/register', validate(checkSchema(registerValidation)), registerController)
userRouter.post('/verify-email', validate(checkSchema(verifyOtpValidation)), verifyOTPController)
userRouter.post('/login', validate(checkSchema(loginValidation)), loginController)

export default userRouter