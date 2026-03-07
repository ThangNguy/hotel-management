using System.Threading.Tasks;

namespace HotelManagement.Core.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendBookingConfirmationAsync(string guestEmail, string guestName, string bookingDetails);
    }
}
