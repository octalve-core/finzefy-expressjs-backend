import { updateBusinessInfoService, updatePrimaryCurrencyService } from '../../services/Business/businessService.js'

export const updateBusinessInfoController = async (req, res) => {
    const userId = req.user.id
    const businessData = req.body

    if (req.file) {
      businessData.digitalSignature = req.file.path
    }
    return await updateBusinessInfoService({ userId, data: businessData }, (result) => {
      return res.status(result.statusCode).json({ result })
    })
}

export const updatePrimaryCurrencyController = async (req, res) => {
  const userId = req.user.id
  return await updatePrimaryCurrencyService({ userId, data: req.body }, (result) => {
    return res.status(result.statusCode).json({ result })
  })
} 