// Versión extendida con guardado, carga y listado desde Cloudflare Worker
import { useRef, useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { IconButton, Button, Typography, TextField, Box, Dialog, DialogTitle, DialogContent, Collapse, useTheme } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteIcon from "@mui/icons-material/Delete";
import Autocomplete from "@mui/material/Autocomplete";
import { toast } from "react-toastify";


const WORKER_URL = "https://my-worker.aleixrosellmorell.workers.dev/";

const JSONProcessor = () => {
  const [jsonInput, setJsonInput] = useState<string>(`[\n  { "name": "aleix" }\n]`);
  const [jsBodyCode, setJsBodyCode] = useState<string>(`// Write your transformation here\nreturn data;`);
  const [output, setOutput] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [folder, setFolder] = useState("");
  const [name, setName] = useState("");
  const [scriptsList, setScriptsList] = useState<Record<string, string[]>>({});
  const [showDialog, setShowDialog] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

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
      setOutput("\u26a0\ufe0f Error: " + err.message);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const saveScript = async () => {
    if (!folder || !name) return alert("Indique carpeta y nombre del script");
    await fetch(`${WORKER_URL}?folder=${folder}&name=${name}`, {
      method: "POST",
      body: jsBodyCode,
    });
    await fetchScriptList();
    toast.success("Script guardado con éxito");
    setFolder("");
    setName("");
  };


  const loadScript = async (f: string, n: string) => {
    const res = await fetch(`${WORKER_URL}?folder=${f}&name=${n}`);
    const code = await res.text();
    setJsBodyCode(code);
    setShowDialog(false);
  };

  const fetchScriptList = async () => {
    const res = await fetch(`${WORKER_URL}list`); // debes implementar este endpoint en tu Worker
    const json = await res.json();
    setScriptsList(json);
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const deleteScript = async (f: string, n: string) => {
    const confirmDelete = window.confirm(`¿Eliminar el script "${n}" de la carpeta "${f}"?`);
    if (!confirmDelete) return;

    await fetch(`${WORKER_URL}?folder=${f}&name=${n}`, {
      method: "DELETE",
    });
    fetchScriptList();
  };

  useEffect(() => {
    fetchScriptList();
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", padding: "2rem", boxSizing: "border-box", fontFamily: "Segoe UI, sans-serif", backgroundColor: "#121212", color: "#f5f5f5", display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" align="center" gutterBottom>🛠 JSON Processor App</Typography>

      <Box
        display="flex"
        gap={2}
        mb={2}
        justifyContent="flex-end"
        alignItems="center"
      >
        <Box sx={{ width: 240 }}>
          <Autocomplete
            freeSolo
            options={Object.keys(scriptsList)}
            value={folder}
            onInputChange={(_, newValue) => setFolder(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Carpeta"
                size="small"
                sx={{
                  "& label": { color: "#f5f5f5" },
                  "& .MuiInputBase-root": {
                    color: "#ffffff",
                    backgroundColor: "#1e1e1e",
                    border: "1px solid #555",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                }}
              />
            )}
          />
        </Box>
        <TextField
          label="Nombre del script"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
          InputLabelProps={{ style: { color: "#f5f5f5" } }}
          InputProps={{
            style: {
              color: "#ffffff",
              backgroundColor: "#1e1e1e",
              border: "1px solid #555",
            },
          }}
        />
        <Button onClick={saveScript} variant="outlined" color="info">
          Guardar
        </Button>
        <Button
          onClick={() => {
            setShowDialog(true);
            fetchScriptList();
          }}
          variant="outlined"
          color="warning"
        >
          Load Script
        </Button>
      </Box>


      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            style: {
              backgroundColor: "#1e1e1e",
              color: "#f5f5f5",
            },
          },
        }}
      >
        <DialogTitle style={{ backgroundColor: "#121212", color: "#00bcd4", padding: "16px" }}>
          📂 Scripts Guardados
        </DialogTitle>
        <DialogContent
          dividers
          style={{ backgroundColor: "#1e1e1e", paddingTop: "8px", paddingBottom: "8px" }}
        >
          {Object.entries(scriptsList).map(([f, scripts]) => (
            <Box key={f} style={{ marginTop: "16px" }}>
              <Button
                fullWidth
                onClick={() => toggleFolder(f)}
                endIcon={expandedFolders[f] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                style={{
                  justifyContent: "space-between",
                  color: "#00bcd4",
                  textTransform: "none",
                  backgroundColor: "#2a2a2a",
                  borderRadius: "4px",
                  padding: "8px",
                  marginBottom: "4px",
                }}
              >
                {f}
              </Button>
              <Collapse in={expandedFolders[f]}>
                <Box style={{ paddingLeft: "16px" }}>
                  {scripts.map((s) => (
                    <Box
                      key={s}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Button
                        onClick={() => loadScript(f, s)}
                        style={{
                          textTransform: "none",
                          color: "#80deea",
                          justifyContent: "flex-start",
                          width: "100%",
                          paddingLeft: "12px",
                        }}
                      >
                        {s}
                      </Button>
                      <IconButton
                        onClick={() => deleteScript(f, s)}
                        style={{ color: "#f44336" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          ))}
        </DialogContent>
      </Dialog>


      <div style={{ display: "flex", gap: "1rem", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Typography variant="subtitle1" gutterBottom>JSON Input</Typography>
          <div style={{ flex: 1, borderRadius: "8px", overflow: "hidden", boxShadow: "0 0 8px rgba(0,0,0,0.3)" }}>
            <MonacoEditor
              height="100%"
              language="json"
              value={jsonInput}
              onChange={(value) => setJsonInput(value || "")}
              theme="vs-dark"
              options={{ minimap: { enabled: false }, formatOnType: true, automaticLayout: true, fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <Typography variant="subtitle1" gutterBottom>JS Processor</Typography>
          <pre style={{ margin: 0, background: "#2d2d2d", padding: "0.5rem", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>{functionHeader}</pre>
          <div style={{ flex: 1, overflow: "hidden", boxShadow: "0 0 8px rgba(0,0,0,0.3)" }}>
            <MonacoEditor
              height="100%"
              language="javascript"
              value={jsBodyCode}
              onChange={(value) => setJsBodyCode(value || "")}
              theme="vs-dark"
              options={{ minimap: { enabled: false }, automaticLayout: true, fontSize: 14 }}
            />
          </div>
          <pre style={{ margin: 0, background: "#2d2d2d", padding: "0.5rem", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}>{functionFooter}</pre>
        </div>
      </div>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <Button variant="contained" onClick={handleProcess} sx={{ backgroundColor: "#00bcd4", color: "#1e1e1e", fontWeight: "bold", "&:hover": { backgroundColor: "#00acc1" } }}>
          Procesar JSON
        </Button>
      </div>

      <div ref={fullscreenRef} style={{ position: "relative", marginTop: "1rem", height: isFullscreen ? "100%" : isExpanded ? "400px" : "200px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 0 8px rgba(0,0,0,0.3)", transition: "height 0.3s ease" }}>
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2, display: "flex", gap: "0.5rem" }}>
          <IconButton onClick={() => setIsExpanded(!isExpanded)} sx={{ color: "#00bcd4", backgroundColor: "#121212", borderRadius: "6px", "&:hover": { backgroundColor: "#1f1f1f" } }}>
            {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          </IconButton>
          <IconButton onClick={toggleFullscreen} sx={{ color: "#00bcd4", backgroundColor: "#121212", borderRadius: "6px", "&:hover": { backgroundColor: "#1f1f1f" } }}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </div>
        <MonacoEditor
          language="json"
          value={output}
          theme="vs-dark"
          options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
        />
      </div>
    </div>
  );
};

export default JSONProcessor;