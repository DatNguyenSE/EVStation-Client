import { Routes } from '@angular/router';
import { authGuard } from '../core/_guards/auth.guard';
import { Home } from '../layout/home/home.component';
import { DichVu } from '../features/dich-vu/dich-vu';
import { ThanhToan } from '../features/thanh-toan/thanh-toan';
import { ThongBao } from '../features/thong-bao/thong-bao';

export const routes: Routes = [
     { path: '', component: Home },
    {
        path: '',                               // start page
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
            { path: 'dich-vu', component: DichVu },
            {path:'thanh-toan',component:ThanhToan},
            {path:'thong-bao',component:ThongBao},
        ]
    },

    // { path :'errors', component: TestErrors},
    // { path :'server-error', component: ServerErrorComponent},
    // { path: '**', component: NotFoundComponent},

];
