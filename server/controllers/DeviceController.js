import DBDevice from "../models/DevicesModel.js";
import DBUserDeviceLinks from "../models/UserDeviceLinksModel.js";


const getMyDevices = async (req, res) => {
  try {
    const { userId } = req.auth;
    const myDevices = await DBUserDeviceLinks.find({ userId, role: "owner" })
      .populate({
        path: 'deviceId',
        model: 'Devices',
        select: 'inUse deviceData status'
      });
    
      console.log("My Devices:", myDevices);
    const devicesWithInfo = myDevices.map(link => ({
      _id: link._id,
      deviceId: link.deviceId._id,
      name: link.name,
      os: link.deviceId.deviceData.os,
      ip: link.deviceId.deviceData.ip,
      location: link.deviceId.deviceData.location,
      status: link.deviceId.status,
      inUse: link.deviceId.inUse,
      // lastSeen: link.deviceId.lastSeen,
      role: link.role,
      active: link.active,
    }));
    res.status(200).json(devicesWithInfo);
  } catch (error) {
    console.error("Error fetching my devices:", error);
    res.status(500).json({ error: "Failed to fetch devices" });
  }
}

const getOtherDevices = async (req, res) => {
  try {
    const { userId } = req.auth;
    const otherDevices = await DBUserDeviceLinks.find({ userId, role: "user" });
    res.status(200).json(otherDevices);
  } catch (error) {
    console.error("Error fetching other devices:", error);
    res.status(500).json({ error: "Failed to fetch devices" });
  }
}

const updateName = async (req, res) => {
  const { linkId } = req.params;
  const { name } = req.body;
  try {
    await DBUserDeviceLinks.updateOne({ _id: linkId }, { $set: { name } });
    res.status(200).json({ message: "Device name updated successfully" });
  } catch (error) {
    console.error("Error updating device name:", error);
    res.status(500).json({ error: "Failed to update device name" });
  }
}

export {
  getMyDevices,
  getOtherDevices,
  updateName
}