import { Component, inject, signal } from '@angular/core';
import { Nav } from "../layout/nav/nav";
import { Footer } from "../layout/footer/footer";
import { Router, RouterOutlet } from '@angular/router';
import { AccountService } from '../core/service/account-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Nav, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected router = inject(Router);
}
