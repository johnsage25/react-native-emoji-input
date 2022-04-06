import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props) {
  return (
    <Svg
      viewBox="0 0 36 36"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        className="clr-i-outline clr-i-outline-path-1"
        d="M35.77 8.16a2.43 2.43 0 00-1.9-2L28 4.87a4.5 4.5 0 00-3.65.79L7 18.3l-4.86-.2a1.86 1.86 0 00-1.23 3.31l5 3.93c.6.73 1 .59 10.93-4.82l.93 9.42a1.36 1.36 0 00.85 1.18 1.43 1.43 0 00.54.1 1.54 1.54 0 001-.41l2.39-2.18a1.52 1.52 0 00.46-.83l2.19-11.9c3.57-2 6.95-3.88 9.36-5.25a2.43 2.43 0 001.21-2.49zm-2.2.75c-2.5 1.42-6 3.41-9.76 5.47l-.41.23-2.33 12.67-1.47 1.34-1.1-11.3-1.33.68C10 22 7.61 23.16 6.79 23.52l-4.3-3.41 5.08.22 18-13.06a2.51 2.51 0 012-.45l5.85 1.26a.43.43 0 01.35.37.42.42 0 01-.2.46z"
      />
      <Path
        className="clr-i-outline clr-i-outline-path-2"
        d="M7 12.54l3.56 1 1.64-1.19-4-1.16 1.8-1.1 5.47-.16 2.3-1.67L10 8.5a1.25 1.25 0 00-.7.17L6.67 10.2A1.28 1.28 0 007 12.54z"
      />
      <Path fill="none" d="M0 0H36V36H0z" />
    </Svg>
  )
}

export default SvgComponent
