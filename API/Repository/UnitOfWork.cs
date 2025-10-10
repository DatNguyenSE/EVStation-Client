using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Interfaces;

namespace API.Repository
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        private IReservationRepository _reservations;
        private IChargingPostRepository _chargingPosts;
        private IStationRepository _stations;
        private IVehicleRepository _vehicles;
        private IWalletRepository _wallets;
        private IWalletTransactionRepository _walletTransactions;
        private IChargingPackageRepository _chargingPackages;
        private IDriverPackageRepository _driverPackages;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public IReservationRepository Reservations =>
            _reservations ??= new ReservationRepository(_context);

        public IChargingPostRepository ChargingPosts =>
            _chargingPosts ??= new ChargingPostRepository(_context);

        public IStationRepository Stations =>
            _stations ??= new StationRepository(_context);

        public IVehicleRepository Vehicles =>
            _vehicles ??= new VehicleRepository(_context);

        public IWalletRepository Wallets =>
            _wallets ??= new WalletRepository(_context);

        public IWalletTransactionRepository WalletTransactions =>
            _walletTransactions ??= new WalletTransactionRepository(_context);

        public IChargingPackageRepository ChargingPackages =>
            _chargingPackages ??= new ChargingPackageRepository(_context);

        public IDriverPackageRepository DriverPackages =>
            _driverPackages ??= new DriverPackageRepository(_context);

        public async Task<bool> Complete()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}