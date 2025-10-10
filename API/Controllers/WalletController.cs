using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs.Wallet;
using API.Entities;
using API.Entities.Wallet;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;

namespace API.Controllers
{
    // [Authorize(Roles = "Driver")]
    [ApiController]
    [Route("api/wallet")]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _walletService; // SỬ DỤNG SERVICE
        private readonly UserManager<AppUser> _userManager;

        public WalletController(IWalletService walletService, UserManager<AppUser> userManager)
        {
            _walletService = walletService;
            _userManager = userManager;
        }

        // Lấy ví của user
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyWallet()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Gọi Service Layer
            var walletDto = await _walletService.GetWalletForUserAsync(userId);

            if (walletDto == null) 
            {
                // Nếu Service không thể tạo/tìm ví (lỗi DB hoặc user không tồn tại)
                return StatusCode(500, "Không thể khởi tạo hoặc tìm ví.");
            }

            return Ok(walletDto);
        }

        // Lấy lịch sử giao dịch
        [HttpGet("transactions")]
        [Authorize]
        public async Task<IActionResult> GetTransaction()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Gọi Service Layer
            var result = await _walletService.GetUserTransactionsAsync(userId);

            // Service đã xử lý việc kiểm tra ví, chỉ cần trả về kết quả
            return Ok(result);
        }
    }
}