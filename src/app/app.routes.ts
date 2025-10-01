import { Routes } from '@angular/router';
import { authGuard } from '../core/_guards/auth.guard';
import { Home } from '../layout/home/home';
import { Notification } from '../features/notification/notification';
import { Payment } from '../features/payment/payment';
import { ServiceList } from '../features/service-list/service-list';

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
        ]
    },

    // { path :'errors', component: TestErrors},
    // { path :'server-error', component: ServerErrorComponent},
    // { path: '**', component: NotFoundComponent},

];
