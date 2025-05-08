import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import JSONProcessor from "./components/JSONProcessor/JSONProcessor";
import styles from "./App.module.css";

const App: React.FC = () => {
  return (
    <Router>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          <Routes>
            <Route path="/json" element={<JSONProcessor />} />
            <Route path="*" element={<Navigate to="/json" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
