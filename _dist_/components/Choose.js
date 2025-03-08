import React, {useEffect, useState} from "../../_snowpack/pkg/react.js";
import {useAsync, fetchIndex} from "../irdb.js";
export const Choose = ({onChoose: setDevices}) => {
  const manufacturers = useAsync(fetchIndex, []) || {};
  const [manufacturer, setManufacturer] = useState();
  const changeManufacturer = (e) => setManufacturer(e.target.value);
  const types = manufacturers[manufacturer];
  const [type, setType] = useState();
  const changeType = (e) => {
    setType(e.target.value);
  };
  const devices = types && types[type];
  useEffect(() => setDevices(devices || []), [devices]);
  const submit = (e) => {
    e.preventDefault();
    console.log("submit");
  };
  useEffect(() => {
    const current = new URLSearchParams(location.search);
    if (current.has("m")) {
      setManufacturer(current.get("m"));
    }
    if (current.has("t")) {
      setType(current.get("t"));
    }
  }, []);
  useEffect(() => {
    let params = new URLSearchParams();
    if (manufacturer) {
      params.set("m", manufacturer);
    }
    if (type) {
      params.set("t", type);
    }
    const q = params.toString();
    history.pushState({manufacturer, type}, `${manufacturer} / ${type}`, q.length ? `?${q}` : ".");
  }, [manufacturer, type]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [isPulseModalOpen, setPulseModalOpen] = useState(false);
  const [newCommandName, setNewCommandName] = useState("");
  const [pulseTimes, setPulseTimes] = useState();
  const [addedDeviceList, setAddedDeviceList] = useState([]);
  const [addedCommandList, setAddedCommandList] = useState([]);
  const addNewDevice = () => {
    if (newDeviceName.trim() === "")
      return;
    setAddedDeviceList([...addedDeviceList, newDeviceName]);
    setModalOpen(false);
    setNewDeviceName("");
  };
  const addNewCommand = () => {
    if (newCommandName.trim() === "" || !pulseTimes)
      return;
    setAddedCommandList([...addedCommandList, {device: newDeviceName, title: newCommandName, pulseTimes}]);
    setPulseModalOpen(false);
    setNewCommandName("");
    setPulseTimes("");
  };
  const handleCommandClick = (pulseTimes2) => {
    console.log("Puck IR command triggered with pulse times:", pulseTimes2);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("form", {
    className: "flex flex-col md:flex-row gap-8",
    onSubmit: submit
  }, /* @__PURE__ */ React.createElement("label", {
    className: "block"
  }, /* @__PURE__ */ React.createElement("div", null, "Manufacturer"), /* @__PURE__ */ React.createElement("select", {
    className: "dark:bg-gray-800 p-2 rounded",
    onChange: changeManufacturer,
    name: "m",
    value: manufacturer
  }, /* @__PURE__ */ React.createElement("option", null), Object.keys(manufacturers).map((name) => /* @__PURE__ */ React.createElement("option", {
    key: name
  }, name)))), types && /* @__PURE__ */ React.createElement("label", {
    className: "block"
  }, /* @__PURE__ */ React.createElement("div", null, "Device Type"), /* @__PURE__ */ React.createElement("select", {
    className: "dark:bg-gray-800 p-2 rounded block",
    onChange: changeType,
    name: "t",
    value: type
  }, /* @__PURE__ */ React.createElement("option", null), Object.keys(types).map((name) => /* @__PURE__ */ React.createElement("option", {
    key: name
  }, name)))), /* @__PURE__ */ React.createElement("div", {
    className: "mt-4 w-full"
  }, /* @__PURE__ */ React.createElement("label", null, "New Device "), /* @__PURE__ */ React.createElement("button", {
    type: "button",
    onClick: () => setModalOpen(true),
    className: "flex flex-col md:flex-row gap-8 mt-2 p-2 bg-blue-500 text-white rounded"
  }, "Add New Device"))), /* @__PURE__ */ React.createElement("div", {
    className: "mt-4 space-y-2 w-full"
  }, addedDeviceList.map((device, index) => /* @__PURE__ */ React.createElement("div", {
    key: index,
    className: "dark:bg-gray-800 bg-white p-2 rounded"
  }, /* @__PURE__ */ React.createElement("span", null, device), /* @__PURE__ */ React.createElement("button", {
    onClick: () => {
      setNewDeviceName(device);
      setPulseModalOpen(true);
    },
    className: "m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
  }, "New Command"), addedCommandList.filter((command) => command.device === device).map((command, idx) => /* @__PURE__ */ React.createElement("button", {
    key: idx,
    className: "m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500",
    onClick: () => handleCommandClick(command.pulseTimes)
  }, command.title))))), isModalOpen && /* @__PURE__ */ React.createElement("div", {
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
    placeholder: "Enter pulse times",
    value: pulseTimes,
    onChange: (e) => setPulseTimes(e.target.value),
    className: "w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
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
