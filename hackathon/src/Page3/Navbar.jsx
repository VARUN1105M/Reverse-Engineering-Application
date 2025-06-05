import { Box } from '@mui/material'
import React from 'react'

export default function Navbar() {
  return (
<div>
  <Box sx={{ width: "100%", padding: "1rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {/* Logo Section */}
      <div>
        <img
          style={{ padding: "0.75rem", width: "27%" }}
          src="https://png.pngtree.com/png-vector/20220812/ourmid/pngtree-indian-independence-day-75-text-creative-logo-celebration-75th-15-august-png-image_6106709.png"
          alt="Logo"
        />
      </div>
      
      {/* Title Section */}
      <div>
        <p style={{ color: "white", fontSize: "1.875rem", padding: "1rem", fontWeight: "bold" }}>
          Vakshit
        </p>
      </div>
    </div>
  </Box>
</div>

  )
}
