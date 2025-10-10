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
    public class WalletTransactionRepository : IWalletTransactionRepository
    {
        private readonly AppDbContext _context;
        public WalletTransactionRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddTransactionAsync(WalletTransaction transaction)
        {
            await _context.WalletTransactions.AddAsync(transaction);
        }

        public async Task<WalletTransaction?> GetByVnpTxnRefAsync(string vnpTxnRef)
        {
            return await _context.WalletTransactions.Include(t => t.Wallet).FirstOrDefaultAsync(t => t.VnpTxnRef == vnpTxnRef);
        }

        public async Task<IEnumerable<WalletTransaction>> GetTransactionsByWalletIdAsync(int walletId)
        {
            return await _context.WalletTransactions
                .Where(t => t.WalletId == walletId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task UpdateTransactionAsync(WalletTransaction transaction)
        {
            _context.WalletTransactions.Update(transaction);
        }
    }
}