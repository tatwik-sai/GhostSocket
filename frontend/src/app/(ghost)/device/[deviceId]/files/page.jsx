"use client"
import { useParams} from "next/navigation";

const FilePage = () => {
  const { deviceId } = useParams();
  return (
    <div>FilePage: {deviceId}</div>
  )
}

export default FilePage