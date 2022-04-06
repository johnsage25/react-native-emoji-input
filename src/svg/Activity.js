import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="45px"
      height="45px"
      viewBox="0 0 45 45"
      xmlSpace="preserve"
      enableBackground="new 0 0 45 45"
      {...props}
    >
      <Path d="M22.5 0C10.093 0 0 10.095 0 22.5S10.093 45 22.5 45 45 34.905 45 22.5 34.907 0 22.5 0zm16.708 34.098H32.18l-2.67-2.976-.293-5.585 3.61-4.456 4.455-2.176 5.552 4.038a20.23 20.23 0 01-3.626 11.155zm-26.389 0H5.792a20.22 20.22 0 01-3.625-11.153l5.552-4.04 4.455 2.177 3.611 4.456-.293 5.585-2.673 2.975zm25.867-23.897l-2.174 6.698-4.479 2.184-5.383-1.44-3.08-4.748V7.393L29.204 3.3a20.448 20.448 0 019.482 6.901zM15.796 3.3l5.632 4.093v5.502l-3.079 4.748-5.382 1.44-4.479-2.188-2.173-6.693A20.42 20.42 0 0115.796 3.3zm.845 38.686l-2.134-6.563 2.66-2.96 5.226-2.043 5.445 2.048 2.653 2.956-2.132 6.563a20.217 20.217 0 01-5.859.869 20.228 20.228 0 01-5.859-.87z" />
    </Svg>
  )
}

export default SvgComponent
