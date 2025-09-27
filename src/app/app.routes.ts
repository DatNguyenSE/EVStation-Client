import { Routes } from '@angular/router';
import { authGuard } from '../core/_guards/auth.guard';
import { Home } from '../layout/home/home.component';
import { DichVu } from '../features/dich-vu/dich-vu';

export const routes: Routes = [
     { path: '', component: Home },
    {
        path: '',                               // start page
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
            { path: 'dich-vu', component: DichVu }
        ]
    },

    // { path :'errors', component: TestErrors},
    // { path :'server-error', component: ServerErrorComponent},
    // { path: '**', component: NotFoundComponent},

];
