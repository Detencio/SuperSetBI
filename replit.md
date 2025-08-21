# Overview

This is a Business Intelligence (BI) dashboard application built with a full-stack architecture. The system provides comprehensive business analytics including inventory management, sales tracking, and collection management. It features a modern React frontend with shadcn/ui components and an Express.js backend with in-memory storage that's designed to be easily migrated to PostgreSQL using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Mobile Responsive Design Implementation (August 21, 2025)
- Updated all pages (Dashboard, Inventory, Collections, Sales) to be fully responsive
- Implemented collapsible sidebar for mobile with overlay functionality
- Added mobile-optimized layout with responsive grid systems
- Enhanced table designs for mobile viewing with hidden/collapsed columns
- Improved button and form layouts for touch interfaces
- All components now scale properly from mobile (sm) to desktop (lg) breakpoints

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for a Superset BI-inspired theme
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts library for data visualization

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **API Design**: RESTful API architecture with proper error handling middleware
- **Development**: Hot reloading with Vite integration in development mode
- **Build**: esbuild for production bundling

## Data Storage Strategy
- **Current Implementation**: In-memory storage using Map data structures for development
- **Migration Ready**: Drizzle ORM schema definitions prepared for PostgreSQL transition
- **Database Prepared**: Neon Database serverless PostgreSQL connection configured
- **Schema Management**: Centralized schema definitions in shared folder for type safety

## Authentication & Security
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions (when database is connected)
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Input Validation**: Drizzle-zod for runtime schema validation

## Module Structure
The application is organized into distinct business modules:
- **Dashboard**: Executive overview with KPIs and analytics
- **Inventory**: Product management and stock control
- **Collections**: Payment tracking and customer management
- **Sales**: Transaction recording and sales analytics

Each module follows a consistent pattern with dedicated pages, API endpoints, and reusable components.

# External Dependencies

## Database & ORM
- **Neon Database**: Serverless PostgreSQL database (configured but not actively used)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Drizzle Kit**: Database migration and management tools

## UI & Styling
- **Radix UI**: Comprehensive set of low-level UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Chart library built on D3 for data visualization
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Build tool with HMR and development server
- **TypeScript**: Static type checking across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimization plugins

## Utility Libraries
- **TanStack Query**: Server state synchronization and caching
- **date-fns**: Date manipulation and formatting
- **clsx/tailwind-merge**: Dynamic className composition
- **wouter**: Minimal routing solution

The architecture is designed for easy migration from the current in-memory storage to a full PostgreSQL setup, with all necessary database configurations and schema definitions already in place.