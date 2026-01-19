// Basic Email Service (Mock/Real)
// In production, you would integrate SendGrid, Resend, or Nodemailer here.

exports.sendEmail = async ({ to, subject, html, text }) => {
    // Check for API Keys in future (e.g., process.env.RESEND_API_KEY)
    const isProduction = process.env.NODE_ENV === 'production';

    console.log('--- EMAIL SERVICE ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);

    if (isProduction && process.env.EMAIL_PROVIDER_KEY) {
        // Implement real sending logic here
        console.log('Sending real email...');
    } else {
        // Development / Demo Mode
        console.log('--- BODY (HTML) ---');
        console.log(html);
        console.log('---------------------');
        console.log('Email simulated successfully.');
    }

    return true;
};
