import { Component } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  code = '// Write your code here\n';
  language: 'javascript' | 'python' | 'cpp' | 'rust' = 'javascript';
  submissionId: string | null = null;

  constructor(private apiService: ApiService) {}

  onCodeChange(code: string): void {
    this.code = code;
  }

  onLanguageChange(language: 'javascript' | 'python' | 'cpp' | 'rust'): void {
    this.language = language;
  }

  async submitCode(): Promise<void> {
    try {
      const response = await this.apiService.submitCode({
        code: this.code,
        language: this.language,
        problemId: 'demo-problem',
        userId: 'demo-user',
        isCustomTest: false
      });
      
      this.submissionId = response.submissionId;
    } catch (error) {
      console.error('Submission failed:', error);
    }
  }
}
