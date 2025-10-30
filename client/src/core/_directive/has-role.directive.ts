import { Directive, effect, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../service/account-service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  @Input() appHasRole: string[] = [];

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private accountService: AccountService
  ) { //inside contructor
    effect(() => {
      const acc = this.accountService.currentAccount();

      if (!acc?.roles) {
        // clear view nếu chưa đăng nhập hoặc roles trống
        this.viewContainerRef.clear();
        return;
      }

      // nếu acc có role khớp với danh sách input
      //Khi role khớp lần đầu → length = 0 → tạo view
      //Các lần sau signal thay đổi → length > 0 → không tạo thêm view
      if (acc.roles.some(r => this.appHasRole.includes(r))) {
        if (this.viewContainerRef.length === 0) {
          this.viewContainerRef.createEmbeddedView(this.templateRef);
        }
      } else {
        this.viewContainerRef.clear();
      }
    });
  }
}
