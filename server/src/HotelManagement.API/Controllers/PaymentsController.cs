using System.IO;
using System.Threading.Tasks;
using HotelManagement.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HotelManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentsController> _logger;
        private readonly IConfiguration _config;

        public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger, IConfiguration config)
        {
            _paymentService = paymentService;
            _logger = logger;
            _config = config;
        }

        [HttpPost("create-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
        {
            try
            {
                var clientSecret = await _paymentService.CreatePaymentIntentAsync(
                    request.Amount, 
                    request.Currency, 
                    request.BookingId
                );

                return Ok(new { clientSecret });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Error creating payment intent");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeSignature = Request.Headers["Stripe-Signature"];

            var success = await _paymentService.ProcessWebhookAsync(json, stripeSignature);

            if (success)
            {
                return Ok();
            }

            return BadRequest();
        }
    }

    public class CreatePaymentIntentRequest
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "usd";
        public string BookingId { get; set; } = string.Empty;
    }
}
