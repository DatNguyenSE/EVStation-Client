using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using API.DTOs.Account;
using API.DTOs.Email;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Identity.Client;
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
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AccountController> _logger;

        public AccountController(UserManager<AppUser> userManager, ITokenService tokenService,
                                SignInManager<AppUser> signInManager, IEmailService emailService,
                                IConfiguration configuration, ILogger<AccountController> logger)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signInManager;
            _emailService = emailService;
            _logger = logger;
            _configuration = configuration;
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

                // Tạo token xác nhận email
                var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(appUser);
                // Encode token để truyền qua URL
                var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(emailToken));
                // Lấy base URL từ configuration hoặc từ request
                var baseUrl = _configuration["AppSettings:BaseUrl"] ?? $"{Request.Scheme}://{Request.Host}";

                // Tạo link xác nhận email
                var confirmationLink = $"{baseUrl}/api/account/confirm-email?userId={appUser.Id}&token={encodedToken}";

                // Gửi email xác nhận
                try
                {
                    await _emailService.SendEmailConfirmationAsync(appUser.Email, confirmationLink);
                    
                    _logger.LogInformation($"Email confirmation sent to {appUser.Email}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send confirmation email to {appUser.Email}");
                    
                    // Xóa user nếu không gửi được email (tùy chọn)
                    await _userManager.DeleteAsync(appUser);
                    return StatusCode(500, new { message = "Failed to send confirmation email. Please try again." });
                    
                    // Hoặc cho phép user tồn tại nhưng báo lỗi
                    // return Ok(new
                    // {
                    //     message = "User created successfully but failed to send confirmation email. Please use resend confirmation endpoint.",
                    //     user = new
                    //     {
                    //         id = appUser.Id,
                    //         username = appUser.UserName,
                    //         email = appUser.Email,
                    //         emailConfirmed = false
                    //     }
                    // });
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

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "Invalid confirmation link" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Kiểm tra xem email đã được xác nhận chưa
            if (user.EmailConfirmed)
            {
                return Ok(new { message = "Email already confirmed. You can login now." });
            }

            // Decode token
            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));

            // Xác nhận email
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (result.Succeeded)
            {
                _logger.LogInformation($"Email confirmed for user {user.Email}");
                
                return Ok(new
                {
                    message = "Email confirmed successfully. You can now login.",
                    user = new
                    {
                        id = user.Id,
                        username = user.UserName,
                        email = user.Email,
                        emailConfirmed = true
                    }
                });
            }

            return BadRequest(new
            {
                message = "Error confirming email",
                errors = result.Errors
            });
        }

        [HttpPost("resend-confirmation")]
        public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmationDto dto)
        {
            if (string.IsNullOrEmpty(dto.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                // Không tiết lộ thông tin user có tồn tại hay không (bảo mật)
                return Ok(new { message = "If the email exists, a confirmation link has been sent." });
            }

            if (user.EmailConfirmed)
            {
                return BadRequest(new { message = "Email already confirmed" });
            }

            // Tạo token mới
            var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(emailToken));

            var baseUrl = _configuration["AppSettings:BaseUrl"] ?? $"{Request.Scheme}://{Request.Host}";
            var confirmationLink = $"{baseUrl}/api/account/confirm-email?userId={user.Id}&token={encodedToken}";

            try
            {
                await _emailService.SendEmailConfirmationAsync(user.Email, confirmationLink);
                
                _logger.LogInformation($"Confirmation email resent to {user.Email}");
                
                return Ok(new { message = "Confirmation email has been resent. Please check your inbox." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to resend confirmation email to {user.Email}");
                return StatusCode(500, new { message = "Failed to send confirmation email. Please try again later." });
            }
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);

            if (appUser == null) return Unauthorized();

            var email = appUser.Email;
            var age = appUser.Age;
            var fullName = appUser.FullName;

            return Ok(new UserProfileDto
            {
                Username = username,
                Email = email,
                FullName = fullName,
                Age = age
            });
        }
    }
}