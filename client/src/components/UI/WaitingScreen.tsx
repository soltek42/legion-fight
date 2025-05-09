import React from 'react';

export default function WaitingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4">
      <h2 className="text-3xl font-bold mb-4">Waiting for an opponent...</h2>
      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
      <p className="text-lg max-w-md text-center">
        Looking for an opponent to join your game. This may take a moment.
      </p>
    </div>
  );
}