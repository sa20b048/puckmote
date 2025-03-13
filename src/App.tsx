import React, { useState, useEffect } from "react";

import { Device } from "./components/Device";
import { Choose } from "./components/Choose";
import { Title } from "./components/Title";

import { DeviceCommandManager } from "./components/DeviceCommandManager";


// Define a type for the Puck object
interface PuckType {
  write: (command: string) => Promise<void>;
  debug: number;
}

export const App = () => {
  const [deviceList, setDeviceList] = useState<string[]>([]);
  const [isPuckLoaded, setIsPuckLoaded] = useState(false);

  // Access the Puck object from the window object and cast it to PuckType
  const Puck = (window as any).Puck as PuckType;

  useEffect(() => {
    // Check if the script is already loaded
    if (Puck) {
      setIsPuckLoaded(true);
      return;
    }

    // Load the Puck.js script
    const script = document.createElement("script");
    script.src = "https://www.puck-js.com/puck.js";
    script.async = true;
    script.onload = () => {
      console.log("Puck.js script loaded successfully.");
      setIsPuckLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Puck.js script.");
    };
    document.body.appendChild(script);

    // Cleanup is not necessary since the script is global
  }, []);

  // Define the handler for onCommandClick
  const handleCommandClick = (pulseTimes: string) => {
    if (!Puck) {
      console.error("Puck.js is not loaded.");
      return;
    }

    console.log("Command clicked with pulse times:", pulseTimes);
    Puck.write(`Puck.IR([${pulseTimes}]);\n`);
  };

  return (
    <div className="m-5 font-mono max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8">
        <Title />
        <Choose onChoose={setDeviceList} />
      </div>

      {deviceList.map((path) => (
        <Device key={path} path={path} />
      ))}
    
      <div>
        <div>==</div>
      

        {/* Only render DeviceCommandManager if Puck.js is loaded */}
        {isPuckLoaded ? (
          <DeviceCommandManager onCommandClick={handleCommandClick} />
        ) : (
          <p>Loading Puck.js...</p>
        )}
      </div>
    </div>
  );
};