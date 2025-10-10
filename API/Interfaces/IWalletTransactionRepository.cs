using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Entities.Wallet;

namespace API.Interfaces
{
    public interface IWalletTransactionRepository
    {
        Task AddTransactionAsync(WalletTransaction transaction);
        Task<WalletTransaction?> GetByVnpTxnRefAsync(string vnpTxnRef);
        Task UpdateTransactionAsync(WalletTransaction transaction);
        Task<IEnumerable<WalletTransaction>> GetTransactionsByWalletIdAsync(int walletId);
    }
}