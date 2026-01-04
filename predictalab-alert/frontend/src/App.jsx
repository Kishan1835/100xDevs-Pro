// src/App.jsx
import AppRoutes from "./routes/AppRoutes";
import { MachineDataProvider } from "./context/MachineDataContext";

export default function App() {
  return (
    <MachineDataProvider>
      <AppRoutes />
    </MachineDataProvider>
  );
}
