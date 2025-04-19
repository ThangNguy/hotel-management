using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Queries
{
    public class GetRoomDetailQuery : IRequest<RoomDto>
    {
        public int Id { get; set; }
    }

    public class GetRoomDetailQueryHandler : IRequestHandler<GetRoomDetailQuery, RoomDto>
    {
        private readonly IRoomRepository _roomRepository;

        public GetRoomDetailQueryHandler(IRoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<RoomDto> Handle(GetRoomDetailQuery request, CancellationToken cancellationToken)
        {
            var room = await _roomRepository.GetByIdAsync(request.Id);
            
            if (room == null)
                return null;

            return new RoomDto
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
            };
        }
    }
}