using System.Threading.Tasks; //: Cung cấp các loại như Task để thực hiện xử lý bất đồng bộ (async).
using API.Controllers;
using API.Data;
using API.DTOs.Account;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc; //Cung cấp các tính năng để xây dựng Web API như ControllerBase, [HttpGet], ActionResult, v.v.
using Microsoft.EntityFrameworkCore;

namespace API;

// localhost 5001 -> api/users

[Route("api/users")]
[ApiController]
public class UsersController : ControllerBase //cung cấp nhiều phương thức tiện ích như Ok(), NotFound(), BadRequest()…
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IUnitOfWork _uow;
     
    public UsersController(UserManager<AppUser> userManager, IUnitOfWork uow)
    {
        _userManager = userManager;
        _uow = uow;
    }

    [HttpGet("profile-driver")]
    [Authorize(Roles ="Driver")]
    public async Task<IActionResult> GetProfile_Driver()
    {
        var username = User.GetUsername();
        var appUser = await _userManager.FindByNameAsync(username);

        if (appUser == null) return Unauthorized();

        // LẤY DANH SÁCH XE CỦA USER
        var vehicles = await _uow.Vehicles.GetVehiclesByUserAsync(appUser.Id);

        var roles = await _userManager.GetRolesAsync(appUser);
        var singleRole = roles.FirstOrDefault();

        // Chuyển đổi danh sách Entity Vehicle sang DTO
        var VehicleResponseDto = vehicles.Select(v => v.ToVehicleResponseDto()).ToList();

        return Ok(new UserProfileDto
        {
            Id = appUser.Id,
            Username = username,
            Email = appUser.Email,
            Role = singleRole,
            FullName = appUser.FullName,
            Age = appUser.Age,
            Vehicles = VehicleResponseDto
        });
    }


}