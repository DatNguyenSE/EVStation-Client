using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Entities.Vnpay;
using API.Entities.Wallet;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Roles = "User")]
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;
        private readonly IWalletRepository _walletRepo;
        private readonly IWalletTransactionRepository _transactionRepo;
        private readonly UserManager<AppUser> _userManager;


        public PaymentController(IVnPayService vnPayService, IWalletRepository walletRepo, IWalletTransactionRepository walletTransactionRepo, UserManager<AppUser> userManager)
        {
            _vnPayService = vnPayService;
            _transactionRepo = walletTransactionRepo;
            _walletRepo = walletRepo;
            _userManager = userManager;
        }

        /// <summary>
        /// Tạo URL thanh toán qua VNPAY để nạp tiền
        /// </summary>

        [HttpPost("create-payment")]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentInformationModel model)
        {
            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);
            if (appUser == null) return Unauthorized();

            // Lấy hoặc tạo ví
            var wallet = await _walletRepo.GetWalletByUserIdAsync(appUser.Id);
            if (wallet == null)
            {
                wallet = await _walletRepo.CreateWalletAsync(appUser.Id);
            }

            // Lưu transaction pending
            var txnRef = DateTime.UtcNow.Ticks.ToString();
            var txn = new WalletTransaction
            {
                WalletId = wallet.Id,
                Amount = (decimal)model.Amount,
                Description = model.OrderDescription ?? "Nap tien vao vi",
                Status = "Pending",
                PaymentMethod = "VNPAY",
                VnpTxnRef = txnRef,
                CreatedAt = DateTime.UtcNow
            };
            await _transactionRepo.AddTransactionAsync(txn);

            // Thêm thông tin orderType/Name cho VNPAY
            model.Name = username;
            model.OrderType = "other"; // model.OrderType ?? "wallet_topup";

            // Tạo URL thanh toán
            var paymentUrl = _vnPayService.CreatePaymentUrl(model, HttpContext, txnRef);
            return Ok(new { paymentUrl });
        }

        /// <summary>
        /// Callback từ VNPAY
        /// </summary>
        [AllowAnonymous]
        [HttpGet("payment-callback")]
        public async Task<IActionResult> PaymentCallback()
        {
            var response = _vnPayService.PaymentExecute(Request.Query);
            var txn = await _transactionRepo.GetByVnpTxnRefAsync(response.OrderId);
            if (txn == null)
                return NotFound("Không tìm thấy giao dịch");

            if (response.Success)
            {
                if (txn.Status != "Success")
                {
                    txn.Status = "Success";
                    await _transactionRepo.UpdateTransactionAsync(txn);

                    var wallet = txn.Wallet;
                    wallet.Balance += txn.Amount;
                    await _walletRepo.UpdateWalletAsync(wallet);
                }
                return Ok(new { message = "Nạp tiền thành công", data = response });
            }
            else
            {
                txn.Status = "Failed";
                await _transactionRepo.UpdateTransactionAsync(txn);
                return BadRequest(new { message = "Thanh toán thất bại", data = response });
            }
        }
    }
}