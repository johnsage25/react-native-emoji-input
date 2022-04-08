import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props) {
  return (
    <Svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path

        d="M256 16C123.452 16 16 123.452 16 256s107.452 240 240 240 240-107.452 240-240S388.548 16 256 16zm147.078 387.078a207.253 207.253 0 1144.589-66.125 207.332 207.332 0 01-44.589 66.125z"
        className="ci-primary"
      />
      <Path

        className="ci-primary"
        d="M152 200H192V240H152z"
      />
      <Path

        className="ci-primary"
        d="M320 200H360V240H320z"
      />
      <Path

        d="M338.289 307.2A83.6 83.6 0 01260.3 360h-8.6a83.6 83.6 0 01-77.992-52.8l-1.279-3.2h-34.461L144 319.081A116 116 0 00251.7 392h8.6A116 116 0 00368 319.081L374.032 304h-34.464z"
        className="ci-primary"
      />
    </Svg>
  )
}

export default SvgComponent
