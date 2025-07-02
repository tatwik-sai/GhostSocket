import DBUserDeviceLinks from "../models/UserDeviceLinksModel.js";

const getMyDevices = async (req, res) => {
  try {
    const { userId } = req.auth;
    const myDevices = await DBUserDeviceLinks.find({ userId, role: "owner" });
    res.status(200).json(myDevices);
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

export {
  getMyDevices,
  getOtherDevices
}