import { Sequelize } from 'sequelize';
import { config } from '../config/config.js';

export const sequelize = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
        host: config.database.host,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export const connectToDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to the database successfully.');
        
        // sync all models
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

