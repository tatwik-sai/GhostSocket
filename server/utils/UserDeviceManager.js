class UserDeviceManager {
  constructor() {
    this.userSocketMap = new Map();    // userId => userSocketId
    this.deviceSocketMap = new Map();  // deviceId => deviceSocketId
    this.userToDevice = new Map();     // userId => deviceId
    this.deviceToUser = new Map();     // deviceId => userId
  }

  addUserSocket(userId, socketId) {
    this.userSocketMap.set(userId, socketId);
  }

  addDeviceSocket(deviceId, socketId) {
    this.deviceSocketMap.set(deviceId, socketId);
  }

  addConnection(userId, deviceId) {
    this.userToDevice.set(userId, deviceId);
    this.deviceToUser.set(deviceId, userId);
  }

  areConnected(userId, deviceId) {
    return this.userToDevice.get(userId) === deviceId &&
           this.deviceToUser.get(deviceId) === userId;
  }

  getUserIdByDeviceId(deviceId) {
    return this.deviceToUser.get(deviceId) || null;
  }

  getDeviceIdByUserId(userId) {
    return this.userToDevice.get(userId) || null;
  }

  getUserSocketIdByDeviceId(deviceId) {
    const userId = this.deviceToUser.get(deviceId);
    return userId ? this.userSocketMap.get(userId) || null : null;
  }

  getDeviceSocketIdByUserId(userId) {
    const deviceId = this.userToDevice.get(userId);
    return deviceId ? this.deviceSocketMap.get(deviceId) || null : null;
  }

  deleteConnectionByUserId(userId) {
    const deviceId = this.userToDevice.get(userId);
    if (deviceId) {
      this.userToDevice.delete(userId);
      this.deviceToUser.delete(deviceId);
    }
  }

  deleteConnectionByDeviceId(deviceId) {
    const userId = this.deviceToUser.get(deviceId);
    if (userId) {
      this.deviceToUser.delete(deviceId);
      this.userToDevice.delete(userId);
    }
  }

  deleteUserSocketAndConnection(userId) {
    this.deleteConnectionByUserId(userId);
    this.userSocketMap.delete(userId);
  }

  deleteDeviceSocketAndConnection(deviceId) {
    this.deleteConnectionByDeviceId(deviceId);
    this.deviceSocketMap.delete(deviceId);
  }

  deleteUserSocketOnly(userId) {
    this.userSocketMap.delete(userId);
  }

  deleteDeviceSocketOnly(deviceId) {
    this.deviceSocketMap.delete(deviceId);
  }
}


export default UserDeviceManager;