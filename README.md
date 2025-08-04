# TenMil Fleet Management System

A comprehensive Computerized Maintenance Management System (CMMS) for managing fleet assets, maintenance schedules, and operations.

## 🚀 Features

### Core Modules
- **Asset Management**: Track equipment and attachments with detailed specifications
- **Work Order Management**: Create, assign, and track maintenance tasks
- **Parts Inventory**: Manage spare parts and consumables
- **Purchase Orders**: Handle procurement and vendor management
- **Billing**: Track costs and generate financial reports
- **Analytics & Reports**: Comprehensive reporting and data visualization
- **User Management**: Role-based access control and multi-tenant support

### Key Capabilities
- Real-time fleet status monitoring
- Preventive maintenance scheduling
- Asset lifecycle tracking
- Document and file management
- Multi-location support
- Customizable forms and workflows

## 📋 Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Modern web browser

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/tenmil/fleet-management.git
cd fleet-management
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
VITE_API_BASE_URL=https://your-api-url.com/v1/api
VITE_ENABLE_MOCK_DATA=false
VITE_APP_NAME="TenMil Fleet Management"
```

5. Start the development server:
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | - |
| `VITE_ENABLE_MOCK_DATA` | Enable mock data for development | `false` |
| `VITE_APP_NAME` | Application name | `TenMil Fleet Management` |
| `VITE_TENANT_MODE` | Enable multi-tenant mode | `true` |
| `VITE_DEFAULT_LOCALE` | Default language | `en` |

### API Endpoints

The application expects the following API endpoints:

- `/auth/*` - Authentication endpoints
- `/assets/*` - Asset management
- `/work-orders/*` - Work order management
- `/parts/*` - Parts inventory
- `/purchase-orders/*` - Purchase orders
- `/billing/*` - Billing and invoicing
- `/analytics/*` - Reports and analytics
- `/users/*` - User management
- `/company/*` - Company settings

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn)
│   └── ...             # Feature-specific components
├── contexts/           # React contexts for global state
├── data/              # Form configurations and static data
├── hooks/             # Custom React hooks
├── lib/               # Utilities and helpers
├── pages/             # Page components (routes)
├── services/          # API service layer
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── App.tsx            # Main application component
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 🚀 Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📦 Deployment

The application can be deployed to any static hosting service:

### Docker
```bash
docker build -t tenmil-fleet .
docker run -p 80:80 tenmil-fleet
```

### Traditional Hosting
1. Run `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure your web server to serve `index.html` for all routes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- We use ESLint and Prettier for code formatting
- Run `npm run lint` before committing
- Follow the TypeScript strict mode guidelines

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, email support@tenmil.com or create an issue in the repository.

## 🔗 Links

- [Documentation](https://docs.tenmil.com)
- [API Reference](https://api-docs.tenmil.com)
- [User Guide](https://guide.tenmil.com)