import React from 'react'

export const MapContainer: React.FC = () => {
  return (
    <div className="map-container">
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#e8f4fd',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Google Maps Integration</h3>
          <p>Traffic simulation map will be loaded here</p>
          <p style={{ fontSize: '0.9em', marginTop: '1rem' }}>
            This component will integrate with Google Maps API<br/>
            to display roads, traffic signals, and vehicle movement
          </p>
        </div>
      </div>
    </div>
  )
}
