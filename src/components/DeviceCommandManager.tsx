//Import useState and FC Hook
import React, { FC, useState } from "react";
//Import ReactIcons
import { FaRegCopy, FaCheck } from 'react-icons/fa';
// Ensure the Puck object is available globally
const Puck = (window as any).Puck;
Puck.debug = 3;

interface DeviceCommand {
  device: string;
  title: string;
  pulseTimes: string;
}
interface DeviceCommandManagerProps {
  onCommandClick: (pulseTimes: string) => void;
}

const BluetoothConnection = ({ onPulseTimesChange }) => {
  const [puckDevice, setPuckDevice] = useState(null);
  const [gattServer, setGattServer] = useState(null);
  const [txCharacteristic, setTxCharacteristic] = useState(null);
  const [rxCharacteristic, setRxCharacteristic] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState("");

  const connectToPuck = async () => {
    try {
      // Request the device with UART service
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
      });

      console.log("Connecting to GATT server...");
      const server = await device.gatt.connect();

      console.log("Getting UART service...");
      const service = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");

      console.log("Getting characteristics...");
      const tx = await service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
      const rx = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");

      // Enable notifications on the RX characteristic
      rx.addEventListener("characteristicvaluechanged", handleNotifications);
      await rx.startNotifications();

      setPuckDevice(device);
      setGattServer(server);
      setTxCharacteristic(tx);
      setRxCharacteristic(rx);
      setIsConnected(true);

      console.log("Connected to Puck.js");
    } catch (error) {
      console.error("Failed to connect to Puck.js:", error);
    }
  };

  const disconnectFromPuck = async () => {
    try {
      if (!puckDevice) {
        console.log("No device connected.");
        return;
      }


      if (rxCharacteristic) {
        console.log("Stopping notifications...");
        await rxCharacteristic.stopNotifications();
        rxCharacteristic.removeEventListener("characteristicvaluechanged", handleNotifications);
        console.log("Notifications stopped.");
      }


      if (gattServer && gattServer.connected) {
        console.log("Disconnecting from GATT server...");
        gattServer.disconnect();
        console.log("Disconnected from GATT server.");
      } else {
        console.log("GATT server is not connected.");
      }


      // Clear references to ensure the device can be reconnected
      setPuckDevice(null);
      setGattServer(null);
      setTxCharacteristic(null);
      setRxCharacteristic(null);
      setIsConnected(false);

      console.log("Puck.js disconnected and cleaned up.");
    } catch (error) {
      console.error("Failed to disconnect from Puck.js:", error);
    }
  };

  const handleNotifications = (event) => {
    const value = new TextDecoder().decode(event.target.value);
    console.log("Received data:", value);

    // Update state with new data
    setNotifications((prevNotifications) => prevNotifications + value.replace(/\x1B\[J/g, "").replace(/\n/g, "").replace(/>/g, "").trim());

    // Pass the received pulse times to the parent component
    onPulseTimesChange(value.trim());
  };




  const [puckIRStr, setPuckIRStr] = useState('Puck.IR();');
  const [buttonLabel, setButtonLabel] = useState("Copy code");
  const showCopyFeedback = () => {
    setButtonLabel("Copied!");
    setTimeout(() => {
      setButtonLabel("Copy code");
    }, 1500);
  };

  const handleCopyPulseClick = async (pulseTimes: string) => {
    const irStr = `${notifications}\n`;
    setPuckIRStr(irStr);
    await navigator.clipboard.writeText(irStr);
    showCopyFeedback();
  };



  return (
    <div>
      <button id="connect" onClick={connectToPuck} className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500">
        Connect to Puck.js
      </button>
      <button id="disconnect" onClick={disconnectFromPuck} className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500">
        Disconnect from Puck.js
      </button>




      {/* Display the received data */}
      <div style={{ marginTop: "20px", padding: "10px", background: "#f4f4f4", borderRadius: "5px" }}>
        <h3>Received Data:</h3>
        <div>
          <p>Copy IR Signal from here:</p>
          <textarea
            id="d-array"
            value={notifications}
            readOnly // Feld ist schreibgeschützt
            style={{ width: "100%", height: "150px", marginTop: "10px" }}
          />
          <button onClick={() => handleCopyPulseClick(notifications)}
            className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
          >Copy IR to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};
// isModalOpen: Steuert die Sichtbarkeit des Modals für neue Geräte.
// newDeviceName: Speichert den Namen des neuen Geräts.
// isPulseModalOpen: Steuert die Sichtbarkeit des Modals für neue Befehle.
// newCommandName: Speichert den Namen des neuen Befehls.
// pulseTimes: Speichert die Pulslängen für den Befehl.
// addedDeviceList: Liste der hinzugefügten Geräte.
// addedCommandList: Liste der hinzugefügten Befehle.
export const DeviceCommandManager: FC<DeviceCommandManagerProps> = ({ onCommandClick }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [isPulseModalOpen, setPulseModalOpen] = useState(false);
  const [newCommandName, setNewCommandName] = useState("");
  const [pulseTimes, setPulseTimes] = useState("");
  const [addedDeviceList, setAddedDeviceList] = useState<string[]>([]);
  const [addedCommandList, setAddedCommandList] = useState<DeviceCommand[]>([]);
  const [puckIRStr, setPuckIRStr] = useState('Puck.IR();');
  const [buttonLabel, setButtonLabel] = useState("Copy code");

  const handleClearClick = () => {
    setPulseTimes("");
  };

  const addNewDevice = () => {
    if (newDeviceName.trim() === "") return;
    setAddedDeviceList([...addedDeviceList, newDeviceName]);
    //Modal closes after the input field has been cleared
    setNewDeviceName("");
    setModalOpen(false);
  };


  const addNewCommand = () => {
    if (newCommandName.trim() === "" || !pulseTimes) return;
    setAddedCommandList([...addedCommandList, { device: newDeviceName, title: newCommandName, pulseTimes }]);
    //order of Modal and Deleting the input field
    setNewCommandName("");
    setPulseTimes("");
    setPulseModalOpen(false);
  };


  const handlePulseTimesChange = (value) => {
    setPulseTimes(value);
  };


  const handleCommandClick = async (pulseTimes: string) => {
    if (!pulseTimes) {
      console.error("No pulse times provided.");
      return;
    }


    try {
      await Puck.write(`Puck.IR([${pulseTimes}]);\n`);
      console.log(`Replaying command with pulse times: ${pulseTimes}`);
    } catch (error) {
      console.error("Failed to send IR command:", error);
    }
  };


  const showCopyFeedback = () => {
    setButtonLabel("Copied!");
    setTimeout(() => {
      setButtonLabel("Copy code");
    }, 1500);
  };

  //
  //
  const handleCopyClick = async (pulseTimes: string) => {
    const irStr = `Puck.IR([${pulseTimes}]);\n`;
    setPuckIRStr(irStr);
    await navigator.clipboard.writeText(irStr);
    showCopyFeedback();
  };
  const handleCopyPulseClick = async (pulseTimes: string) => {
    const irStr = `${pulseTimes}\n`;
    setPuckIRStr(irStr);
    await navigator.clipboard.writeText(irStr);
    showCopyFeedback();
  };

  const saveStateToJson = () => {
    const state = {
      devices: addedDeviceList,
      commands: addedCommandList,
    };
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "device_commands_state.json";
    a.click();
    URL.revokeObjectURL(url);
  };


  const loadStateFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const state = JSON.parse(content);

        // Merge devices: Add only new devices that don't already exist
        setAddedDeviceList((prevDevices) => {
          const newDevices = (state.devices || []).filter(
            (device: string) => !prevDevices.includes(device)
          );
          return [...prevDevices, ...newDevices];
        });

        // Merge commands: Add only new commands that don't already exist
        setAddedCommandList((prevCommands) => {
          const newCommands = (state.commands || []).filter(
            (command: DeviceCommand) =>
              !prevCommands.some(
                (prevCommand) =>
                  prevCommand.device === command.device &&
                  prevCommand.title === command.title &&
                  prevCommand.pulseTimes === command.pulseTimes
              )
          );
          return [...prevCommands, ...newCommands];
        });
      };
      reader.readAsText(file);
    }
  };


  const clearState = () => {
    setAddedDeviceList([]);
    setAddedCommandList([]);
  };

  //



  //
  return (

    <>

      <div className="mt-4 w-full">
        <label>New Device </label>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex flex-col md:flex-row gap-8 mt-2 p-2 bg-blue-500 text-white rounded"
        >
          Add New Device
        </button>
      </div>


      <div className="mt-8 flex gap-4">
        <button
          onClick={saveStateToJson}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Buttons Locally
        </button>
        <label className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer">
          Load Buttons to Page
          <input
            type="file"
            accept=".json"
            onChange={loadStateFromJson}
            className="hidden"
          />
        </label>
        <button
          onClick={clearState}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete all Buttons
        </button>
      </div>


      <div className="mt-8 space-y-4">
        {addedDeviceList.map((device, index) => (
          <div key={index} className="dark:bg-gray-800 bg-white p-4 rounded">
            <span className="text-lg font-bold">{device}</span>


            <button
              onClick={() => {
                setNewDeviceName(device);
                setPulseModalOpen(true);
              }}
              className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
            >
              New Command
            </button>


            {addedCommandList
              .filter((command) => command.device === device)
              .map((command, idx) => (
                <div key={idx} className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500">
                  <button
                    onClick={() => handleCommandClick(command.pulseTimes)}
                  >
                    {command.title}
                  </button>
                  <div className="dark:bg-gray-600 p-2 rounded mt-2">
                    <div className="p-1">
                      Copy this text to the "AsTeRICS Grid Puck Action":
                    </div>
                    <div className="dark:bg-gray-900 p-1 flex justify-end">
                      <button
                        onClick={() => handleCopyClick(command.pulseTimes)}
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
                    <div className="dark:bg-gray-800 p-2 pr-12 break-words word-break[break-all]">
                      {`Puck.IR([${command.pulseTimes}]);\n`}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>


      {/* Modal for adding a new device */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-4 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add New Device</h2>
            <input
              type="text"
              placeholder="Enter device name"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              className="w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={addNewDevice} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Save
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal for adding a new command */}
      {isPulseModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-4 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add New Command</h2>
            <input
              type="text"
              placeholder="Enter command name"
              value={newCommandName}
              onChange={(e) => setNewCommandName(e.target.value)}
              className="w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
            />
            <input
              type="text"
              placeholder=""
              value={pulseTimes}
              onChange={(e) => setPulseTimes(e.target.value)}
              className="w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
            />
            <button onClick={handleClearClick} className="p-2 bg-red-500 text-white rounded">
              Clear field
            </button>
            {/**/}
            <button></button>
            <BluetoothConnection onPulseTimesChange={handlePulseTimesChange} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setPulseModalOpen(false)} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={addNewCommand} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default DeviceCommandManager;

