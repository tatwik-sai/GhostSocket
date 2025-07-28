# **GhostSocket**
**Secure Remote Desktop Control & Management Platform**

GhostSocket is a comprehensive remote desktop solution that allows you to securely access and control your computers from anywhere in the world all from Browser. Perfect for IT support, system administration, or personal remote access needs.

**Website:** [GhostSocket](https://ghost-socket.vercel.app)
> **Note:** Disable Antivirus and firewall for the application to function properly

## Table of Contents

- [**GhostSocket**](#ghostsocket)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Creating Access Sessions](#creating-access-sessions)
  - [Run Locally](#run-locally)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
      - [Install Nodejs packadges](#install-nodejs-packadges)
      - [Create .env.local file with following entries](#create-envlocal-file-with-following-entries)
      - [Start the development server](#start-the-development-server)
      - [Create and activate a virtual environment](#create-and-activate-a-virtual-environment)
      - [Install the requirements](#install-the-requirements)
      - [Edit the config file](#edit-the-config-file)
      - [Run the application](#run-the-application)
  - [Features](#features)
    - [Core Functionality](#core-functionality)
    - [Access Permissions](#access-permissions)
    - [Security Features](#security-features)
  - [Architecture](#architecture)
    - [Technology Stack](#technology-stack)
    - [Network Protocols](#network-protocols)
  - [Important Security Notes](#important-security-notes)
    - [Firewall \& Antivirus Configuration](#firewall--antivirus-configuration)
    - [Usage Warnings](#usage-warnings)
  - [Project Structure](#project-structure)
  - [Development](#development)
    - [Running in Development Mode](#running-in-development-mode)
    - [Building for Production](#building-for-production)
      - [Install nutika](#install-nutika)
      - [Bundel to exe](#bundel-to-exe)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contant Me](#contant-me)
  
## Getting Started

1. **Create Account**: Visit [GhostSocket](https://ghost-socket.vercel.app) and sign up for a new account
2. **Download Desktop App:** After login, download the desktop application.
3. **SignIn & Set Permissions:** SignIn to the app with the credentials you used in website.
4. **Configure Permissions:** Set access permissions in the desktop application and save.
5. **Start Remote Control:** Access your devices from the web interface under **My Devices**.
6. **Configure Multiple Devices:** You can Download any number of devices to access them Remotely
> **Note:** Disable Antivirus and firewall for the application to function properly.

### Creating Access Sessions

1. Navigate to **My Devices**
2. Click on **Options** select **New Session**
4. Configure **Permissions** and **Expiry** settings
5. Share the **Session Key** with authorized users
6. The One with key can control the device with alloted permissions
> **Note:** You can kill the session at any time.

## Run Locally
### Prerequisites
- [**Node.js**](https://nodejs.org/en/download) v18.0.0 or higher
- [**Python**](https://www.python.org/downloads/release/python-31011/) 3.10.11
- [**MongoDB**](https://cloud.mongodb.com/)
- [**Ngrok**](https://ngrok.com/downloads/windows?tab=download)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/tatwik-sai/GhostSocket.git
   cd ghostsocket
   ```

2. **Backend Setup**
    
    Install Nodejs Dependencies
    ```bash
    cd server
    npm install
    ```

    #### GMail Setup
    - Create an [App Password](https://myaccount.google.com/apppasswords) for any of your account.
    - This is the account from which emails are sent to the user.

    #### Ngrok Setup
    - Create an account and download [Ngrok](https://ngrok.com/)
    - Open cmd and run the following commands (Get the credentials from website)
  
      ```bash
      ngrok config add-authtoken <YOUR_AUTH_TOKEN>
      ```
    - Choose the Static Domain and run the command

      ```bash
      ngrok http --url=<YOUR_STATIC_URL> 8747
      ```
    
    #### Clerk Setup
    - Create an account on [Clerk](https://clerk.com/)
    - Create a new application with email and google enabled
    - Copy and store the PUBLIC and SECRET key
    - Go to **Configure** > **Webhooks** 
    - Add a new endpoint with ngrok static url subscribe to user events and create.
    - Copy the **Signing Secret** provided.
  
    #### Environment Variables

    - Create .env file in this directory with following fields

      ```env
      CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
      CLERK_SECRET_KEY=<YOUR_CLERK_SECRET_KEY>
      CLERK_WEBHOOK_SIGNING_SECRET=<YOUR_CLERK_WEBHOOK_SIGNING_SECRET>

      PORT=8747
      ORIGIN=http://localhost:3000
      DATABASE_URL=<YOUR_DATABASE_URL>

      EMAIL_USER=<YOUR_GMAIL_ADDRESS>
      EMAIL_PASS=<YOUR_APP_PASSWORD>
      ```
    
    #### Start the server
    ```bash
    npm run dev
    ```
    

3. **Frontend Setup**
   #### Install Nodejs packadges
   ```bash
   cd ../frontend
   npm install
   ```

   #### Create .env.local file with following entries
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
   CLERK_SECRET_KEY=<YOUR_CLERK_SECRET_KEY>

   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/console
   NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/console

   NEXT_PUBLIC_SERVER_URL=http://localhost:8747
   NEXT_PUBLIC_APPLICATION_URL=<APPLICATION_EXECUTABLE_DOWNLOAD_URL>
   NEXT_PUBLIC_DEMO_URL=<DEMO_VIDEO_URL>
   ```

   #### Start the development server
   ```
   npm run dev
   ```

4. **Desktop Application Setup**
   
   #### Create and activate a virtual environment
   ```bash
   cd ../application
   python -m venv venv
   venv\Scripts\activate
   ```

   #### Install the requirements
   ```bash
   pip install -r requirements.txt
   ```

   #### Edit the config file
   ```python
   SERVER_URL = "http://localhost:8747"
   WEB_BASE = "http://localhost:3000"
   ```

   #### Run the application

   ```bash
   python main.py
   ```

## Features

### Core Functionality
- **Multi-Device Management**: Control multiple computers from a single web interface.
- **Session-Based Access**: Generate temporary access sessions with custom permissions.
- **Real-Time Control**: Live screen sharing with mouse and keyboard control.
- **Exceptional Security**: Complete data is encrypted and flows from peer to peer. 

### Access Permissions
1. **Device Profile** - View device information (OS, username, location, IP) and manage sessions
2. **File Management** - Browse, download, and delete files remotely
3. **Terminal Access** - Execute remote commands via command line
4. **Webcam Feed** - Live webcam streaming with snapshot capabilities
5. **Screen Control** - Real-time screen sharing with full mouse/keyboard control
6. **Resource Monitor** - Live CPU, memory usage, and process monitoring

### Security Features
- **End-to-End Encryption**: All live streams are fully encrypted
- **JWT Authentication**: Secure token-based authentication system
- **Peer-to-Peer Communication**: Direct connection between devices (no data stored on servers)
- **Permission-Based Access**: Granular control over what remote users can access
- **Session Management**: Create, modify, and terminate access sessions instantly

## Architecture

### Technology Stack
- **Frontend**: React with Next.js, Tailwind CSS
- **Backend**: Express.js with MongoDB, Clerk Authentication
- **Desktop App**: Python with Custom Tkinter
- **Real-time Communication**: WebSockets + WebRTC

### Network Protocols
- **HTTP**: CRUD operations and standard API communication
- **WebSockets**: Real-time data transfer and WebRTC signaling
- **WebRTC**: Live screen/webcam feeds and real-time control

## Important Security Notes

### Firewall & Antivirus Configuration
- **Disable Windows Defender**: Temporarily disable real-time protection during setup
- **Firewall Exceptions**: Add GhostSocket application to firewall exceptions
- **Network Access**: Allow the application through Windows security prompts

### Usage Warnings
**USE WITH EXTREME CAUTION**

- **Only use on devices you own or have explicit permission to access**
- **Never use on corporate or shared computers without proper authorization**
- **Always terminate sessions when not in use**
- **Regularly review and audit active sessions**
- **Keep the application updated to the latest security patches**
- **Use strong, unique passwords for your GhostSocket account**

## Project Structure

```
ghostsocket/
├── application/          # Python desktop application
│   ├── main.py          # Application entry point
│   ├── requirements.txt # Python dependencies
│   ├── config.py        # Configuration settings
│   └── ...
├── frontend/            # Next.js web application
│   ├── pages/           # Next.js pages
│   ├── components/      # React components
│   ├── package.json     # Node.js dependencies
│   └── ...
└── server/              # Express.js backend
    ├── routes/          # API routes
    ├── models/          # MongoDB models
    ├── middleware/      # Express middleware
    ├── package.json     # Node.js dependencies
    └── ...
```

## Development

### Running in Development Mode

1. **Backend**: `cd server && node index.js`
2. **Frontend**: `cd frontend && npm run dev`
3. **Desktop App**: `cd application && python main.py`

### Building for Production

1. **Frontend Build**:
   ```bash
   cd frontend
   npm run build
   npm start
   ```

2. **Desktop App Distribution**:
   #### Install nutika
   ```bash
   cd application
   pip install nuitka
   ```

   #### Bundel to exe
   ```bash
   python -m nuitka --standalone --onefile --include-data-dir=assets=assets --enable-plugin=tk-inter --windows-icon-from-ico=assets/icon.ico --windows-disable-console app.py
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contant Me
- **Issues**: [GitHub Issues](https://github.com/tatwik-sai/GhostSocket/issues)
- **Email**: molletitatwiksai@gmail.com
- [**Linkdin**](https://www.linkedin.com/in/tatwik-sai-molleti-0aa96931a/)


---

> **Remember**: Use GhostSocket ethically and only on systems you own or have explicit permission to access.