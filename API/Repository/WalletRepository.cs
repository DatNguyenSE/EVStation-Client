using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities.Wallet;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
    public class WalletRepository : IWalletRepository
    {
        private readonly AppDbContext _context;
        public WalletRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Wallet> CreateWalletAsync(string userId)
        {
            var wallet = new Wallet
            {
                UserId = userId,
                Balance = 0
            };
            await _context.Wallets.AddAsync(wallet);
            await _context.SaveChangesAsync();
            return wallet;
        }

        public async Task<Wallet?> GetWalletByUserIdAsync(string userId)
        {
            return await _context.Wallets.Include(w => w.appUser).FirstOrDefaultAsync(w => w.UserId == userId);
        }

        public async Task<bool> UpdateWalletAsync(Wallet wallet)
        {
            _context.Wallets.Update(wallet);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}