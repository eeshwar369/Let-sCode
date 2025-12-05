import React from 'react';
import Editor from '@monaco-editor/react';
import { SupportedLanguage } from '@letscode/shared';

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onChange: (value: string) => void;
}

const languageMap: Record<SupportedLanguage, string> = {
  javascript: 'javascript',
  python: 'python',
  cpp: 'cpp',
  rust: 'rust',
};

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, onChange }) => {
  return (
    <Editor
      height="100%"
      language={languageMap[language]}
      value={code}
      onChange={(value) => onChange(value || '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
      }}
    />
  );
};

export default CodeEditor;
