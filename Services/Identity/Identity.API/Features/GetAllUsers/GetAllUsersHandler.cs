using BuildingBlocks.CQRS;
using Identity.API.Data;
using Identity.API.Dtos;
using Identity.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.API.Features.GetAllUsers;


public class GetAllUsersHandler(IdentityContext dbContext, UserManager<ApplicationUser> userManger) : IQueryHandler<GetAllUsersQuery, GetAllUsersResult>
{
    public async Task<GetAllUsersResult> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var usersWithRoles = await (
        from user in dbContext.Users
        join userRole in dbContext.UserRoles on user.Id equals userRole.UserId into userRoleGroup

        from ur in userRoleGroup.DefaultIfEmpty()
        join role in dbContext.Roles on ur.RoleId equals role.Id into roleGroup
        from r in roleGroup.DefaultIfEmpty()
        group r by new { user.Id, user.Email, user.FirstName, user.LastName } into g
        select new UserWithRolesDto
        {
            UserId = g.Key.Id,
            Email = g.Key.Email,
            FirstName = g.Key.FirstName,
            LastName = g.Key.LastName,
            Roles = g.Where(r => r != null).Select(r => r.Name).ToList()
        }

    ).AsNoTracking().ToListAsync();
        foreach (var user in usersWithRoles)
        {
            Console.WriteLine($"User: {user.FirstName} {user.LastName} ({user.Email})");
            Console.WriteLine("Roles: " + string.Join(", ", user.Roles));
            Console.WriteLine("-----------------------------------");
        }
        return new GetAllUsersResult(usersWithRoles);
    }
}
