using HotelManagement.Domain.Entities;
using HotelManagement.Infrastructure.Persistence;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Commands;

public record CreateRoomCommand(string Number, string Type, decimal Price) : IRequest<int>;

public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, int>
{
    private readonly HotelDbContext _context;

    public CreateRoomCommandHandler(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        var room = new Room
        {
            Number = request.Number,
            Type = request.Type,
            Price = request.Price,
            IsAvailable = true
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync(cancellationToken);

        return room.Id;
    }
}