using System;
using System.Collections.Generic;
using System.Linq;
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
        private readonly IWalletRepository _walletRepo;
        private readonly IWalletTransactionRepository _walletTransactionRepo;
        private readonly UserManager<AppUser> _userManager;
        public WalletController(IWalletRepository walletRepo, UserManager<AppUser> userManager, IWalletTransactionRepository walletTransactionRepository)
        {
            _walletRepo = walletRepo;
            _userManager = userManager;
            _walletTransactionRepo = walletTransactionRepository;
        }

        // Lấy ví của user
        [HttpGet("my")]
        public async Task<IActionResult> GetMyWallet()
        {
            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);
            if (appUser == null) return Unauthorized();

            var wallet = await _walletRepo.GetWalletByUserIdAsync(appUser.Id);
            if (wallet == null)
            {
                wallet = await _walletRepo.CreateWalletAsync(appUser.Id);
            }

            return Ok(new WalletDto
            {
                Balance = wallet.Balance
            });
        }

        // Lấy lịch sử giao dịch
        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransaction()
        {
            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);
            if (appUser == null) return Unauthorized();

            var wallet = await _walletRepo.GetWalletByUserIdAsync(appUser.Id);
            if (wallet == null) return NotFound("Chưa có ví");

            var transactions = await _walletTransactionRepo.GetTransactionsByWalletIdAsync(wallet.Id);

            var result = transactions.Select(t => new TransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Description = t.Description,
                CreatedAt = t.CreatedAt,
                Status = t.Status,
                PaymentMethod = t.PaymentMethod
            });

            return Ok(result);
        }
    }
}