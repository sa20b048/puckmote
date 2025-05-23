//import ReactHooks import BTConnection
import React, { FC, useEffect, useState } from "react";
import { FaRegCopy, FaCheck } from 'react-icons/fa';
import { IFunction, fetchDevice, useAsync } from "../irdb";
import { EncodeIR } from "../wasm/EncodeIR";
import BluetoothConnection from "./BluetoothConnection";
import DeviceCommandManager from "./DeviceCommandManager";

const Puck = (window as any).Puck;
Puck.debug = 3;

interface Props {
  path: string;
}

interface DeviceCommand {
  device: string;
  title: string;
  pulseTimes: string;
}

export const Device: FC<Props> = ({ path }) => {
  const fns = useAsync(() => fetchDevice(path), [path]);
  const [fn, setFn] = useState<IFunction>();
  const [puckIRStr, setPuckIRStr] = useState('Puck.IR();');
  const [buttonLabel, setButtonLabel] = useState("Copy code");
  const [addedDeviceList, setAddedDeviceList] = useState<string[]>([]);
  const [addedCommandList, setAddedCommandList] = useState<DeviceCommand[]>([]);
  const [generatedButtons, setGeneratedButtons] = useState<IFunction[]>([]); // Track generated buttons

  // Update generatedButtons when fns changes
  useEffect(() => {
    if (fns) {
      setGeneratedButtons(fns);
    }
  }, [fns]);

  const trigger = async (fn: IFunction, send: boolean) => {
    setFn(fn);
    if (send) await emit(fn, setPuckIRStr, showCopyFeedback);
  };

  const showCopyFeedback = () => {
    setButtonLabel("Copied!");
    setTimeout(() => {
      setButtonLabel("Copy code");
    }, 1500);
  };

  const handleCopyClick = async () => {
    await navigator.clipboard.writeText(puckIRStr);
    showCopyFeedback();
  };

  const saveStateToJson = () => {
    const state = {
      devices: addedDeviceList,
      commands: addedCommandList,
      generatedButtons: generatedButtons, // Save generated buttons
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
  const loadStateFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const state = JSON.parse(content);
  
        // Merge devices
        setAddedDeviceList((prevDevices) => {
          const newDevices = (state.devices || []).filter(
            (device: string) => !prevDevices.includes(device)
          );
          return [...prevDevices, ...newDevices];
        });
  
        // Merge commands
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
  
        // Merge generatedButtons
        if (state.generatedButtons) {
          setGeneratedButtons((prevButtons) => {
            const newButtons = state.generatedButtons.filter(
              (newButton: IFunction) =>
                !prevButtons.some(
                  (prevButton) =>
                    prevButton.functionname === newButton.functionname &&
                    prevButton.protocol === newButton.protocol &&
                    prevButton.device === newButton.device &&
                    prevButton.subdevice === newButton.subdevice &&
                    prevButton.function === newButton.function
                )
            );
            return [...prevButtons, ...newButtons];
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const clearState = () => {
    setAddedDeviceList([]);
    setAddedCommandList([]);
    setGeneratedButtons([]); // Clear generated buttons
  };

  return (
    <>
          <div>
        <BluetoothConnection />
        <DeviceCommandManager onCommandClick={handleCopyClick}/>
      </div>
      <div className="m-2 mt-8 flex justify-between gap-4 flex-col md:flex-row">
        <div>
          <FnVis fn={fn} />
        </div>
        <div className="opacity-20">{path}</div>
      </div>
  
      <div className="dark:bg-gray-800 bg-white p-2 rounded">
        {fns && (
          <nav className="flex flex-wrap">
            {/* Render dynamically generated buttons */}
            {generatedButtons.map((fn, i) => (
              <Button key={i} fn={fn} trigger={trigger} />
            ))}

            {/* Render manually added buttons */}
            {addedCommandList.map((command, idx) => (
              <button
                key={idx}
                onClick={() => handleCommandClick(command.pulseTimes)}
                className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
              >
                {command.title}
              </button>
            ))}

            {/* Save, Load, and Clear buttons */}
            <div className="flex gap-4">
              <button
                onClick={saveStateToJson}
               className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500"
              >
                Save Buttons Locally
              </button>
              <label className="m-2 p-2 text-white rounded shadow transition-colors bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500">
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
           
          </nav>
        )}
        <div className="dark:bg-gray-600 p-2 rounded">
          <div className="p-1">
            Copy this text to the "AsTeRICS Grid Puck Action":
          </div>
          <div className="dark:bg-gray-900 p-1 flex justify-end">
            <button
              onClick={handleCopyClick}
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
            {puckIRStr}
          </div>
        </div>
      </div>
    </>
  );
};

interface ButtonProps {
  fn: IFunction;
  trigger: (fn: IFunction, emit?: boolean) => Promise<void>;
}

const Button: FC<ButtonProps> = ({ fn, trigger }) => {
  const [active, setActive] = useState(false);

  const click = async () => {
    setActive(true);
    await trigger(fn, true);
    setActive(false);
  };

  const enter = () => trigger(fn, false);

  return (
    <button
      className={
        "m-2 p-2 text-white rounded shadow transition-colors " +
        (active
          ? "bg-blue-500"
          : "bg-gray-900 hover:bg-black focus:bg-black focus:text-pink-500 hover:text-pink-500")
      }
      type="button"
      onClick={click}
      onMouseEnter={enter}
    >
      {fn.functionname}
    </button>
  );
};

const FnVis: FC<{ fn?: IFunction }> = ({ fn }) => {
  const [m, setM] = useState<number[]>([]);

  let text = "–";
  let x = 0;
  const scale = 3;

  try {
    useEffect(() => {
      if (fn) decode(fn).then(setM);
    }, [fn]);

    text = fn
      ? `${fn.protocol} ${fn.device} ${fn.subdevice} ${fn.function}`
      : "–";
  } catch (err) {
    text = "Problem decoding IR code: " + err;
    console.error(text);
  }

  return (
    <div className="flex flex-col">
      <div>{text}</div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="5"
        style={{ width: "100%" }}
      >
        {m.map((val, i) => {
          const p = x;
          x += val;
          if (i % 2) return null;
          return (
            <rect
              key={i}
              x={p * scale}
              width={val * scale}
              fill="currentColor"
              height="10"
            />
          );
        })}
      </svg>
    </div>
  );
};

const decode = async (fn: IFunction) => {
  try {
    const result: string = await EncodeIR(
      fn.protocol,
      parseInt(fn.device, 10),
      parseInt(fn.subdevice, 10),
      parseInt(fn.function, 10)
    );
    return result
      .split(" ")
      .map(parseFloat)
      .map((v) => v / 1000);
  } catch (err) {
    console.error("Problem decoding IR code: " + err);
    throw err;
  }
};

const emit = async (
  fn: IFunction,
  setPuckIRStr: (value: React.SetStateAction<string>) => void,
  showCopyFeedback: () => void
) => {
  if (last === fn) {
    await Puck.write(
      "repeat();\nLED2.set();setTimeout(() => LED2.reset(), 500)\n"
    );
  } else {
    last = fn;
    try {
      const millis = await decode(fn);
      let irStr = `[${millis.map((n) => n.toFixed(2)).join(",")}]`;
      const newPuckIRStr = `Puck.IR(${irStr});\\n`;
      setPuckIRStr(newPuckIRStr);
      navigator.clipboard.writeText(newPuckIRStr);
      showCopyFeedback();
      await Puck.write(`
        LED3.set();
        function repeat() {
          Puck.IR(${irStr});
        };
        repeat();
        LED3.reset();
      `);
    } catch (err) {
      setPuckIRStr("Problem decoding IR code: " + err);
      showCopyFeedback();
    }
  }
};

let last: IFunction = null;

export default Device;