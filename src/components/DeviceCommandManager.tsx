import React, { FC, useState } from "react";
import { FaRegCopy, FaCheck } from "react-icons/fa";

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

interface BluetoothConnectionProps {
  onPulseTimesChange: (value: string) => void;
  pulseTimes: string;
  setPulseTimes: (value: string) => void;
}

const BluetoothConnection: FC<BluetoothConnectionProps> = ({
  onPulseTimesChange,
  pulseTimes,
  setPulseTimes,
}) => {
  const [puckDevice, setPuckDevice] = useState<BluetoothDevice | null>(null);
  const [gattServer, setGattServer] = useState<BluetoothRemoteGATTServer | null>(null);
  const [txCharacteristic, setTxCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [rxCharacteristic, setRxCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState("");

  const connectToPuck = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
      const tx = await service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
      const rx = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");

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
    if (!puckDevice) return;

    if (rxCharacteristic) {
      await rxCharacteristic.stopNotifications();
      rxCharacteristic.removeEventListener("characteristicvaluechanged", handleNotifications);
    }

    if (gattServer?.connected) {
      gattServer.disconnect();
    }

    setPuckDevice(null);
    setGattServer(null);
    setTxCharacteristic(null);
    setRxCharacteristic(null);
    setIsConnected(false);
    console.log("Puck.js disconnected and cleaned up.");
  };

  const handleNotifications = (event: Event) => {
    const value = new TextDecoder().decode((event.target as BluetoothRemoteGATTCharacteristic).value);
    const cleanedValue = value.replace(/\x1B\[J|\n|>/g, "").trim();
    setNotifications((prev) => prev + cleanedValue);
    onPulseTimesChange(cleanedValue);
  };

  const handleCopyPulseClick = async () => {
    await navigator.clipboard.writeText(notifications);
    setPulseTimes(notifications);
  };

  return (
    <div>
      <button
        onClick={connectToPuck}
        className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
      >
        Connect to Puck.js
      </button>
      <button
        onClick={disconnectFromPuck}
        className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
      >
        Disconnect from Puck.js
      </button>

      <div style={{ marginTop: "20px", padding: "10px", background: "#f4f4f4", borderRadius: "5px" }}>
        <h3>Received Data:</h3>
        <div>
          <p>Copy IR Signal from here:</p>
          <textarea
            id="d-array"
            value={notifications}
            readOnly
            style={{ width: "100%", height: "150px", marginTop: "10px" }}
          />
          <button
            onClick={handleCopyPulseClick}
            className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
          >
            Copy IR to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};

export const DeviceCommandManager: FC<DeviceCommandManagerProps> = ({ onCommandClick }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isPulseModalOpen, setPulseModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newCommandName, setNewCommandName] = useState("");
  const [pulseTimes, setPulseTimes] = useState("");
  const [addedDeviceList, setAddedDeviceList] = useState<string[]>([]);
  const [addedCommandList, setAddedCommandList] = useState<DeviceCommand[]>([]);
  const [buttonLabel, setButtonLabel] = useState("Copy code");

  const handleClearClick = () => setPulseTimes("");
  const showCopyFeedback = () => {
    setButtonLabel("Copied!");
    setTimeout(() => setButtonLabel("Copy code"), 1500);
  };

  const addNewDevice = () => {
    if (newDeviceName.trim()) {
      setAddedDeviceList([...addedDeviceList, newDeviceName]);
      setNewDeviceName("");
      setModalOpen(false);
    }
  };

  const addNewCommand = () => {
    if (newCommandName.trim() && pulseTimes) {
      setAddedCommandList([...addedCommandList, { device: newDeviceName, title: newCommandName, pulseTimes }]);
      setNewCommandName("");
      setPulseTimes("");
      setPulseModalOpen(false);
    }
  };

  const handleCommandClick = async (pulseTimes: string) => {
    if (!pulseTimes) return;
    try {
      await Puck.write(`Puck.IR([${pulseTimes}]);\n`);
      console.log(`Replaying command with pulse times: ${pulseTimes}`);
    } catch (error) {
      console.error("Failed to send IR command:", error);
    }
  };

  const handleCopyClick = async (pulseTimes: string) => {
    const irStr = `Puck.IR([${pulseTimes}]);\n`;
    await navigator.clipboard.writeText(irStr);
    showCopyFeedback();
  };

  const saveStateToJson = () => {
    const state = { devices: addedDeviceList, commands: addedCommandList };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
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
        const state = JSON.parse(e.target?.result as string);
        setAddedDeviceList((prev) => [...prev, ...(state.devices || []).filter((d: string) => !prev.includes(d))]);
        setAddedCommandList((prev) => [
          ...prev,
          ...(state.commands || []).filter(
            (c: DeviceCommand) =>
              !prev.some((p) => p.device === c.device && p.title === c.title && p.pulseTimes === c.pulseTimes)
          ),
        ]);
      };
      reader.readAsText(file);
    }
  };

  const clearState = () => {
    setAddedDeviceList([]);
    setAddedCommandList([]);
  };

  return (
    <>
      <div className="mt-4 w-full">
        <button onClick={() => setModalOpen(true)} className="flex flex-col md:flex-row gap-8 mt-2 p-2 bg-blue-500 text-white rounded">
          Add New Device
        </button>
      </div>

      <div className="mt-8 flex gap-4">
        <button onClick={saveStateToJson} className="p-2 bg-green-500 text-white rounded hover:bg-green-600">
          Save Buttons Locally
        </button>
        <label className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer">
          Load Buttons to Page
          <input type="file" accept=".json" onChange={loadStateFromJson} className="hidden" />
        </label>
        <button onClick={clearState} className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
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
                  <button onClick={() => handleCommandClick(command.pulseTimes)}>{command.title}</button>
                  <div className="dark:bg-gray-600 p-2 rounded mt-2">
                    <div className="p-1">Copy this text to the "AsTeRICS Grid Puck Action":</div>
                    <div className="dark:bg-gray-900 p-1 flex justify-end">
                      <button
                        onClick={() => handleCopyClick(command.pulseTimes)}
                        className="bg-gray-600 hover:bg-gray-400 rounded p-1 flex items-center text-sm"
                      >
                        {buttonLabel === "Copy code" ? <FaRegCopy className="mr-1" /> : <FaCheck className="mr-1" />}
                        {buttonLabel}
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
            <BluetoothConnection onPulseTimesChange={setPulseTimes} pulseTimes={pulseTimes} setPulseTimes={setPulseTimes} />
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