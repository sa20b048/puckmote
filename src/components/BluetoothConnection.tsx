import React, { useState } from 'react';

const BluetoothConnection = () => {
  const [puckDevice, setPuckDevice] = useState(null);
  const [gattServer, setGattServer] = useState(null);
  const [txCharacteristic, setTxCharacteristic] = useState(null);
  const [rxCharacteristic, setRxCharacteristic] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState('');

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

  const handleNotifications = (event) => {
    const value = new TextDecoder().decode(event.target.value);
    console.log('Received data:', value);

    // Update state with new data
    setNotifications((prevNotifications) => prevNotifications + value.trim());
   
  };
  return (
    <p>Add personal devices just scan the IR code</p>
  );
  
};

export default BluetoothConnection;
