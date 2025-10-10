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
    [Authorize(Roles = "Driver")]
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;
        // private readonly IWalletRepository _walletRepo;
        // private readonly IWalletTransactionRepository _transactionRepo;
        private readonly IUnitOfWork _uow;
        private readonly UserManager<AppUser> _userManager;


        public PaymentController(IVnPayService vnPayService, IUnitOfWork uow, UserManager<AppUser> userManager)
        {
            _vnPayService = vnPayService;
            _uow = uow;
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
            var wallet = await _uow.Wallets.GetWalletByUserIdAsync(appUser.Id);
            if (wallet == null)
            {
                wallet = await _uow.Wallets.CreateWalletAsync(appUser.Id);
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
            await _uow.WalletTransactions.AddTransactionAsync(txn);

            if (!await _uow.Complete())
            {
                throw new Exception("Lỗi hệ thống: Không thể lưu giao dịch Pending.");
            }

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
        [HttpGet("vnpay-return")]
        public async Task<IActionResult> PaymentCallback()
        {
            var response = _vnPayService.PaymentExecute(Request.Query);
            var txn = await _uow.WalletTransactions.GetByVnpTxnRefAsync(response.OrderId);
            if (txn == null)
                return NotFound("Không tìm thấy giao dịch");

            if (response.Success)
            {
                // if (txn.Status != "Success")
                // {
                //     txn.Status = "Success";
                //     await _uow.WalletTransactions.UpdateTransactionAsync(txn);

                //     var wallet = txn.Wallet;
                //     wallet.Balance += txn.Amount;
                //     await _uow.Wallets.UpdateWalletAsync(wallet);
                // }
                // return Ok(new { message = "Nạp tiền thành công", data = response });
                txn.Status = "Success";

                var wallet = txn.Wallet;
                wallet.Balance += txn.Amount;

                await _uow.WalletTransactions.UpdateTransactionAsync(txn);
                await _uow.Wallets.UpdateWalletAsync(wallet);

                var success = await _uow.Complete();
                if (!success)
                    return StatusCode(500, "Có lỗi xảy ra khi lưu thay đổi.");

                return Ok(new { message = "Nạp tiền thành công", data = response });
            }
            else
            {
                txn.Status = "Failed";
                await _uow.WalletTransactions.UpdateTransactionAsync(txn);
                await _uow.Complete();
                return BadRequest(new { message = "Thanh toán thất bại", data = response });
            }
        }
    }
}