using System;
using System.Threading.Tasks;
using HotelManagement.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace HotelManagement.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> logger)
        {
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            // For now, we simulate sending email by logging to console
            _logger.LogInformation("Sending Email to: {To}, Subject: {Subject}", to, subject);
            _logger.LogInformation("Body: {Body}", body);
            
            // Simulate async work
            await Task.Delay(100);
        }

        public async Task SendBookingConfirmationAsync(string guestEmail, string guestName, string bookingDetails)
        {
            var subject = "Booking Confirmation - Luxury Hotel & Resort";
            var body = $@"
                <h1>Hello {guestName},</h1>
                <p>Thank you for choosing Luxury Hotel & Resort!</p>
                <p>Your booking has been successfully created. Here are the details:</p>
                <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px;'>
                    {bookingDetails}
                </div>
                <p>We look forward to welcoming you soon.</p>
                <p>Best regards,<br/>Luxury Hotel Management Team</p>
            ";

            await SendEmailAsync(guestEmail, subject, body);
        }
    }
}
