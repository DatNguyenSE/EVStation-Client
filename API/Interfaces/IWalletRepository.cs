using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities.Wallet;

namespace API.Interfaces
{
    public interface IWalletRepository
    {
        Task<Wallet?> GetWalletByUserIdAsync(string userId);
        Task<Wallet> CreateWalletAsync(string userId);
        Task UpdateWalletAsync(Wallet wallet);
    }
}