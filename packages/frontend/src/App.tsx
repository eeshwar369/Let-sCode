import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import SubmissionPanel from './components/SubmissionPanel';
import { SupportedLanguage } from '@letscode/shared';
import './App.css';

function App() {
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemId: 'demo-problem',
          userId: 'demo-user',
          isCustomTest: false,
        }),
      });

      const data = await response.json();
      setSubmissionId(data.submissionId);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Let'sCode Execution Engine</h1>
        <p>Innovative code execution with client-side, serverless, and hybrid strategies</p>
      </header>

      <div className="app-content">
        <div className="editor-section">
          <div className="editor-controls">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="language-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="rust">Rust</option>
            </select>

            <button onClick={handleSubmit} className="submit-button">
              Submit Code
            </button>
          </div>

          <CodeEditor
            code={code}
            language={language}
            onChange={setCode}
          />
        </div>

        <div className="results-section">
          <SubmissionPanel submissionId={submissionId} />
        </div>
      </div>
    </div>
  );
}

export default App;
