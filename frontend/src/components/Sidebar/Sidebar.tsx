import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import CodeIcon from "@mui/icons-material/Code"; // Icono para JSON Processor
// Puedes importar más íconos según las herramientas que tengas

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.expanded : styles.collapsed}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <ul>
        <li className={location.pathname === "/json" ? styles.active : ""}>
          <Link to="/json">
            <CodeIcon className={styles.icon} />
            {isOpen && <span className={styles.text}>JSON Processor</span>}
          </Link>
        </li>
        {/* Añadir más herramientas aquí */}
      </ul>
    </div>
  );
};

export default Sidebar;
