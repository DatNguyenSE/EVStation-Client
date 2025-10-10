using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Wallet;

namespace API.Interfaces
{
    public interface IWalletService
    {
        Task<WalletDto?> GetWalletForUserAsync(string userId);
        Task<IEnumerable<TransactionDto>> GetUserTransactionsAsync(string userId);
    }
}