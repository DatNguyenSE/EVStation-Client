import { Routes } from '@angular/router';
import { authGuard } from '../core/_guards/auth.guard';
import { Home } from '../layout/home/home';
import { Notification } from '../features/notification/notification';
import { Payment } from '../features/payment/payment';
import { ServiceList } from '../features/service-list/service-list';
import { Contact } from '../layout/more-information/contact/contact';
import { Instruction } from '../layout/more-information/instruction/instruction';
import { News } from '../layout/more-information/news/news';
import { Profile } from '../features/profile/profile';
import { Login } from '../features/account/login/login';
import { GgMap } from '../features/gg-map/gg-map';
import { ConfirmEmail } from '../features/confirm-email/confirm-email';
import { RegisterVehicle } from '../features/register-vehicle/register-vehicle';
import { ChargingDashboard } from '../features/charging-dashboard/charging-dashboard';

export const routes: Routes = [
     { path: '', component: Home },
     
    {
        path: '',                               // start page
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
            { path: 'dich-vu', component: ServiceList },
            {path:'thanh-toan',component:Payment},
            {path:'thong-bao',component:Notification},
            {path:'tai-khoan',component:Profile},
            {path:'map',component: GgMap},
            {path:'dangki-xe',component:RegisterVehicle},
            {path:'thongtinsac/:id',component:ChargingDashboard}
            
        ]
    },
        {path: 'dang-nhap', component: Login},
        {path: 'lien-he',component:Contact},
        {path: 'huong-dan',component:Instruction},
        {path: 'tin-tuc',component:News},
        {path:'confirm-email',component:ConfirmEmail}

    // { path :'errors', component: TestErrors},
    // { path :'server-error', component: ServerErrorComponent},
    // { path: '**', component: NotFoundComponent},

];
