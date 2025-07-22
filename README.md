# 🌐 Ghost Socket
python -m nuitka --standalone --onefile --include-data-dir=assets=assets --enable-plugin=tk-inter --windows-icon-from-ico=assets/icon.ico --windows-disable-console  app.py

Ghost Socket is a secure remote desktop control system that allows users to remotely access and control Windows PCs through a web interface. The system consists of a desktop application for the controlled device and a web platform for remote access.

## 🚀 Features

- **Remote Desktop Control**: Full desktop access and control capabilities
- **Real-time Communication**: WebRTC-based low-latency connections
- **Secure Authentication**: Clerk-based user authentication system
- **Permission Management**: Granular control over access permissions
- **File Operations**: Remote file browsing and management
- **Cross-platform Web Access**: Control devices from any modern web browser
- **Auto-startup**: Automatic application startup on system boot

## 🏗️ Architecture

The project consists of three main components:

### 📱 Desktop Application (`application/`)
- **Technology**: Python with CustomTkinter GUI
- **Features**: 
  - System tray integration
  - Socket communication
  - Permission management
  - Auto-startup functionality
  - Toast notifications

### 🌐 Frontend (`frontend/`)
- **Technology**: Next.js with React
- **Features**:
  - Modern responsive UI
  - Real-time device management
  - WebRTC video streaming
  - File browser interface
  - Authentication integration

### 🔧 Server (`server/`)
- **Technology**: Node.js
- **Features**:
  - Socket.IO communication
  - Device management
  - User authentication
  - Permission handling

## 📋 Prerequisites

### For Desktop Application
- Python 3.8+
- Windows OS
- Required Python packages (see `application/requirements.txt`)

### For Frontend
- Node.js 16+
- npm or yarn

### For Server
- Node.js 16+
- npm or yarn

## 🛠️ Installation

### Desktop Application Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/ghost_socket.git
   cd ghost_socket/application
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv webrtc-env
   webrtc-env\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   # Create .env file in application directory
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the application**:
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**:
   ```bash
   # Create .env.local file
   cp .env.local.example .env.local
   # Add your Clerk and API configuration
   ```

4. **Run development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Server Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   # Create .env file
   cp .env.example .env
   # Add your configuration
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## 🔧 Building for Production

### Desktop Application (Executable)

1. **Install PyInstaller**:
   ```bash
   pip install pyinstaller
   ```

2. **Build executable**:
   ```bash
   pyinstaller --windowed --onefile --icon=icon.ico --name=GhostSocket app.py
   ```

3. **The executable will be in the `dist/` folder**

### Frontend (Web App)

1. **Build the application**:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. **Deploy to your hosting platform**

## 📖 Usage

### For Device Owners (Ghosted Users)

1. **Download and install** the Ghost Socket desktop application
2. **Run the application** - it will appear in the system tray
3. **Sign in** with your credentials when prompted
4. **Share your device ID** with authorized users
5. **Manage permissions** through the application interface

### For Remote Controllers (Ghost Users)

1. **Visit the Ghost Socket website**
2. **Sign in** to your account
3. **Add devices** using the device IDs shared with you
4. **Connect and control** authorized devices
5. **Manage sessions** and permissions as needed

## 🔒 Security Features

- **End-to-end encryption** for all communications
- **Permission-based access control**
- **Session management and logging**
- **Secure authentication via Clerk**
- **Device verification and authorization**

## 🛠️ Development

### Project Structure
```
ghost_socket/
├── application/          # Desktop application
│   ├── app.py           # Main application entry
│   ├── components/      # UI components
│   ├── controllers/     # Business logic
│   ├── assets/          # Images and resources
│   └── webrtc-env/      # Python virtual environment
├── frontend/            # Web application
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   └── components.json # UI component config
├── server/             # Backend server
│   ├── index.js        # Server entry point
│   └── package.json    # Dependencies
└── test/              # Test files
```

### Available Scripts

**Desktop Application**:
- `python app.py` - Run the application
- `pyinstaller app.spec` - Build executable

**Frontend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

**Server**:
- `npm start` - Start the server
- `npm run dev` - Start with nodemon

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. **Check the Issues** section on GitHub
2. **Create a new issue** with detailed information
3. **Contact support** via [your-email@example.com]

## 🚧 Roadmap

- [ ] Cross-platform desktop application (macOS, Linux)
- [ ] Mobile app support
- [ ] Enhanced file transfer capabilities
- [ ] Multi-monitor support
- [ ] Audio streaming
- [ ] Screen recording functionality
- [ ] Clipboard synchronization

## 🙏 Acknowledgments

- **CustomTkinter** for the modern Python GUI framework
- **Next.js** for the powerful React framework
- **Socket.IO** for real-time communication
- **Clerk** for authentication services
- **WebRTC** for peer-to-peer connections

---

**⚠️ Important**: This tool should only be used on devices you own or have explicit permission to access. Unauthorized access to computer systems is illegal and unethical.