import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  async submitCode(request: {
    code: string;
    language: string;
    problemId: string;
    userId: string;
    isCustomTest: boolean;
  }): Promise<{ submissionId: string }> {
    return firstValueFrom(
      this.http.post<{ submissionId: string }>(`${this.apiUrl}/submit`, request)
    );
  }

  getSubmission(id: string) {
    return this.http.get<any>(`${this.apiUrl}/submission/${id}`);
  }

  async runCustomTest(code: string, input: string, language: string): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/test`, { code, input, language })
    );
  }
}
