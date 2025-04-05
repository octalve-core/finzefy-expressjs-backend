import { BAD_REQUEST, SUCCESS, VALIDATION_ERROR, NOT_FOUND, UNAUTHORIZED } from '../../constants/statusCode.js'
import { User } from '../../schema/Users/authSchema.js'
import { messageHandler, hashPassword, verifyPassword, generateToken, generateOTP, isOTPExpired } from '../../utils/index.js'
import { sendEmail } from '../../modules/notifications/email.js'
export const registerService = async ({data}, callback) => {
  const { firstName, lastName, email, phoneNumber, password } = data

  try {
    const existingUser = await User.findOne({ where: { email } })
    if(existingUser) {
      return callback(messageHandler("Email already exists", false, BAD_REQUEST, {}))
    }

    const existingPhone = await User.findOne({ where: { phoneNumber } })
    if(existingPhone) {
      return callback(messageHandler("Phone number already exists", false, BAD_REQUEST, {}))
    }

    const hashedPassword = await hashPassword(password)
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      otp,
      otpExpiry
    })

    const emailSent = await sendEmail({
      to: email,
      subject: "Email Verification",
      text: `Your OTP is ${otp} and it will expire in 10 minutes`,
      template: "emailVerification",
      context: { 
        otp,
        name: `${firstName} ${lastName}`,
        otpExpiry: otpExpiry.toLocaleString()
      }
    })

    if (!emailSent) {
      // If email fails, still return success but with a different message
      return callback(messageHandler(
        "Registration successful but verification email could not be sent. Please contact support.",
        true,
        SUCCESS,
        { email: user.email }
      ))
    }

    return callback(messageHandler(
      "Registration successful. Please check your email for OTP verification.",
      true,
      SUCCESS,
      { email: user.email }
    ))
  } catch (error) {
    console.error('Registration error:', error);
    return callback(messageHandler("Failed to register", false, BAD_REQUEST, {}))
  }
}

export const verifyOTPService = async ({data}, callback) => {
  const { email, otp } = data
  try {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return callback(messageHandler("User not found", false, NOT_FOUND, {}))
    }

    if (user.isVerified) {
      return callback(messageHandler("Email already verified", false, BAD_REQUEST, {}))
    }

    if (isOTPExpired(user.otpExpiry)) {
      return callback(messageHandler("OTP has expired", false, BAD_REQUEST, {}))
    }

    if (user.otp !== otp) {
      return callback(messageHandler("Invalid OTP", false, BAD_REQUEST, {}))
    }

    user.isVerified = true
    user.otp = null
    user.otpExpiry = null
    await user.save()

    const token = generateToken({ id: user.id, email: user.email })
    return callback(messageHandler("Email verified successfully", true, SUCCESS, { token, user }))
  } catch (error) {
    return callback(messageHandler("Verification failed", false, BAD_REQUEST, {}))
  }
}

export const loginService = async ({data}, callback) => {
  const {email, password} = data

  try {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return callback(messageHandler("User not found", false, NOT_FOUND, {}))
    }

    if (!user.isVerified) {
      return callback(messageHandler("Please verify your email first", false, UNAUTHORIZED, {}))
    }

    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return callback(messageHandler("Invalid password", false, BAD_REQUEST, {}))
    }

    const token = generateToken({ id: user.id, email: user.email })
    return callback(messageHandler("Login successful", true, SUCCESS, { 
      user, 
      token 
    }))
  } catch (error) {
    return callback(messageHandler("Login failed", false, BAD_REQUEST, {}))
  }
}



