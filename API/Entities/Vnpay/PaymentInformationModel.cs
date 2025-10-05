using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities.Vnpay
{
    public class PaymentInformationModel
    {
        public string OrderType { get; set; } = "other";
        public decimal Amount { get; set; }
        public string OrderDescription { get; set; } = "Nap tien vao vi";
        public string? Name { get; set; }
        public string? TxnRef { get; set; } 
    }
}