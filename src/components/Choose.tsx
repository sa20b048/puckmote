import React, { ChangeEventHandler, FC, useEffect, useState } from "react";
import { useAsync, fetchIndex } from "../irdb";

interface Props {
  onChoose: (devices: string[]) => void;
}

export const Choose: FC<Props> = ({ onChoose: setDevices }) => {
  const manufacturers = useAsync(fetchIndex, []) || {};

  const [manufacturer, setManufacturer] = useState<string>();
  const changeManufacturer: ChangeEventHandler<HTMLSelectElement> = (e) =>
    setManufacturer(e.target.value);

  const types = manufacturers[manufacturer];
  const [type, setType] = useState<string>();
  const changeType: ChangeEventHandler<HTMLSelectElement> = (e) => {
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

    history.pushState(
      { manufacturer, type },
      `${manufacturer} / ${type}`,
      q.length ? `?${q}` : "."
    );
  }, [manufacturer, type]);

  // State for adding new devices, commands, pulse times, etc.
  const [isModalOpen, setModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [isPulseModalOpen, setPulseModalOpen] = useState(false);
  const [newCommandName, setNewCommandName] = useState("");
  const [pulseTimes, setPulseTimes] = useState<string>();
  const [addedDeviceList, setAddedDeviceList] = useState<string[]>([]);
  const [addedCommandList, setAddedCommandList] = useState<{ device: string; title: string; pulseTimes: string }[]>([]);

  const addNewDevice = () => {
    if (newDeviceName.trim() === "") return;
    setAddedDeviceList([...addedDeviceList, newDeviceName]);
    setModalOpen(false);
    setNewDeviceName("");
  };

  const addNewCommand = () => {
    if (newCommandName.trim() === "" || !pulseTimes) return;
    // Add the new command with the pulse time to the command list
    setAddedCommandList([...addedCommandList, { device: newDeviceName, title: newCommandName, pulseTimes: pulseTimes }]);
    setPulseModalOpen(false);
    setNewCommandName("");
    setPulseTimes("");
  };

  const handleCommandClick = (pulseTimes: string) => {
    console.log("Puck IR command triggered with pulse times:", pulseTimes);
    Puck.IR(pulseTimes);
    // Puck.IR(pulseTimes); // Call actual Puck IR command method
  };

  return (
    <>
      <form className="flex flex-col md:flex-row gap-8" onSubmit={submit}>
        <label className="block">
          <div>Manufacturer</div>
          <select
            className="dark:bg-gray-800 p-2 rounded"
            onChange={changeManufacturer}
            name="m"
            value={manufacturer}
          >
            <option></option>
            {Object.keys(manufacturers).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        {types && (
          <label className="block">
            <div>Device Type</div>
            <select
              className="dark:bg-gray-800 p-2 rounded block"
              onChange={changeType}
              name="t"
              value={type}
            >
              <option></option>
              {Object.keys(types).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        )}

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
      </form>

      {/* Display Added Devices and Commands */}
      <div className="mt-4 space-y-2 w-full">
        {addedDeviceList.map((device, index) => (
          <div key={index} className="dark:bg-gray-800 bg-white p-2 rounded">
            <span>{device}</span>
            <button
              onClick={() => {
                setNewDeviceName(device); // Set the current device for the command
                setPulseModalOpen(true);
              }}
              className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
            >
              New Command
            </button>

            {/* Display command buttons for each device */}
            {addedCommandList
              .filter((command) => command.device === device)
              .map((command, idx) => (
                <button
                  key={idx}
                  className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
                  onClick={() => handleCommandClick(command.pulseTimes)}
                >
                  {command.title}
                </button>
              ))}
          </div>
        ))}
      </div>

      {/* Modal for Adding New Device */}
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

      {/* Modal for Adding New Command */}
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
              placeholder="Enter pulse times"
              value={pulseTimes}
              onChange={(e) => setPulseTimes(e.target.value)}
              className="w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:text-white"
            />
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