using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Entities.Vnpay;

namespace API.Interfaces
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(PaymentInformationModel model, HttpContext context, string txnRef);
        PaymentResponseModel PaymentExecute(IQueryCollection collections);
    }
}