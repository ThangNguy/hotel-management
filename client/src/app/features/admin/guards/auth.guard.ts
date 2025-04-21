import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

/**
 * Guard để bảo vệ các route của admin, yêu cầu người dùng phải đăng nhập
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Kiểm tra xác thực người dùng trước khi cho phép truy cập route
   * @param route ActivatedRouteSnapshot
   * @param state RouterStateSnapshot
   * @returns Observable<boolean> - true nếu được phép truy cập, false nếu không
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          this.redirectToLogin(state.url);
          return false;
        }
      })
    );
  }

  /**
   * Chuyển hướng người dùng đến trang đăng nhập với URL trở về
   * @param url URL đang cố gắng truy cập
   */
  private redirectToLogin(url: string): void {
    this.router.navigate(['/admin/login'], {
      queryParams: { returnUrl: url }
    });
  }
}