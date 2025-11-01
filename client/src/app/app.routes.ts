import { Routes } from '@angular/router';
import { authGuard } from '../core/_guards/auth.guard';
import { Home } from '../layout/home/home';
import { Notification } from '../features/notification/notification';
import { Payment } from '../features/payment/payment';
import { ServiceList } from '../features/service-list/service-list';
import { Contact } from '../layout/more-information/contact/contact';
import { Instruction } from '../layout/more-information/instruction/instruction';
import { News } from '../layout/more-information/news/news';
import { Profile } from '../features/driver/profile/profile';
import { Login } from '../features/account/login/login';
import { GgMap } from '../features/gg-map/gg-map';
import { ConfirmEmail } from '../features/confirm-email/confirm-email';
import { RegisterVehicle } from '../features/register-vehicle/register-vehicle';
import { ChargingDashboard } from '../features/charging-dashboard/charging-dashboard';
import { Vehicle } from '../features/vehicle/vehicle';
import { ProfileDetails } from '../features/driver/profile-details/profile-details';
import { Reservation } from '../features/reservation/reservation';
import { Event } from '../features/event/event';
import { eventResolver } from '../core/resolvers/event-resolver';
import { driverResolver } from '../features/driver/driver-resolver';
import { Transactions } from '../features/transactions/transactions';
import { Admin } from '../features/admin/admin';
import { AdminDashboard } from '../features/admin/admin-dashboard/admin-dashboard';
import { ManagerDriver } from '../features/admin/manager-driver/manager-driver';
import { ManagerStation } from '../features/admin/manager-station/manager-station';
import { Report } from '../features/admin/report/report';
import { Transaction } from '../features/admin/transaction/transaction';
import { Receipt } from '../features/receipt/receipt';
import { ReceiptDetail } from '../features/receipt-detail/receipt-detail';
import { Operator } from '../features/operator/operator';

export const routes: Routes = [
    { path: '', component: Home },

    {
        path: '',                               // start page for driver
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
            { path: 'dich-vu', component: ServiceList },
            { path: 'thanh-toan', component: Payment },
            { path: 'thong-bao', component: Notification },
            { path: 'su-kien',component: Event },
            {
                path: 'tai-khoan',
                resolve: {driver: driverResolver},
                runGuardsAndResolvers:'always',
                component: Profile,
                children: [
                    { path: '', redirectTo: 'chi-tiet', pathMatch: 'full' },
                    { path: 'chi-tiet', component: ProfileDetails }, // hồ sơ
                    { path: 'xe-cua-toi', component: Vehicle } // xe
                ]

            },
            { path: 'map', component: GgMap },
            { path: 'dangki-xe', component: RegisterVehicle },
            { path: 'thongtinsac/:idPost', component: ChargingDashboard },
            {path:'datcho',component:Reservation},
            {path:'lichsugiaodich',component:Transactions},
            {path:'bien-lai',component:Receipt},
            {path:'bien-lai/:id',component:ReceiptDetail}
        ]
    },
    {
        path: 'quan-tri-vien', component: Admin,
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard] ,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
             {path: 'dashboard',component:AdminDashboard},
             {path:'quan-ly-tai-xe',component:ManagerDriver},
             {path:'quan-ly-tram',component:ManagerStation},
             {path:'bao-cao',component:Report},
             {path:'lich-su-giao-dich',component:Transaction},
        ]
    },
    {
        path: 'nhan-vien-tram/trang-chu', component: Operator,
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard] ,
        children: [
              
        ]
    },

  

    //public routerlink
    { path: 'dang-nhap', component: Login },
    { path: 'lien-he', component: Contact },
    { path: 'huong-dan', component: Instruction },
    { path: 'tin-tuc', component: News },
    { path: 'confirm-email', component: ConfirmEmail }

    // { path :'errors', component: TestErrors},
    // { path :'server-error', component: ServerErrorComponent},
    // { path: '**', component: NotFoundComponent},

];
