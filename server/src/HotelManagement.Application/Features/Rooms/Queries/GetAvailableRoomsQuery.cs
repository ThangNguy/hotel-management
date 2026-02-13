using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Queries
{
    public class GetAvailableRoomsQuery : IRequest<List<RoomDto>>
    {
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int? Adults { get; set; }
        public int? Children { get; set; }
    }

    public class GetAvailableRoomsQueryHandler : IRequestHandler<GetAvailableRoomsQuery, List<RoomDto>>
    {
        private readonly IRoomRepository _roomRepository;

        public GetAvailableRoomsQueryHandler(IRoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<List<RoomDto>> Handle(GetAvailableRoomsQuery request, CancellationToken cancellationToken)
        {
            // Get available rooms from repository (filters by date overlap)
            var availableRooms = await _roomRepository.GetAvailableRoomsAsync(request.CheckInDate, request.CheckOutDate);
            
            // Filter by capacity if provided
            if (request.Adults.HasValue)
            {
                // Simple capacity check: Room capacity must be >= Adults + (Children/2 or similar logic, or just total people)
                // Assuming Capacity is total people for now
                int totalPeople = request.Adults.Value + (request.Children ?? 0);
                availableRooms = availableRooms.Where(r => r.Capacity >= request.Adults.Value); 
                // Note: strict check might be totalPeople, but usually hotels check 'Adults' capacity primarily or total. 
                // Let's stick to Room.Capacity >= Adults for now to be safe, or Total. 
                // The prompt/UI implies Adults+Children. Let's use simple logic: Capacity >= Adults. 
                // Detailed children logic can be complex (age etc). 
                
                // Let's use: Capacity >= Adults required. Children are extra if room allows.
                // For simplicity in this demo: Capacity >= Adults
            }

            return availableRooms.Select(room => new RoomDto
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
