import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent {
  @Input() code: string = '';
  @Input() language: string = 'javascript';
  @Output() codeChange = new EventEmitter<string>();

  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    minimap: { enabled: true },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2
  };

  ngOnChanges(): void {
    this.editorOptions = {
      ...this.editorOptions,
      language: this.getMonacoLanguage(this.language)
    };
  }

  onCodeChange(code: string): void {
    this.codeChange.emit(code);
  }

  private getMonacoLanguage(lang: string): string {
    const languageMap: { [key: string]: string } = {
      'javascript': 'javascript',
      'python': 'python',
      'cpp': 'cpp',
      'rust': 'rust'
    };
    return languageMap[lang] || 'javascript';
  }
}
