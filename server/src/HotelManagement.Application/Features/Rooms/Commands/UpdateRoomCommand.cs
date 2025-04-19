using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Commands
{
    public class UpdateRoomCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Capacity { get; set; }
        public int Size { get; set; }
        public string Beds { get; set; }
        public List<string> Amenities { get; set; }
        public List<string> Images { get; set; }
        public bool Available { get; set; }
    }

    public class UpdateRoomCommandValidator : AbstractValidator<UpdateRoomCommand>
    {
        public UpdateRoomCommandValidator()
        {
            RuleFor(p => p.Id)
                .NotEmpty().WithMessage("{PropertyName} is required.");

            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(100).WithMessage("{PropertyName} must not exceed 100 characters.");

            RuleFor(p => p.Description)
                .NotEmpty().WithMessage("{PropertyName} is required.");

            RuleFor(p => p.Price)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");

            RuleFor(p => p.Capacity)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");

            RuleFor(p => p.Size)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");

            RuleFor(p => p.Beds)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(100).WithMessage("{PropertyName} must not exceed 100 characters.");
        }
    }

    public class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand, BaseResponse>
    {
        private readonly IRoomRepository _roomRepository;

        public UpdateRoomCommandHandler(IRoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<BaseResponse> Handle(UpdateRoomCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var roomToUpdate = await _roomRepository.GetByIdAsync(request.Id);
            if (roomToUpdate == null)
            {
                response.Success = false;
                response.Message = "Room not found";
                return response;
            }

            // Update properties
            roomToUpdate.Name = request.Name;
            roomToUpdate.Description = request.Description;
            roomToUpdate.Price = request.Price;
            roomToUpdate.Capacity = request.Capacity;
            roomToUpdate.Size = request.Size;
            roomToUpdate.Beds = request.Beds;
            roomToUpdate.Amenities = request.Amenities ?? new List<string>();
            roomToUpdate.Images = request.Images ?? new List<string>();
            roomToUpdate.Available = request.Available;

            var updatedRoom = await _roomRepository.UpdateAsync(roomToUpdate);

            if (updatedRoom != null)
            {
                response.Success = true;
                response.Message = "Room updated successfully";
            }
            else
            {
                response.Success = false;
                response.Message = "Failed to update room";
                response.Errors.Add("An error occurred while updating the room");
            }

            return response;
        }
    }
}