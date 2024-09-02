const nodemailer = require('nodemailer')

const sendEmail = async options => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass:  process.env.EMAIL_PASSWORD
      },
      tls: { ciphers: 'SSLv3' },
      
    })

    // Options for email
    const emailOptions = {
      from: 'Ganesh support <support@ganesh.com>',
      to: options.email,
      subject: options.subject,
      text: options.message
    }

    // Send email
    await transporter.sendMail(emailOptions)
  } catch (error) {
    // Handle errors
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

module.exports = sendEmail
