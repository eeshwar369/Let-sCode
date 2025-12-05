import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';

interface Submission {
  id: string;
  status: string;
  language: string;
  executionStrategy: {
    type: string;
  };
  verdict?: {
    status: string;
    passedTests: number;
    totalTests: number;
    maxTime: number;
    maxMemory: number;
  };
  testResults?: Array<{
    testCaseNumber: number;
    passed: boolean;
    verdict: string;
    executionTime: number;
    memoryUsed: number;
    error?: string;
  }>;
}

@Component({
  selector: 'app-submission-panel',
  templateUrl: './submission-panel.component.html',
  styleUrls: ['./submission-panel.component.css']
})
export class SubmissionPanelComponent implements OnInit, OnDestroy {
  @Input() submissionId: string | null = null;
  
  submission: Submission | null = null;
  loading = false;
  error: string | null = null;
  private pollSubscription?: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (this.submissionId) {
      this.startPolling();
    }
  }

  ngOnChanges(): void {
    if (this.submissionId) {
      this.startPolling();
    } else {
      this.stopPolling();
      this.submission = null;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.stopPolling();
    this.loading = true;
    this.error = null;

    this.pollSubscription = interval(2000)
      .pipe(
        switchMap(() => this.apiService.getSubmission(this.submissionId!))
      )
      .subscribe({
        next: (submission) => {
          this.submission = submission;
          this.loading = false;
          
          if (submission.status === 'Completed' || submission.status === 'Failed') {
            this.stopPolling();
          }
        },
        error: (err) => {
          this.error = err.message || 'Failed to fetch submission';
          this.loading = false;
          this.stopPolling();
        }
      });
  }

  private stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  formatMemory(bytes: number): string {
    return (bytes / 1024 / 1024).toFixed(2) + 'MB';
  }
}
