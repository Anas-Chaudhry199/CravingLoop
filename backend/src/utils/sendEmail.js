import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT, 
        secure: true, 
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

 
    const mailOptions = {
        from: `"CravingLoop Support" <${process.env.SMTP_USER}>`, 
        to: email, 
        subject: subject, 
        html: message, 
    };

    // 3. Email send karein
    await transporter.sendMail(mailOptions);
};