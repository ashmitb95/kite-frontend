import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import data from './ohlc.json';
import CandlestickChart from './chart';
// const socket = io('ws://localhost:3000');
const ws = new WebSocket('ws://localhost:3000');
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tickerData, setTickerData] = useState([]);

  const webSocketThingy = () => {
    // Create a new WebSocket connection

    // Handle WebSocket open event
    ws.onopen = () => {
      console.log('WebSocket connection established -- client');
    };

    // Handle WebSocket message event
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received data:', data);
      setTickerData((state) => {
        return [...state, data];
      });
      // Handle the received data as needed
    };

    ws.onclose = () => {
      setTimeout(function () {
        console.log('WebSocket connection closed. Will reconnect in 5');
        webSocketThingy();
      }, 5000);
    };

    return () => {
      ws.close();
    };
  };

  useEffect(() => {
    webSocketThingy();
  }, []);
  useEffect(() => {
    async function fetchData() {
      // You can await here
      const response = await checkAuth();
      // debugger;
    }
    fetchData();
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/beat');
      const data = await response.json();
      console.log('Token exists. ');
      // debugger;
      setIsAuthenticated(data.hasToken);
      return data;
    } catch (error) {
      console.error('Failed to check authentication status:', error);
    }
  };

  const handleLogin = () => {
    window.open(
      'https://kite.zerodha.com/connect/login?v=3&api_key=vbwnoztv5asscmta',
      '_blank'
    );
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <>
          <h1>Authenticated! Listening for ticker data...</h1>
          {/* {tickerData?.map((item) => (
            <pre>{JSON.stringify(item)}</pre>
          ))} */}
          <CandlestickChart data={data} />
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}

export default App;
