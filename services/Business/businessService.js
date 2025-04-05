import { BAD_REQUEST, SUCCESS, NOT_FOUND } from '../../constants/statusCode.js'
import { Business } from '../../schema/Business/businessSchema.js'
import { messageHandler } from '../../utils/index.js'

export const updateBusinessInfoService = async ({userId, data}, callback) => {
  try {
    let business = await Business.findOne({ where: { userId } })
    
    // If there's a digital signature URL, ensure it's properly stored
    if (data.digitalSignature) {
      // The URL will come from Cloudinary through req.file.path
      data.digitalSignature = data.digitalSignature
    }
    
    if (!business) {
      business = await Business.create({
        ...data,
        userId
      })
    } else {
      await business.update(data)
    }

    return callback(messageHandler(
      "Business information updated successfully",
      true,
      SUCCESS,
      { business }
    ))
  } catch (error) {
    console.error('Business update error:', error)
    return callback(messageHandler("Failed to update business information", false, BAD_REQUEST, {}))
  }
}

export const updatePrimaryCurrencyService = async ({userId, data}, callback) => {
  try {
    const business = await Business.findOne({ where: { userId } })
    
    if (!business) {
      return callback(messageHandler("Business profile not found", false, NOT_FOUND, {}))
    }

    await business.update({ primaryCurrency: data.primaryCurrency })

    return callback(messageHandler(
      "Primary currency updated successfully",
      true,
      SUCCESS,
      { business }
    ))
  } catch (error) {
    console.error('Currency update error:', error)
    return callback(messageHandler("Failed to update primary currency", false, BAD_REQUEST, {}))
  }
} 