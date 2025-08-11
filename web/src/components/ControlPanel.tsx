import React, { useState } from 'react'

export const ControlPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [vehicleCount, setVehicleCount] = useState(10)

  const handleStart = () => {
    setIsRunning(true)
    // TODO: Start simulation
  }

  const handleStop = () => {
    setIsRunning(false)
    // TODO: Stop simulation
  }

  const handleReset = () => {
    setIsRunning(false)
    // TODO: Reset simulation
  }

  return (
    <div className="control-panel">
      <div className="control-section">
        <h3>Simulation Controls</h3>
        
        <div className="control-group">
          <button 
            onClick={isRunning ? handleStop : handleStart}
            className={isRunning ? 'danger' : ''}
          >
            {isRunning ? 'Stop' : 'Start'} Simulation
          </button>
          
          <button onClick={handleReset} disabled={isRunning}>
            Reset
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3>Parameters</h3>
        
        <div className="control-group">
          <label>Simulation Speed: {speed}x</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            disabled={isRunning}
          />
        </div>
        
        <div className="control-group">
          <label>Vehicle Count: {vehicleCount}</label>
          <input
            type="range"
            min="5"
            max="50"
            value={vehicleCount}
            onChange={(e) => setVehicleCount(parseInt(e.target.value))}
            disabled={isRunning}
          />
        </div>
      </div>

      <div className="control-section">
        <h3>Traffic Signals</h3>
        <div className="control-group">
          <label>Signal Duration (seconds)</label>
          <input type="number" min="10" max="60" defaultValue="30" />
        </div>
      </div>

      <div className="control-section">
        <h3>Statistics</h3>
        <div className="control-group">
          <p>Active Vehicles: {isRunning ? vehicleCount : 0}</p>
          <p>Average Speed: {isRunning ? '25 km/h' : '--'}</p>
          <p>Traffic Flow: {isRunning ? 'Normal' : '--'}</p>
        </div>
      </div>
    </div>
  )
}
