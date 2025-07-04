"use client"
import { useParams} from "next/navigation";

const DeviceProfilePage = () => {
  const { deviceId } = useParams();
  return (
    <div>DeviceProfilePage: {deviceId}</div>
  )
}

export default DeviceProfilePage