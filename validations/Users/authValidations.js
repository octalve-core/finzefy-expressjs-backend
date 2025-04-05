import { body } from 'express-validator';

export const registerValidation = {
    firstName: {
        notEmpty: {
            errorMessage: 'First name is required'
        },
        isString: {
            errorMessage: 'First name must be a string'
        },
        trim: true
    },
    lastName: {
        notEmpty: {
            errorMessage: 'Last name is required'
        },
        isString: {
            errorMessage: 'Last name must be a string'
        },
        trim: true
    },
    email: {
        notEmpty: {
            errorMessage: 'Email is required'
        },
        isEmail: {
            errorMessage: 'Please provide a valid email'
        },
        trim: true,
        normalizeEmail: true
    },
    phoneNumber: {
        notEmpty: {
            errorMessage: 'Phone number is required'
        },
        isMobilePhone: {
            options: ['any'],
            errorMessage: 'Invalid phone number format'
        }
    },
    password: {
        notEmpty: {
            errorMessage: 'Password is required'
        },
        isLength: {
            options: { min: 6 },
            errorMessage: 'Password must be at least 6 characters long'
        },
        matches: {
            options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,}$/,
            errorMessage: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, one symbol (@#$%^&*!), and have a minimum length of 8 characters'
        }
    }
};

export const verifyOtpValidation = {
    email: {
        notEmpty: {
            errorMessage: 'Email is required'
        },
        isEmail: {
            errorMessage: 'Please provide a valid email'
        }
    },
    otp: {
        notEmpty: {
            errorMessage: 'OTP is required'
        },
        isLength: {
            options: { min: 6, max: 6 },
            errorMessage: 'OTP must be 6 digits'
        },
        isNumeric: {
            errorMessage: 'OTP must contain only numbers'
        }
    }
};

export const loginValidation = {
    email: {
        notEmpty: {
            errorMessage: 'Email is required'
        },
        isEmail: {
            errorMessage: 'Please provide a valid email'
        },
        trim: true,
        normalizeEmail: true
    },
    password: {
        notEmpty: {
            errorMessage: 'Password is required'
        }
    }
};