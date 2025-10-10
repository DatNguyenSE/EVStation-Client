using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Wallet;
using API.Interfaces;

namespace API.Services
{
    public class WalletService : IWalletService
    {
        private readonly IUnitOfWork _uow;

        public WalletService(IUnitOfWork uow)
        {
            _uow = uow;
        }   
        public async Task<WalletDto?> GetWalletForUserAsync(string userId)
        {
            var wallet = await _uow.Wallets.GetWalletByUserIdAsync(userId);

            if (wallet == null)
            {
                await _uow.Wallets.CreateWalletAsync(userId);
                if (await _uow.Complete())
                {
                    wallet = await _uow.Wallets.GetWalletByUserIdAsync(userId);
                }
            }
            
            if (wallet == null) return null;

            return new WalletDto { Balance = wallet.Balance };
        }
        
        public async Task<IEnumerable<TransactionDto>> GetUserTransactionsAsync(string userId)
        {
            var wallet = await _uow.Wallets.GetWalletByUserIdAsync(userId);
            if (wallet == null)
            {
                // Tạo ví mới nếu chưa có, nhưng coi như không có giao dịch cũ
                await _uow.Wallets.CreateWalletAsync(userId);
                await _uow.Complete();
                return Enumerable.Empty<TransactionDto>();
            }

            var transactions = await _uow.WalletTransactions.GetTransactionsByWalletIdAsync(wallet.Id);
            return transactions.Select(t => new TransactionDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Description = t.Description,
                CreatedAt = t.CreatedAt,
                Status = t.Status,
                PaymentMethod = t.PaymentMethod
            });
        }

    }
}