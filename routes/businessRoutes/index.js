import express from 'express'
import { updateBusinessInfoController, updatePrimaryCurrencyController } from '../../controllers/Business/businessControllers.js'
import { businessInfoValidation, currencyValidation } from '../../validations/Business/businessValidations.js'
import { validate } from '../../validations/index.js'
import { verify } from '../../middlewares/auth-middleware.js'
import { checkSchema } from 'express-validator'
import { uploadManager, handleUploadErrors } from '../../modules/storage/cloudinary.js'

const businessRouter = express.Router()

businessRouter.put('/update-info', verify, uploadManager.single('digitalSignature'), handleUploadErrors, validate(checkSchema(businessInfoValidation)), updateBusinessInfoController)
businessRouter.put('/update-currency', verify, validate(checkSchema(currencyValidation)), updatePrimaryCurrencyController)

export default businessRouter 