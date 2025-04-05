export const businessInfoValidation = {
  businessName: {
    notEmpty: {
      errorMessage: 'Business name is required'
    },
    trim: true
  },
  businessAddress: {
    notEmpty: {
      errorMessage: 'Business address is required'
    },
    trim: true
  },
  businessPhoneNumber: {
    notEmpty: {
      errorMessage: 'Business phone number is required'
    },
    isMobilePhone: {
      options: ['any'],
      errorMessage: 'Invalid phone number format'
    }
  },
  businessDescription: {
    notEmpty: {
      errorMessage: 'Business description is required'
    },
    trim: true
  },
  websiteLink: {
    optional: true,
    isURL: {
      errorMessage: 'Invalid website URL'
    }
  }
};

export const currencyValidation = {
  primaryCurrency: {
    notEmpty: {
      errorMessage: 'Primary currency is required'
    },
    isIn: {
      options: [['NGN', 'USD', 'EUR', 'GBP']], // Add more currencies as needed
      errorMessage: 'Invalid currency selected'
    }
  }
}; 