using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Rooms.Commands
{
    public class CreateRoomCommand : IRequest<BaseResponse>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Capacity { get; set; }
        public int Size { get; set; }
        public string Beds { get; set; }
        public List<string> Amenities { get; set; }
        public List<string> Images { get; set; }
    }

    public class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
    {
        public CreateRoomCommandValidator()
        {
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

    public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, BaseResponse>
    {
        private readonly IRoomRepository _roomRepository;

        public CreateRoomCommandHandler(IRoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<BaseResponse> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var room = new Room
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Capacity = request.Capacity,
                Size = request.Size,
                Beds = request.Beds,
                Amenities = request.Amenities ?? new List<string>(),
                Images = request.Images ?? new List<string>(),
                Available = true
            };

            var createdRoom = await _roomRepository.AddAsync(room);

            if (createdRoom != null)
            {
                response.Success = true;
                response.Message = "Room created successfully";
            }
            else
            {
                response.Success = false;
                response.Message = "Failed to create room";
                response.Errors.Add("An error occurred while creating the room");
            }

            return response;
        }
    }
}