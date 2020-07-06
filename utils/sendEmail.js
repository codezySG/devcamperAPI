import { createTransport } from 'nodemailer';

export default async (options = {}) => {
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USERNAME,
        SMTP_PASSWORD,
        FROM_EMAIL,
        FROM_NAME
    } = process.env || {};

    const transporter = createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        auth: {
            user: SMTP_USERNAME,
            pass: SMTP_PASSWORD
        }
    });

    const { email, subject, message: msg } = options;

    // send mail with defined transport object
    const message = {
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: email,
        subject,
        text: msg
    };

    const { messageId } = await transporter.sendMail(message);

    console.log("Message sent: %s", messageId);
}