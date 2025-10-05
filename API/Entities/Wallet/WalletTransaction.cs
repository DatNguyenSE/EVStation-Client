using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities.Wallet
{
    public class WalletTransaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WalletId { get; set; }
        public Wallet Wallet { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string Status { get; set; } = "Pending";
        public string? PaymentMethod { get; set; }
        public string? VnpTxnRef { get; set; }
    }
}