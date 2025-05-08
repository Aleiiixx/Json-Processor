import { useRef, useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { IconButton, Button, Typography } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const JSONProcessor = () => {
  const [jsonInput, setJsonInput] = useState<string>(`[\n  { "name": "aleix" }\n]`);
  const [jsBodyCode, setJsBodyCode] = useState<string>(`// Write your transformation here\nreturn data;`);
  const [output, setOutput] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const functionHeader = "const processData = (data) => {\n";
  const functionFooter = "\n}";

  const handleProcess = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      const fullCode = `${functionHeader}${jsBodyCode}${functionFooter}`;
      const func = new Function("data", `${fullCode}\nreturn processData(data);`);
      const result = func(parsedData);
      setOutput(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setOutput("⚠️ Error: " + err.message);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        padding: "2rem",
        boxSizing: "border-box",
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#121212", // más oscuro quergb(73, 64, 64)
        color: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        🛠 JSON Processor App
      </Typography>

      <div style={{ display: "flex", gap: "1rem", flex: 1, overflow: "hidden" }}>
        {/* JSON Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Typography variant="subtitle1" gutterBottom>
            JSON Input
          </Typography>
          <div style={{ flex: 1, borderRadius: "8px", overflow: "hidden", boxShadow: "0 0 8px rgba(0,0,0,0.3)" }}>
            <MonacoEditor
              height="100%"
              language="json"
              value={jsonInput}
              onChange={(value) => setJsonInput(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                formatOnType: true,
                automaticLayout: true,
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* JS Processor */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0
        }}>
          <Typography variant="subtitle1" gutterBottom>
            JS Processor
          </Typography>
          <pre style={{ margin: 0, background: "#2d2d2d", padding: "0.5rem", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>{functionHeader}</pre>
          <div style={{ flex: 1, overflow: "hidden", boxShadow: "0 0 8px rgba(0,0,0,0.3)" }}>
            <MonacoEditor
              height="100%"
              language="javascript"
              value={jsBodyCode}
              onChange={(value) => setJsBodyCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                automaticLayout: true,
                fontSize: 14,
              }}
            />
          </div>
          <pre style={{ margin: 0, background: "#2d2d2d", padding: "0.5rem", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}>{functionFooter}</pre>
        </div>
      </div>

      {/* Process Button */}
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <Button
          variant="contained"
          onClick={handleProcess}
          sx={{
            backgroundColor: "#00bcd4",
            color: "#1e1e1e",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#00acc1",
            },
          }}
        >
          Procesar JSON
        </Button>
      </div>

      {/* Output Editor */}
      <div
        ref={fullscreenRef}
        style={{
          position: "relative",
          marginTop: "1rem",
          height: isFullscreen
            ? "100%"
            : isExpanded
            ? "400px"
            : "200px",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 0 8px rgba(0,0,0,0.3)",
          transition: "height 0.3s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 2,
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
              color: "#00bcd4",
              backgroundColor: "#121212",
              borderRadius: "6px",
              "&:hover": {
                backgroundColor: "#1f1f1f",
              },
            }}
          >
            {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </IconButton>

          <IconButton
            onClick={toggleFullscreen}
            sx={{
              color: "#00bcd4",
              backgroundColor: "#121212",
              borderRadius: "6px",
              "&:hover": {
                backgroundColor: "#1f1f1f",
              },
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </div>

        <MonacoEditor
          language="json"
          value={output}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

export default JSONProcessor;
