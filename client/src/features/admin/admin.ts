import { Component, inject } from '@angular/core';
import { AccountService } from '../../core/service/account-service';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  protected accountService = inject(AccountService);
   activeTab = 'photos';
  tabs = [
    {label: 'A', value: 'sss'},
    {label: 'B', value: 'yyy'},
  ]

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
