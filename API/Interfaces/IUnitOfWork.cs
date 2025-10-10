using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Interfaces
{
    public interface IUnitOfWork
    {
        IReservationRepository Reservations { get; }
        IChargingPostRepository ChargingPosts { get; }
        IStationRepository Stations { get; }
        IVehicleRepository Vehicles { get; }
        IWalletRepository Wallets { get; }
        IWalletTransactionRepository WalletTransactions { get; }
        IChargingPackageRepository ChargingPackages { get; }
        IDriverPackageRepository DriverPackages { get; }

        // Hàm duy nhất thực hiện SaveChangesAsync cho toàn bộ DbContext
        Task<bool> Complete();
    }
}