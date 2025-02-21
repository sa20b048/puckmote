import React, { useState } from "react";
import  IRPulseManager  from "./components/IRPulseManager";
import { Device } from "./components/Device";
import { Choose } from "./components/Choose";
import { Title } from "./components/Title";
import BluetoothConnection from "./components/BluetoothConnection";
export const App = () => {
  const [deviceList, setDeviceList] = useState<string[]>([]);

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
     
    
    </div>
    
     <BluetoothConnection/>
      <IRPulseManager />  {/* Using the IRPulseManager here */}
    </div>
  );
};