import nodemailer from "nodemailer";

export async function sendMail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS 
    },
  });

  return transporter.sendMail({
    from: `"SpeedBoat Support"<support@speedboat.com>'`,
    to,
    subject,
    html,
  });

}

// // utils/mailer.js
// import sgMail from '@sendgrid/mail'; 
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// export async function sendMail({ to, subject, html }) {
  
//   const msg = {
//     to: to, 
//     from: {
//       email: 'info@speedboat.com', 
//       name: 'speedboat Support',     
//     },
//     subject: subject,
//     html: html,
//   };

//   try {
//     return await sgMail.send(msg); 
//   } catch (error) {
//     console.error('Error sending email with SendGrid:', error);
//     if (error.response) {
//       console.error(error.response.body);
//     }
//     throw error;
//   }
// }

