import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { DashboardStats, MonthlyRevenue } from '../../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    this.apiUrl = this.apiConfig.getUrl('api/reports');
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getMonthlyRevenue(months: number = 6): Observable<MonthlyRevenue[]> {
    return this.http.get<MonthlyRevenue[]>(`${this.apiUrl}/revenue-monthly`, {
      params: { months: months.toString() }
    });
  }
}
