import { Sequelize } from 'sequelize';
import { config } from '../config/config.js'; 

export const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.username,
  config.mysql.password,
  {
    host: config.mysql.host,
    dialect: 'mysql',
    logging: false, 
  }
);

export const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

