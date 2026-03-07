using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;

namespace HotelManagement.Infrastructure.Services
{
    public class StripePaymentService : IPaymentService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<StripePaymentService> _logger;

        public StripePaymentService(IConfiguration config, ILogger<StripePaymentService> logger)
        {
            _config = config;
            _logger = logger;
            StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];
        }

        public async Task<string> CreatePaymentIntentAsync(decimal amount, string currency, string bookingId)
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(amount * 100), // Stripe expects amount in cents
                Currency = currency.ToLower(),
                PaymentMethodTypes = new List<string> { "card" },
                Metadata = new Dictionary<string, string>
                {
                    { "bookingId", bookingId }
                }
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);

            _logger.LogInformation("Created Stripe Payment Intent: {IntentId} for Booking: {BookingId}", intent.Id, bookingId);

            return intent.ClientSecret;
        }

        public async Task<bool> ProcessWebhookAsync(string json, string stripeSignature)
        {
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    stripeSignature,
                    _config["Stripe:WebhookSecret"]
                );

                if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
                {
                    var intent = stripeEvent.Data.Object as PaymentIntent;
                    var bookingId = intent.Metadata["bookingId"];
                    
                    _logger.LogInformation("Payment Succeeded for Intent: {IntentId}, Booking: {BookingId}", intent.Id, bookingId);
                    
                    // Logic to update booking status would go here or be triggered via an event
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stripe Webhook Error");
                return false;
            }
        }
    }
}
