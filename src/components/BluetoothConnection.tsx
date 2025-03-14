//import state hook for react
import React, { FC, useEffect, useRef, useState } from "react";
//
import { FaRegCopy, FaCheck } from 'react-icons/fa';
//
const Puck = (window as any).Puck;
Puck.debug = 3;
//react jsx elements
const BluetoothConnection = () => {
  const [puckDevice, setPuckDevice] = useState(null);
  const [gattServer, setGattServer] = useState(null);
  const [txCharacteristic, setTxCharacteristic] = useState(null);
  const [rxCharacteristic, setRxCharacteristic] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState('');

  //interface
  interface BluetoothConnectionProps {
    onCommandClick: (pulseTimes: string) => void;
  }

  //Connect to Puck BLE
  const connectToPuck = async () => {
    try {
      // Request the device with UART service
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
      });


      console.log('Connecting to GATT server...');
      const server = await device.gatt.connect();


      console.log('Getting UART service...');
      const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');


      console.log('Getting characteristics...');
      const tx = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
      const rx = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');


      // Enable notifications on the RX characteristic
      rx.addEventListener('characteristicvaluechanged', handleNotifications);
      await rx.startNotifications();


      setPuckDevice(device);
      setGattServer(server);
      setTxCharacteristic(tx);
      setRxCharacteristic(rx);
      setIsConnected(true);


      console.log('Connected to Puck.js');
    } catch (error) {
      console.error('Failed to connect to Puck.js:', error);
    }
  };
  //
  //Disconnect
  const disconnectFromPuck = async () => {
    try {
      if (!puckDevice) {
        console.log('No device connected.');
        return;
      }


      if (rxCharacteristic) {
        console.log('Stopping notifications...');
        await rxCharacteristic.stopNotifications();
        rxCharacteristic.removeEventListener('characteristicvaluechanged', handleNotifications);
        console.log('Notifications stopped.');
      }


      if (gattServer && gattServer.connected) {
        console.log('Disconnecting from GATT server...');
        gattServer.disconnect();
        console.log('Disconnected from GATT server.');
      } else {
        console.log('GATT server is not connected.');
      }


      // Clear references to ensure the device can be reconnected
      setPuckDevice(null);
      setGattServer(null);
      setTxCharacteristic(null);
      setRxCharacteristic(null);
      setIsConnected(false);


      console.log('Puck.js disconnected and cleaned up.');
    } catch (error) {
      console.error('Failed to disconnect from Puck.js:', error);
    }
  };
  //
  // 
  // Puck IR Receiver gets array passed  and [J as well as newline > get replaced and later
  const handleNotifications = (event) => {
    const value = new TextDecoder().decode(event.target.value);
    console.log('Received data:', value);
    // Update state with new data
    setNotifications((prevNotifications) => prevNotifications + value.replace(/\x1B\[J/g, "").replace(/\n/g, "").replace(/>/g, "").trim()) + "\n";
  };
  //passed to copy as Puck.IR(pulseTimes)

  const [puckIRStr, setPuckIRStr] = useState('Puck.IR();');
  const [buttonLabel, setButtonLabel] = useState("Copy code");

  const showCopyFeedback = () => {
    setButtonLabel("Copied!");
    setTimeout(() => {
      setButtonLabel("Copy code");
    }, 1500);
  };

  const handleCopyClick = async (pulseTimes: string) => {
    const irStr = `Puck.IR([${pulseTimes}]);\n`;
    setPuckIRStr(irStr);
    await navigator.clipboard.writeText(irStr);
    showCopyFeedback();
  };
  //
  const handleCommandClick = async (pulseTimes: string) => {
    if (!pulseTimes) {
      console.error("No pulse times provided.");
      return;
    }
    try {
      await Puck.write(`
        LED3.set();
        Puck.IR([${pulseTimes}]);\n
        repeat();
         LED3.reset();
        `);
       
      console.log(`Replaying command with pulse times: ${pulseTimes}`);
    } catch (error) {
      console.error("Failed to send IR command:", error);
    }
  };

  //Modal for BT Connection
  const [isModalOpen, setModalOpen] = useState(false);
  
  //
  //



  //
  //
  //

// return 
//
//
  return (
    
    <div>
      <h1>Bluetooth Connection</h1>
      <p>{isConnected ? 'Connected to Puck.js' : 'Not connected'}</p>
      {/* Connect/Disconnect Buttons */}
      <button onClick={isConnected ? disconnectFromPuck : connectToPuck}>
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>

      <h3>Notifications</h3>
      <div>
        <button onClick={() => handleCommandClick(notifications)}>Test
        </button>
      </div>
      <p> {notifications}</p>

      <div className="dark:bg-gray-900 p-1 flex justify-end">
        <button
          onClick={() => handleCopyClick(notifications)}
          className="bg-gray-600 hover:bg-gray-400 rounded p-1 flex items-center text-sm"
        >
          {buttonLabel === "Copy code" ? (
            <>
              <FaRegCopy className="mr-1" />
              {buttonLabel}
            </>
          ) : (
            <>
              <FaCheck className="mr-1" />
              {buttonLabel}
            </>
          )}
        </button>
      </div>
    </div>
    
  );

};

export default BluetoothConnection;