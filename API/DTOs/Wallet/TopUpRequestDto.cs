using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.Wallet
{
    public class TopUpRequestDto
    {
        [Range(0, Int32.MaxValue ,ErrorMessage = "Số tiền phải lớn hơn 0")]
        public decimal Amount { get; set; }
    }
}