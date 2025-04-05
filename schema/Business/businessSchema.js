import { DataTypes } from "sequelize"
import { sequelize } from "../../database/db.js"
import { User } from "../Users/authSchema.js"

export const Business = sequelize.define('Business', {
  businessName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Business name is required"
      }
    }
  },
  businessAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Business address is required"
      }
    }
  },
  businessPhoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Business phone number is required"
      }
    }
  },
  businessDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Business description is required"
      }
    }
  },
  rcNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  taxId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instagramProfile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  facebookProfile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  twitterProfile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  websiteLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  digitalSignature: {
    type: DataTypes.STRING,
    allowNull: false
  },
  primaryCurrency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NGN'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, { timestamps: true })

export const setupAssociations = () => {
  Business.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  User.hasOne(Business, {
    foreignKey: 'userId'
  });
} 