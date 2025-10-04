using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Account;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

namespace API.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly SignInManager<AppUser> _signInManager;

        public AccountController(UserManager<AppUser> userManager, ITokenService tokenService, SignInManager<AppUser> signInManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == loginDto.Username);

            if (user == null)
            {
                return Unauthorized("Invalid username!");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
            {
                return Unauthorized("Username not found and/or password incorrect");
            }

            return Ok(
                new NewUserDto
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Email = user.Email,
                    Token = await _tokenService.CreateToken(user)
                }
            );
        }
        
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (await _userManager.FindByEmailAsync(registerDto.Email) != null)
                {
                    return BadRequest("Email already in use");
                }

                // Tạo user
                var appUser = new AppUser
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    FullName = registerDto.FullName,
                    Age = registerDto.Age
                };

                // Thêm danh sách xe
                foreach (var v in registerDto.Vehicles)
                {
                    appUser.Vehicles.Add(new Vehicle
                    {
                        Model = v.Model,
                        Type = v.Type,
                        BatteryCapacityKWh = v.BatteryCapacityKWh,
                        MaxChargingPowerKW = v.MaxChargingPowerKW,
                        ConnectorType = v.ConnectorType
                    });
                }

                // Tạo user trong Identity
                var createdUser = await _userManager.CreateAsync(appUser, registerDto.Password);

                if (!createdUser.Succeeded)
                {
                    return BadRequest(createdUser.Errors);
                }

                // Gán role mặc định
                var roleResult = await _userManager.AddToRoleAsync(appUser, "User");

                if (!roleResult.Succeeded)
                {
                    return BadRequest(roleResult.Errors);
                }

                // Trả về dữ liệu user và token
                return Ok(new NewUserDto
                {
                    Id = appUser.Id,
                    Username = appUser.UserName,
                    Email = appUser.Email,
                    Token = await _tokenService.CreateToken(appUser)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}