"use client"
import { useParams} from "next/navigation";

const TerminalPage = () => {
  const {deviceId} = useParams();
  return (
    <div>TerminalPage</div>
  )
}

export default TerminalPage