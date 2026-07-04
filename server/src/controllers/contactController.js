const { sendEmail } = require('../config/mailer');

exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log(`\n[CONTACT] New message from ${name} <${email}>\nSubject: ${subject}\n${message}\n`);

    try {
      await sendEmail({
        to: process.env.SMTP_USER,
        subject: `Contact form: ${subject}`,
        html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
      });
    } catch (emailError) {
      console.warn('[CONTACT] Email delivery failed, message was still logged above:', emailError.message);
    }

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    next(error);
  }
};
