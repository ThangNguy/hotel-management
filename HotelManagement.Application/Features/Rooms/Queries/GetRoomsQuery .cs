using HotelManagement.Domain.Entities;
using HotelManagement.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Application.Features.Rooms.Queries;

public record GetRoomsQuery() : IRequest<List<Room>>;

public class GetRoomsQueryHandler : IRequestHandler<GetRoomsQuery, List<Room>>
{
    private readonly HotelDbContext _context;

    public GetRoomsQueryHandler(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<List<Room>> Handle(GetRoomsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Rooms.ToListAsync(cancellationToken);
    }
}