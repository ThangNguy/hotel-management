using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Commands
{
    public class DeleteRoomCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
    }

    public class DeleteRoomCommandValidator : AbstractValidator<DeleteRoomCommand>
    {
        public DeleteRoomCommandValidator()
        {
            RuleFor(p => p.Id)
                .NotEmpty().WithMessage("{PropertyName} is required.");
        }
    }

    public class DeleteRoomCommandHandler : IRequestHandler<DeleteRoomCommand, BaseResponse>
    {
        private readonly IRoomRepository _roomRepository;

        public DeleteRoomCommandHandler(IRoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<BaseResponse> Handle(DeleteRoomCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var roomExists = await _roomRepository.RoomExistsAsync(request.Id);
            if (!roomExists)
            {
                response.Success = false;
                response.Message = "Room not found";
                return response;
            }

            var result = await _roomRepository.DeleteAsync(request.Id);

            if (result)
            {
                response.Success = true;
                response.Message = "Room deleted successfully";
            }
            else
            {
                response.Success = false;
                response.Message = "Failed to delete room";
                response.Errors.Add("This room cannot be deleted because it has active bookings");
            }

            return response;
        }
    }
}