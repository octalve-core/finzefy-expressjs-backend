import { loginService, registerService, verifyOTPService, forgotPasswordService, resetPasswordService } from '../../services/Users/authService.js'


export const registerController = async (req, res) => {
   return await registerService({ data: req.body }, (result) => {
    return res.status(result.statusCode).json({ result })
   })
}

export const verifyOTPController = async (req, res) => {
  return await verifyOTPService({ data : req.body }, (result) => {
    return res.status(result.statusCode).json({ result })
  })
}

export const loginController = async (req, res) => {
  return await loginService({ data : req.body}, (result) => {
    return res.status(result.statusCode).json({ result })
  }) 
}

export const forgotPasswordController = async (req, res) => {
  return await forgotPasswordService({ data: req.body }, (result) => {
    return res.status(result.statusCode).json({ result })
  })
}

export const resetPasswordController = async (req, res) => {
  return await resetPasswordService({ data: req.body }, (result) => {
    return res.status(result.statusCode).json({ result })
  })
}




