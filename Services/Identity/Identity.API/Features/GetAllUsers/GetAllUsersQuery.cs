using BuildingBlocks.CQRS;
using Identity.API.Dtos;

namespace Identity.API.Features.GetAllUsers;

public record GetAllUsersResult(IEnumerable<UserWithRolesDto> Users);
public record GetAllUsersQuery : IQuery<GetAllUsersResult>;
