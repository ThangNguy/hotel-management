using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces
{
    public interface IPaymentService
    {
        Task<string> CreatePaymentIntentAsync(decimal amount, string currency, string bookingId);
        Task<bool> ProcessWebhookAsync(string json, string stripeSignature);
    }
}
