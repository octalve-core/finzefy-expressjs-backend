import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

export const sendEmail = async ({ to, subject, text, template, context }) => {
  try {
    const transporter = createTransporter();

    // Configure handlebars with absolute paths
    const viewPath = path.resolve(__dirname, '..', 'views');
    console.log('Template directory:', viewPath); // Debug log

    const hbsConfig = {
      viewEngine: {
        extName: '.handlebars',
        partialsDir: viewPath,
        layoutsDir: viewPath,
        defaultLayout: false,
      },
      viewPath: viewPath,
      extName: '.handlebars',
    };

    transporter.use('compile', hbs(hbsConfig));

    // Remove .handlebars extension if present in template name
    const templateName = template.replace('.handlebars', '');

    const mailOptions = {
      from: {
        name: 'Finzefy',
        address: process.env.EMAIL_USER
      },
      to,
      subject,
      text,
      template: templateName,
      context
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      template,
      viewPath: path.resolve(__dirname, '..', 'views'),
      error: error.message
    });
    return false;
  }
};