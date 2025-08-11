import React from 'react'
import { SimulationProvider } from './state/SimulationProvider'
import { MapContainer } from './components/MapContainer'
import { ControlPanel } from './components/ControlPanel'

function App() {
  return (
    <SimulationProvider>
      <div className="app">
        <header className="app-header">
          <h1>Traffic Simulation</h1>
        </header>
        <main className="app-main">
          <div className="simulation-container">
            <MapContainer />
            <ControlPanel />
          </div>
        </main>
      </div>
    </SimulationProvider>
  )
}

export default App
