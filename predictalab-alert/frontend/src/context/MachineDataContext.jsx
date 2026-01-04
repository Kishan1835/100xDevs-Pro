import React, { createContext, useContext, useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";

const MachineDataContext = createContext();

export const useMachineData = () => {
  const context = useContext(MachineDataContext);
  if (!context) {
    throw new Error("useMachineData must be used within MachineDataProvider");
  }
  return context;
};

export const MachineDataProvider = ({ children }) => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const predictionsRef = ref(database, 'predictions');
    
    const unsubscribe = onValue(predictionsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Firebase Raw Data:", data);
          
          const machineArray = Object.entries(data).map(([machineId, machineData]) => {
            const latest = machineData.latest || {};
            
            return {
              id: machineId,
              machine_id: machineId,
              machine_type: latest.machine_type || "Unknown",
              current: latest.current || "N/A",
              temperature: latest.temperature || "N/A",
              vibration: latest.vibration || "N/A",
              prediction_label: latest.prediction_label || "Unknown",
              explanation: latest.explanation || "",
              probability: latest.probability || 0,
              timestamp: latest.timestamp || latest.prediction_time || new Date().toISOString(),
            };
          });
          
          console.log("Parsed Machines:", machineArray);
          setMachines(machineArray);
        } else {
          console.log("No data available in Firebase");
          setMachines([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Firebase Data Parse Error:", err);
        setLoading(false);
      }
    }, (error) => {
      console.error("Firebase Read Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <MachineDataContext.Provider value={{ machines, loading }}>
      {children}
    </MachineDataContext.Provider>
  );
};
