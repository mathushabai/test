require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'yahoo',
    auth: {
        user: process.env.YAHOO_USER,
        pass: process.env.YAHOO_PASS
    }
});

app.post('/send-confirmation-email', async (req, res) => {
    const { recipientEmail, bookingDetails } = req.body;

    const { date, timeSlot, services, totalCost, paymentMethod } = bookingDetails;
    const serviceNames = services.join(', ');

    const mailOptions = {
        from: 'slotsage@yahoo.com',
        to: recipientEmail,
        subject: 'Your Booking Confirmation',
        text: `Thank you for your booking! Here are the details:\n
        Date: ${date}\n
        Time Slot: ${timeSlot}\n
        Services: ${serviceNames}\n
        Total Cost: RM ${totalCost}\n
        Payment Method: ${paymentMethod}\n\n
        We look forward to serving you!`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent:', info.response);
        res.status(200).send('Confirmation email sent.');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        res.status(500).send('Error sending email');
    }
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
});