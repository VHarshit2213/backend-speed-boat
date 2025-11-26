// utils/mailer.js
import sgMail from '@sendgrid/mail'; 
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendMail({ to, subject, html }) {
  
  const msg = {
    to: to, 
    // from:"info@skalpel.com", 
    from: {
      email: 'info@skalpel.com', 
      name: 'Skalpel Support',     
    },
    subject: subject,
    html: html,
  };

  try {
    return await sgMail.send(msg); 
  } catch (error) {
    console.error('Error sending email with SendGrid:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
}