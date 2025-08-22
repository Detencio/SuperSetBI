# Overview

**supersetBI** is a comprehensive Business Intelligence (BI) dashboard application built with a full-stack architecture. The system provides comprehensive business analytics including inventory management, sales tracking, and collection management. It features a modern React frontend with shadcn/ui components and an Express.js backend with in-memory storage that's designed to be easily migrated to PostgreSQL using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Multi-Company/Tenant Management System Implementation (August 22, 2025)
- **Complete Multi-Tenancy Architecture**: Implemented comprehensive multi-company management system with full tenant isolation
- **Database Schema Enhancement**: Added companyId fields to all existing tables for proper data segregation
- **Company Service Layer**: Created robust company management service with company creation, user management, and invitation system
- **Company Management Interface**: Built complete frontend interface for company administration with tabbed views
- **Role-Based Access Control**: Implemented user role management within companies (super_admin, company_admin, manager, user, viewer)
- **Company Invitation System**: Added secure invitation mechanism with token-based acceptance and expiration
- **Company Statistics**: Integrated usage analytics including user count, storage usage, and subscription tracking
- **Navigation Integration**: Added company management to application sidebar with proper routing
- **API Endpoints**: Complete RESTful API for company CRUD operations, user management, and invitation handling
- **Demo Company Creation**: Added one-click demo company setup for development and testing

## Advanced Inventory Module Enhancement (August 22, 2025)
- **Professional KPIs Implementation**: Added advanced metrics including inventory turnover, service level, days of inventory, liquidity index, and inventory accuracy
- **ABC Analysis System**: Implemented product classification by value and business impact
- **Intelligent Alert System**: Created comprehensive alert mechanism with priority levels (critical, high, medium, low)
- **Smart Recommendations**: Developed automatic suggestions for replenishment and liquidation based on stock levels
- **Advanced Analytics Dashboard**: Built tabbed interface with Products, Alerts, Analytics, and Recommendations sections
- **Enhanced Filtering**: Added multi-criteria search and filtering by category, stock status, and other parameters
- **Professional Components**: Created reusable InventoryKPIs and InventoryAlerts components
- **Backend Analytics Engine**: Implemented inventory-utils.ts with professional calculation algorithms
- **API Enhancement**: Added new endpoints for /api/inventory/analytics and /api/inventory/alerts

## Project Documentation (August 22, 2025)
- **Complete Technical Documentation**: Created comprehensive DOCUMENTATION.md covering functional and technical aspects
- **Database Migration Guide**: Detailed DATABASE_SETUP.md with step-by-step PostgreSQL integration instructions
- **Professional README**: Created user-friendly README.md with quick start guide
- **Stack Documentation**: Documented complete technology stack and architecture decisions
- **Testing Environment Setup**: Provided complete testing configuration and data seeding instructions

## Project Name Update (August 22, 2025)
- Updated project name from DataVista to supersetBI
- Updated HTML title and meta description to reflect new branding
- Maintained consistent "Superset" branding throughout the application
- Fixed sidebar duplication issue ensuring only one menu appears

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
- **Current Implementation**: In-memory storage using Map data structures for development with multi-tenant support
- **Multi-Tenant Architecture**: Company-scoped data isolation with companyId-based data segregation
- **Migration Ready**: Drizzle ORM schema definitions prepared for PostgreSQL transition with tenant support
- **Database Prepared**: Neon Database serverless PostgreSQL connection configured for production deployment
- **Schema Management**: Centralized schema definitions in shared folder with multi-tenant relationships and type safety

## Authentication & Security
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions (when database is connected)
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Input Validation**: Drizzle-zod for runtime schema validation

## Module Structure
The application is organized into distinct business modules with multi-tenant support:
- **Dashboard**: Executive overview with KPIs and analytics (company-scoped)
- **Inventory**: Advanced product management with professional KPIs, ABC analysis, intelligent alerts, and automated recommendations (company-scoped)
- **Collections**: Payment tracking and customer management (company-scoped)
- **Sales**: Transaction recording and sales analytics (company-scoped)
- **Company Management**: Multi-tenant administration with company creation, user management, and invitation system
- **Data Management**: Enhanced data ingestion and import system (company-scoped)

Each module follows a consistent pattern with dedicated pages, API endpoints, and reusable components. All business data is properly isolated by company context.

## Advanced Inventory Features
- **Professional KPIs**: ROI, inventory turnover, service level, days of inventory, ABC distribution, liquidity index
- **Intelligent Alert System**: Multi-priority alerts for stock levels, expiration, and optimization opportunities
- **Smart Recommendations**: Automated suggestions for replenishment and liquidation based on business rules
- **ABC Analysis**: Product classification by value and impact with visual distribution
- **Advanced Analytics**: Comprehensive performance metrics and trend analysis
- **Multi-criteria Filtering**: Search by name, SKU, category, and stock status

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

## Documentation and Setup
- **Complete Technical Documentation**: Comprehensive guides covering functional, technical, and architectural aspects
- **Database Migration Ready**: Step-by-step instructions for PostgreSQL integration with automated migration scripts
- **Professional Testing Environment**: Complete testing setup with data seeding and API validation
- **Production Deployment Guide**: Ready-to-deploy configuration for multiple cloud providers
- **Advanced KPI Calculations**: Professional algorithms for inventory optimization and business intelligence