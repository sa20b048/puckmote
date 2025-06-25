import React, {useState} from "../../_snowpack/pkg/react.js";
import {FaRegCopy, FaCheck} from "../../_snowpack/pkg/react-icons/fa.js";
const Puck = window.Puck;
Puck.debug = 3;
const BluetoothConnection = ({
  onPulseTimesChange,
  pulseTimes,
  setPulseTimes
}) => {
  const [puckDevice, setPuckDevice] = useState(null);
  const [gattServer, setGattServer] = useState(null);
  const [txCharacteristic, setTxCharacteristic] = useState(null);
  const [rxCharacteristic, setRxCharacteristic] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState("");
  const connectToPuck = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
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
    if (!puckDevice)
      return;
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
  const handleNotifications = (event) => {
    const value = new TextDecoder().decode(event.target.value);
    const cleanedValue = value.replace(/\x1B\[J|\n|>/g, "").trim();
    setNotifications((prev) => prev + cleanedValue);
    onPulseTimesChange(cleanedValue);
  };
  const handleCopyPulseClick = async () => {
    await navigator.clipboard.writeText(notifications);
    setPulseTimes(notifications);
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", {
    onClick: connectToPuck,
    className: "m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
  }, "Connect to Puck.js"), /* @__PURE__ */ React.createElement("button", {
    onClick: disconnectFromPuck,
    className: "m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
  }, "Disconnect from Puck.js"), /* @__PURE__ */ React.createElement("div", {
    style: {marginTop: "20px", padding: "10px", background: "#f4f4f4", borderRadius: "5px"}
  }, /* @__PURE__ */ React.createElement("h3", null, "Received Data:"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, "Copy IR Signal from here:"), /* @__PURE__ */ React.createElement("textarea", {
    id: "d-array",
    value: notifications,
    readOnly: true,
    style: {width: "100%", height: "150px", marginTop: "10px"}
  }), /* @__PURE__ */ React.createElement("button", {
    onClick: handleCopyPulseClick,
    className: "m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
  }, "Copy IR to Clipboard"))));
};
export const DeviceCommandManager = ({onCommandClick}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isPulseModalOpen, setPulseModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newCommandName, setNewCommandName] = useState("");
  const [pulseTimes, setPulseTimes] = useState("");
  const [addedDeviceList, setAddedDeviceList] = useState([]);
  const [addedCommandList, setAddedCommandList] = useState([]);
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
      setAddedCommandList([...addedCommandList, {device: newDeviceName, title: newCommandName, pulseTimes}]);
      setNewCommandName("");
      setPulseTimes("");
      setPulseModalOpen(false);
    }
  };
  const handleCommandClick = async (pulseTimes2) => {
    if (!pulseTimes2)
      return;
    try {
      await Puck.write(`Puck.IR([${pulseTimes2}]);
`);
      console.log(`Replaying command with pulse times: ${pulseTimes2}`);
    } catch (error) {
      console.error("Failed to send IR command:", error);
    }
  };
  const handleCopyClick = async (pulseTimes2) => {
    const irStr = `Puck.IR([${pulseTimes2}]);
`;
    await navigator.clipboard.writeText(irStr);
    showCopyFeedback();
  };
  const saveStateToJson = () => {
    const state = {devices: addedDeviceList, commands: addedCommandList};
    const blob = new Blob([JSON.stringify(state, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "device_commands_state.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const loadStateFromJson = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const state = JSON.parse(e.target?.result);
        setAddedDeviceList((prev) => [...prev, ...(state.devices || []).filter((d) => !prev.includes(d))]);
        setAddedCommandList((prev) => [
          ...prev,
          ...(state.commands || []).filter((c) => !prev.some((p) => p.device === c.device && p.title === c.title && p.pulseTimes === c.pulseTimes))
        ]);
      };
      reader.readAsText(file);
    }
  };
  const clearState = () => {
    setAddedDeviceList([]);
    setAddedCommandList([]);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", {
    className: "mt-4 w-full"
  }, /* @__PURE__ */ React.createElement("button", {
    onClick: () => setModalOpen(true),
    className: "flex flex-col md:flex-row gap-8 mt-2 p-2 bg-blue-500 text-white rounded"
  }, "Add New Device")), /* @__PURE__ */ React.createElement("div", {
    className: "mt-8 flex gap-4"
  }, /* @__PURE__ */ React.createElement("button", {
    onClick: saveStateToJson,
    className: "p-2 bg-green-500 text-white rounded hover:bg-green-600"
  }, "Save Buttons Locally"), /* @__PURE__ */ React.createElement("label", {
    className: "p-2 bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer"
  }, "Load Buttons to Page", /* @__PURE__ */ React.createElement("input", {
    type: "file",
    accept: ".json",
    onChange: loadStateFromJson,
    className: "hidden"
  })), /* @__PURE__ */ React.createElement("button", {
    onClick: clearState,
    className: "p-2 bg-red-500 text-white rounded hover:bg-red-600"
  }, "Delete all Buttons")), /* @__PURE__ */ React.createElement("div", {
    className: "mt-8 space-y-4"
  }, addedDeviceList.map((device, index) => /* @__PURE__ */ React.createElement("div", {
    key: index,
    className: "dark:bg-gray-800 bg-white p-4 rounded"
  }, /* @__PURE__ */ React.createElement("span", {
    className: "text-lg font-bold"
  }, device), /* @__PURE__ */ React.createElement("button", {
    onClick: () => {
      setNewDeviceName(device);
      setPulseModalOpen(true);
    },
    className: "m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
  }, "New Command"), addedCommandList.filter((command) => command.device === device).map((command, idx) => /* @__PURE__ */ React.createElement("div", {
    key: idx,
    className: "m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
  }, /* @__PURE__ */ React.createElement("button", {
    onClick: () => handleCommandClick(command.pulseTimes)
  }, command.title), /* @__PURE__ */ React.createElement("div", {
    className: "dark:bg-gray-600 p-2 rounded mt-2"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "p-1"
  }, 'Copy this text to the "AsTeRICS Grid Puck Action":'), /* @__PURE__ */ React.createElement("div", {
    className: "dark:bg-gray-900 p-1 flex justify-end"
  }, /* @__PURE__ */ React.createElement("button", {
    onClick: () => handleCopyClick(command.pulseTimes),
    className: "bg-gray-600 hover:bg-gray-400 rounded p-1 flex items-center text-sm"
  }, buttonLabel === "Copy code" ? /* @__PURE__ */ React.createElement(FaRegCopy, {
    className: "mr-1"
  }) : /* @__PURE__ */ React.createElement(FaCheck, {
    className: "mr-1"
  }), buttonLabel)), /* @__PURE__ */ React.createElement("div", {
    className: "dark:bg-gray-800 p-2 pr-12 break-words word-break[break-all]"
  }, `Puck.IR([${command.pulseTimes}]);
`))))))), isModalOpen && /* @__PURE__ */ React.createElement("div", {
    className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "bg-white dark:bg-gray-900 p-4 rounded shadow-lg w-96"
  }, /* @__PURE__ */ React.createElement("h2", {
    className: "text-lg font-bold mb-4"
  }, "Add New Device"), /* @__PURE__ */ React.createElement("input", {
    type: "text",
    placeholder: "Enter device name",
    value: newDeviceName,
    onChange: (e) => setNewDeviceName(e.target.value),
    className: "w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
  }), /* @__PURE__ */ React.createElement("div", {
    className: "flex justify-end gap-2"
  }, /* @__PURE__ */ React.createElement("button", {
    onClick: () => setModalOpen(false),
    className: "p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
  }, "Cancel"), /* @__PURE__ */ React.createElement("button", {
    onClick: addNewDevice,
    className: "p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  }, "Save")))), isPulseModalOpen && /* @__PURE__ */ React.createElement("div", {
    className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "bg-white dark:bg-gray-900 p-4 rounded shadow-lg w-96"
  }, /* @__PURE__ */ React.createElement("h2", {
    className: "text-lg font-bold mb-4"
  }, "Add New Command"), /* @__PURE__ */ React.createElement("input", {
    type: "text",
    placeholder: "Enter command name",
    value: newCommandName,
    onChange: (e) => setNewCommandName(e.target.value),
    className: "w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
  }), /* @__PURE__ */ React.createElement("input", {
    type: "text",
    placeholder: "",
    value: pulseTimes,
    onChange: (e) => setPulseTimes(e.target.value),
    className: "w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
  }), /* @__PURE__ */ React.createElement("button", {
    onClick: handleClearClick,
    className: "p-2 bg-red-500 text-white rounded"
  }, "Clear field"), /* @__PURE__ */ React.createElement(BluetoothConnection, {
    onPulseTimesChange: setPulseTimes,
    pulseTimes,
    setPulseTimes
  }), /* @__PURE__ */ React.createElement("div", {
    className: "flex justify-end gap-2"
  }, /* @__PURE__ */ React.createElement("button", {
    onClick: () => setPulseModalOpen(false),
    className: "p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
  }, "Cancel"), /* @__PURE__ */ React.createElement("button", {
    onClick: addNewCommand,
    className: "p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  }, "Save")))));
};
export default DeviceCommandManager;
