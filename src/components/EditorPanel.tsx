// src/components/EditorPanel.tsx
import MonacoEditor from "@monaco-editor/react";

interface EditorPanelProps {
  title: string;
  language: "json" | "javascript";
  value: string;
  onChange: (value: string) => void;
}

const EditorPanel = ({ title, language, value, onChange }: EditorPanelProps) => {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <h4 style={{ margin: "0 0 0.5rem 0" }}>{title}</h4>
      <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: "6px", overflow: "hidden" }}>
        <MonacoEditor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={value}
          theme="vs-light"
          onChange={(value) => onChange(value || "")}
          options={{
            minimap: { enabled: false },
            formatOnType: true,
            automaticLayout: true,
            fontSize: 14,
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;
