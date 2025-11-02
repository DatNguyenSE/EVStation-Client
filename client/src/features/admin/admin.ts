import { Component, inject } from '@angular/core';
import { AccountService } from '../../core/service/account-service';
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  protected accountService = inject(AccountService);
  private router = inject(Router);
    isRootAdminPage = true;
   activeTab = 'photos';
  tabs = [
    {label: 'A', value: 'sss'},
    {label: 'B', value: 'yyy'},
  ]
  
  setTab(tab: string) {
    this.activeTab = tab;
  }
}
