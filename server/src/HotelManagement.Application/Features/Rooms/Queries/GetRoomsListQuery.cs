using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Queries
{
    public class GetRoomsListQuery : IRequest<List<RoomDto>>
    {
    }

    public class GetRoomsListQueryHandler : IRequestHandler<GetRoomsListQuery, List<RoomDto>>
    {
        private readonly IRoomRepository _roomRepository;

        public GetRoomsListQueryHandler(IRoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<List<RoomDto>> Handle(GetRoomsListQuery request, CancellationToken cancellationToken)
        {
            var rooms = await _roomRepository.GetAllAsync();
            
            return rooms.Select(room => new RoomDto
            {
                Id = room.Id,
                Name = room.Name,
                Description = room.Description,
                Price = room.Price,
                Capacity = room.Capacity,
                Size = room.Size,
                Beds = room.Beds,
                Amenities = room.Amenities,
                Available = room.Available,
                Images = room.Images
            }).ToList();
        }
    }
}