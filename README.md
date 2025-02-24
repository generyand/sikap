# Sikap - Smart Daily Planner & Task Manager

<div align="center">
  <img src="resources/icon.png" alt="Sikap Logo" width="200"/>
</div>

## Overview

Sikap is a powerful cross-platform smart daily planner and task management application designed to streamline your daily productivity. It combines intelligent scheduling with task management capabilities, providing a seamless experience for organizing your day-to-day activities. Built with modern technologies and cloud synchronization, Sikap helps you stay on top of your schedule and tasks effortlessly.

## Features

- 🖥️ Cross-platform support (Windows, macOS, Linux)
- 🔄 Cloud synchronization with Supabase
- 📱 Responsive and modern UI
- 🌙 Dark mode support
- 🚀 Offline-first architecture
- 🔒 Secure data handling
- ⭐ Task Prioritization
- 📅 Due Dates & Recurring Tasks
- 🗓️ Calendar Integration
  - Unified scheduling with Google Calendar
  - Intuitive drag-and-drop scheduling
- 🔔 Smart Reminders & Notifications

## Tech Stack

- **Frontend**:
  - ReactJS - UI Framework
  - TailwindCSS - Styling
  - ElectronJS - Desktop Application Framework

- **Backend**:
  - ExpressJS - API Server
  - Prisma - Database ORM
  - Supabase - Backend as a Service

## Installation

1. Clone the repository:
```bash
git clone https://github.com/generyand/sikap.git
cd sikap
```

2. Install pnpm (if not already installed):
```bash
npm install -g pnpm
```

3. Install dependencies:
```bash
pnpm install
```

4. Start the development server:
```bash
npm run dev
```

## Building the Application

### For Windows:
```bash
npm run build:win
```

### For macOS:
```bash
npm run build:mac
```

### For Linux:
```bash
npm run build:linux
```

## Development

### Project Structure
```
sikap/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # Preload scripts
│   └── renderer/       # React application
├── resources/          # Application resources
└── build/             # Build configurations
```

### Available Scripts

- `npm run dev` - Start the application in development mode
- `npm run build` - Build the application
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [electron-vite](https://electron-vite.org/)
- Powered by [Electron](https://www.electronjs.org/)
- Database hosting by [Supabase](https://supabase.com/)

---

<div align="center">
  Made with ❤️ by Gene Ryan
</div>
