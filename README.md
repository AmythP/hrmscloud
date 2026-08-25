# HRMS Cloud

A modern Human Resource Management System built with cutting-edge web technologies for cloud-based HR operations.

## Tech Stack

- **Frontend Framework**: [TanStack Start](https://tanstack.com/start) with React 19
- **Language**: TypeScript (97%)
- **Styling**: Tailwind CSS with custom animations
- **Routing**: TanStack Router
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Form Management**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **Hosting**: Cloudflare

## Key Features

- **Responsive UI**: Built with Radix UI components for accessible, customizable interfaces
- **Data Management**: Server-side query caching with React Query
- **Form Validation**: Type-safe forms with Zod schema validation
- **Rich Interactions**: Embla carousel, resizable panels, tooltips, and toast notifications
- **Command Palette**: Integrated command menu for improved navigation
- **Date Handling**: Robust date utilities with date-fns
- **Charts & Analytics**: Real-time data visualization with Recharts

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port specified by Vite).

### Building

Build for production:

```bash
npm run build
```

Build in development mode:

```bash
npm run build:dev
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
├── src/               # Source code
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## Available Scripts

- `dev` - Start development server with hot module replacement
- `build` - Build for production with optimizations
- `build:dev` - Build for development
- `preview` - Preview production build locally
- `lint` - Run ESLint to check code quality
- `format` - Format code with Prettier

## Code Quality

The project uses ESLint and Prettier for consistent code style:

```bash
# Lint the codebase
npm run lint

# Format all files
npm run format
```

## Dependencies Highlights

### UI & Components
- `@radix-ui/*` - Unstyled, accessible UI primitives
- `lucide-react` - Beautiful icon library
- `embla-carousel-react` - Carousel component

### Forms & Validation
- `react-hook-form` - Performant form management
- `@hookform/resolvers` - Form resolver support
- `zod` - TypeScript-first schema validation

### State & Server Communication
- `@tanstack/react-query` - Server state management
- `@tanstack/react-router` - File-based routing

### Utilities & Styling
- `tailwindcss` - Utility-first CSS framework
- `date-fns` - Modern date utility library
- `recharts` - React charting library
- `sonner` - Toast notifications

## Configuration Files

### Vite Configuration
The project is configured with Cloudflare's Vite plugin for hosting on Cloudflare Pages/Workers.

### TypeScript Configuration
Strict TypeScript configuration for type safety throughout the application.

## Environment

- **Repository Status**: Active Development
- **Visibility**: Private
- **Default Branch**: `main`
- **Last Updated**: May 24, 2026

## License

No specific license set. For licensing inquiries, please contact the repository owner.

## Contributing

For questions or contributions, please reach out to the repository owner.

---

**Built with ❤️ by AmythP**
