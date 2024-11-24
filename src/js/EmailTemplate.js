import emailjs from 'emailjs-com';

export const sendBookingConfirmation = (recipientEmail, bookingDetails) => {
    const { services} = bookingDetails;

      const formattedServices = services.map(
        (service) => `${service.name} - ${service.duration} mins - RM ${service.price}`
      ).join('\n');

      const templateParams = {
        to_email: recipientEmail,
        to_name: bookingDetails.customerName || 'Valued Customer', // Fallback if name is missing
        business_name: bookingDetails.businessName || 'Not Provided',
        business_address: bookingDetails.businessAddress || 'Not Provided',
        business_mobile: bookingDetails.businessPhone || 'Not Provided',
        services: formattedServices || 'Not Provided',
        date: bookingDetails.date || 'Not Provided',
        time_slot: bookingDetails.timeSlot || 'Not Provided',
        total_cost: bookingDetails.totalCost || 'Not Provided',
        payment_status: bookingDetails.paymentStatus || 'Not Provided',
        payment_method: bookingDetails.paymentMethod || 'Not Provided',
      };

    emailjs.send('service_4brhxhc', 'template_yrclu0p', templateParams, 'C-72nSZNdqkySR8Or')
    .then((response) => {
      console.log('Email sent successfully!', response.status, response.text);
    })
    .catch((error) => {
      console.error('Error sending email:', error);
    });
};


export const sendUserCancellationNotification = (details) => {
  const templateParams = {
    business_email: details.recipientEmail,
    business_name: details.businessName,
    customer_name: details.customerName,
    reservation_date: details.date,
    reservation_time: details.timeSlot,
    cancellation_reason: details.cancellationReason || "Not provided",
  };

  emailjs.send('service_4brhxhc', 'template_4t25f9z', templateParams , 'C-72nSZNdqkySR8Or')
  .then((response) => {
    console.log('Cancellation notification sent:', response.status, response.text);
  })
  .catch((error) => {
    console.error('Failed to send cancellation notification:', error);
  });
};