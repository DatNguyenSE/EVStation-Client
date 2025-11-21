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
import { ManagerDriver } from '../features/admin/manager-driver/manager-driver';
import { ManagerStation } from '../features/admin/manager-station/manager-station';
import { Report } from '../features/admin/report/report';
import { Transaction } from '../features/admin/transaction/transaction';
import { Receipt } from '../features/receipt/receipt';
import { ReceiptDetail } from '../features/receipt/receipt-detail/receipt-detail';
import { Operator } from '../features/operator/operator';
import { ReceiptAdmin } from '../features/admin/receipt/receipt';
import { ReceiptDetailAdmin } from '../features/admin/receipt/receipt-detail/receipt-detail';
import QRCode from '@zxing/library/esm/core/qrcode/encoder/QRCode';
import { QrCodeComponent } from '../features/qr-code/qr-code';
import { ReceiptPending } from '../features/operator/receipt-pending/receipt-pending';
import { chargingGuard } from '../core/_guards/charging.guard';
import { SessionDetail } from '../features/session-detail/session-detail';
import { PricingConfig } from '../features/admin/pricing-config/pricing-config';
import { OpReport } from '../features/operator/op-report/op-report';
import { Technicain } from '../features/technicain/technicain';
import { Manager } from '../features/manager/manager';
import { Assignment } from '../features/admin/assignment/assignment';
import { GuestRegisterComponent } from '../features/guest-register/guest-register'; // Check đường dẫn
import { adminGuard } from '../core/_guards/admin-guard';
import { ReceiptManager } from '../features/manager/receipt/receipt';
import { ReceipDetailManager } from '../features/manager/receip-detail-manager/receip-detail-manager';
import { ManagerTopup } from '../features/manager/manager-topup/manager-topup';


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
            {path:'datcho',component:Reservation},
            {path:'lichsugiaodich',component:Transactions},
            {path:'bien-lai',component:Receipt},
            {path:'bien-lai/:id',component:ReceiptDetail},
            {path:'phien-sac/:id',component:SessionDetail},
        ]
    },
    {
        path: 'quan-tri-vien',
        runGuardsAndResolvers: 'always',
        canActivate: [adminGuard] ,
        children: [
            { path: '', redirectTo: 'trang-chu', pathMatch: 'full' },
            { path: 'trang-chu', component: Admin },
             {path:'quan-ly-tai-xe',component:ManagerDriver},
             {path:'quan-ly-tram',component:ManagerStation},
             {path:'bao-cao',component:Report},
             {path:'lich-su-giao-dich',component:Transaction},
             {path:'quan-ly-gia-tien-va-goi',component:PricingConfig},
             {path:'bien-lai',component:ReceiptAdmin},
             {path:'bien-lai/:id',component:ReceiptDetailAdmin},
             { path: 'thong-bao', component: Notification },
             {path:'phan-tram',component:Assignment},
        ]
    },
    {
        path: 'nhan-vien-tram',
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard] ,
        children: [
            { path: '', redirectTo: 'trang-chu', pathMatch: 'full' },
            { path: 'trang-chu', component: Operator },
            { path:'bien-lai', component: ReceiptPending },
            { path: 'thong-bao', component: Notification },
            {path:'bao-cao',component:OpReport}
        ]
    },
     {
        path: 'nhan-vien-ky-thuat',
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard] ,
        children: [
            { path: '', redirectTo: 'cong-viec', pathMatch: 'full' },
            { path: 'cong-viec', component: Technicain },
            { path: 'thong-bao', component: Notification },
            {path:'bao-cao',component:OpReport}
        ]
    },
    {
        path: 'quan-ly-tram',
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard] ,
        children: [
            { path: '', redirectTo: 'trang-chu', pathMatch: 'full' },
            { path: 'trang-chu', component: Manager },
            //  {path:'quan-ly-nhan-vien',component:OpReport},
            { path:'bien-lai', component: ReceiptManager },
            { path: 'thong-bao', component: Notification },
            {path:'bao-cao', component: OpReport},
            {path:'bien-lai/:id', component: ReceipDetailManager},
            {path:'nap-tien', component: ManagerTopup},
        ]
    },

  

    //public routerlink
    { path: 'dang-nhap', component: Login },
    { path: 'lien-he', component: Contact },
    { path: 'huong-dan', component: Instruction },
    { path: 'tin-tuc', component: News },
    { path: 'confirm-email', component: ConfirmEmail },
    { path:'quet-ma',component: QrCodeComponent},
    { path: 'auth/register-guest', component: GuestRegisterComponent },
    { 
        path: 'thongtinsac/:idPost',
        component: ChargingDashboard,
        canActivate: [chargingGuard]
    },
    // { path :'errors', component: TestErrors},
    // { path :'server-error', component: ServerErrorComponent},
    // { path: '**', component: NotFoundComponent},

];
