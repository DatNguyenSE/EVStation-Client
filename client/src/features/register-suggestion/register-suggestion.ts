import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-suggestion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-suggestion.html'
})
export class RegisterSuggestionComponent {
  @Input() plate: string = '';
  @Output() close = new EventEmitter<void>();

  constructor(private router: Router) {}

  onRegister() {
    // Điều hướng sang trang đăng ký, có thể mang theo queryParams biển số xe
    this.router.navigate(['/auth/register-guest'], { queryParams: { plate: this.plate } });

  }

  onClose() {
    this.close.emit(); // Báo cho component cha biết để redirect về home
  }
}