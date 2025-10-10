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
            
            // Tìm user theo username
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.UserName == loginDto.Username);

            if (user == null)
            {
                return Unauthorized("Tên đăng nhập không hợp lệ.");
            }

            // Kiểm tra đã xác thực email chưa
            if (!user.EmailConfirmed)
            {
                return Unauthorized("Bạn cần xác thực email trước khi đăng nhập.");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (!result.Succeeded)
            {
                return Unauthorized("Tên đăng nhập hoặc mật khẩu không chính xác.");
            }

            return Ok(
                new NewUserDto
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Email = user.Email,
                    Token = await _tokenService.CreateToken(user),
                    EmailConfirmed = user.EmailConfirmed
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

                // Kiểm tra username đã tồn tại chưa
                var existingUserByUsername = await _userManager.FindByNameAsync(registerDto.Username);
                if (existingUserByUsername != null)
                {
                    if (!existingUserByUsername.EmailConfirmed)
                    {
                        // Xóa user cũ chưa xác thực
                        await _userManager.DeleteAsync(existingUserByUsername);
                    }
                    else
                    {
                        return BadRequest("Tên đăng nhập đã được sử dụng");
                    }
                }

                // Kiểm tra email đã tồn tại chưa
                var existingUserByEmail = await _userManager.FindByEmailAsync(registerDto.Email);
                if (existingUserByEmail != null)
                {
                    if (!existingUserByEmail.EmailConfirmed)
                    {
                        // Xóa user cũ chưa xác thực
                        await _userManager.DeleteAsync(existingUserByEmail);
                    }
                    else
                    {
                        return BadRequest("Email đã được sử dụng");
                    }
                }

                // Tạo user
                var appUser = new AppUser
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    FullName = registerDto.FullName,
                    Age = registerDto.Age
                }; 

                // Tạo user trong Identity
                var createdUser = await _userManager.CreateAsync(appUser, registerDto.Password);

                if (!createdUser.Succeeded)
                {
                    return BadRequest(createdUser.Errors);
                }

                // Gán role mặc định
                var roleResult = await _userManager.AddToRoleAsync(appUser, "Driver");

                if (!roleResult.Succeeded)
                {
                    return BadRequest(roleResult.Errors);
                }
                // url FE
                var frontendUrl = "http://localhost:4200";
                // Tạo token xác nhận email
                var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(appUser);
                // Encode token để truyền qua URL
                var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(emailToken));
                // Lấy base URL từ configuration hoặc từ request
                // var baseUrl = _configuration["AppSettings:BaseUrl"] ?? $"{Request.Scheme}://{Request.Host}";

                // Tạo link xác nhận email
                var confirmationLink = $"{frontendUrl}/api/account/confirm-email?userId={appUser.Id}&token={encodedToken}";
              

                // Gửi email xác nhận
                try
                {
                    await _emailService.SendEmailConfirmationAsync(appUser.Email, appUser.Id , encodedToken);
                    
                    _logger.LogInformation($"Email confirmation sent to {appUser.Email}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Failed to send confirmation email to {appUser.Email}");
                    
                    // Xóa user nếu không gửi được email 
                    await _userManager.DeleteAsync(appUser);
                    return StatusCode(500, new { message = "Không gửi được email xác nhận. Vui lòng thử lại." });
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
                return BadRequest(new { message = "Liên kết xác nhận không hợp lệ" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }

            // Kiểm tra xem email đã được xác nhận chưa
            if (user.EmailConfirmed)
            {
                return Ok(new { message = "Email đã được xác nhận. Bạn có thể đăng nhập ngay." });
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
                    message = "Email đã được xác nhận. Bạn có thể đăng nhập ngay.",
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
                message = "Lỗi xác nhận email",
                errors = result.Errors
            });
        }

        [HttpPost("resend-confirmation")]
        public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmationDto dto)
        {
            if (string.IsNullOrEmpty(dto.Email))
            {
                return BadRequest(new { message = "Email là bắt buộc" });
            }

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                // Không tiết lộ thông tin user có tồn tại hay không (bảo mật)
                return Ok(new { message = "Nếu email tồn tại, liên kết xác nhận đã được gửi." });
            }

            if (user.EmailConfirmed)
            {
                return BadRequest(new { message = "Email đã xác thực" });
            }

            // Tạo token mới
            var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(emailToken));
            var frontendUrl = "http://localhost:4200";
            var baseUrl = _configuration["AppSettings:BaseUrl"] ?? $"{Request.Scheme}://{Request.Host}";
            var confirmationLink = $"{frontendUrl}/api/account/confirm-email?userId={user.Id}&token={encodedToken}";
        

            try
            {
                await _emailService.SendEmailConfirmationAsync(user.Email, user.Id,encodedToken);
                
                _logger.LogInformation($"Confirmation email resent to {user.Email}");
                
                return Ok(new { message = "Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư đến của bạn." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to resend confirmation email to {user.Email}");
                return StatusCode(500, new { message = "Không gửi được email xác nhận. Vui lòng thử lại sau." });
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