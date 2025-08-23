# Overview

**supersetBI** is a comprehensive Business Intelligence (BI) dashboard application built with a full-stack architecture. The system provides comprehensive business analytics including inventory management, sales tracking, and collection management. It features a modern React frontend with shadcn/ui components and an Express.js backend with full PostgreSQL database integration using Drizzle ORM for persistent data storage.

# User Preferences

Preferred communication style: Simple, everyday language.
All responses must be in **SPANISH**.

# Recent Changes

## PostgreSQL Database Integration Complete (August 23, 2025)
- **Full Database Migration**: Successfully migrated from in-memory storage to PostgreSQL (Neon Database)
- **DatabaseStorage Implementation**: Complete replacement of MemStorage with DatabaseStorage class
- **Schema Deployment**: All database tables created and operational in PostgreSQL
- **Data Persistence**: All application data now persists between server restarts
- **Multi-Tenant Database**: Company-scoped data isolation working with PostgreSQL
- **Demo Data Integration**: Demo data initialization working with real database
- **API Compatibility**: All endpoints now use PostgreSQL without breaking changes
- **Performance Optimization**: Database queries optimized for production use

## Data Management System Fixes (August 23, 2025)
- **Import Functionality Restored**: Fixed broken import buttons for products, sales, and customers
- **Template Downloads**: Added downloadable CSV templates for data import
- **File Upload Integration**: Implemented proper file upload handling for CSV and Excel files
- **API Request Fixes**: Corrected apiRequest function to handle FormData properly
- **Test Data Generator**: Fixed generation errors and improved reliability
- **User Interface Updates**: Updated data management page to reflect PostgreSQL status
- **Configuration Display**: Corrected system status to show PostgreSQL instead of "In Memory"
- **Migration Status**: Updated migration section to show completed status

## Application Stability Improvements (August 23, 2025)
- **TypeScript Error Resolution**: Fixed type safety issues across components
- **Query Client Enhancement**: Improved API request handling for different data types
- **Error Handling**: Enhanced error reporting and user feedback
- **UI Consistency**: Standardized component behavior and styling
- **Navigation Improvements**: Better user experience across all modules

## Advanced Data Filtering & Segmentation System Implementation (August 22, 2025)
- **Comprehensive Filter Engine**: Implemented complete advanced filtering system with dynamic filter types (text, select, number, date, boolean)
- **Smart Segmentation**: Added predefined segments for each module with one-click filtering (stock bajo, alto valor, ventas recientes, etc.)
- **Multi-Module Integration**: Deployed filtering system across inventory and sales modules with module-specific configurations
- **Filter Logic Engine**: Created sophisticated filter evaluation system with AND/OR operators and multiple comparison types
- **Real-Time Statistics**: Implemented live filtering statistics showing filtered count and percentage
- **Responsive UI Components**: Built compact and full filter interfaces with collapsible panels and intuitive controls
- **Configuration Management**: Centralized filter configurations with dynamic option generation from data
- **Export Integration**: Connected filtered data to export functionality maintaining data integrity

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
- **Production Implementation**: PostgreSQL database using Neon Database serverless platform
- **DatabaseStorage Class**: Complete implementation with all CRUD operations for multi-tenant data
- **Multi-Tenant Architecture**: Company-scoped data isolation with companyId-based data segregation
- **Data Persistence**: All data persists between server restarts and deployments
- **Schema Deployed**: Complete database schema created and operational in PostgreSQL
- **Schema Management**: Centralized schema definitions in shared folder with multi-tenant relationships and type safety

## Authentication & Security
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions (fully operational)
- **Database Security**: PostgreSQL with proper connection pooling and security measures
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Input Validation**: Drizzle-zod for runtime schema validation
- **Data Isolation**: Multi-tenant security with company-scoped data access

## Module Structure
The application is organized into distinct business modules with multi-tenant support and advanced filtering capabilities:
- **Dashboard**: Executive overview with KPIs and analytics (company-scoped)
- **Inventory**: Advanced product management with professional KPIs, ABC analysis, intelligent alerts, automated recommendations, and advanced filtering system (company-scoped)
- **Collections**: Payment tracking and customer management with filtering capabilities (company-scoped)
- **Sales**: Transaction recording and sales analytics with advanced filtering and segmentation (company-scoped)
- **Company Management**: Multi-tenant administration with company creation, user management, and invitation system
- **Data Management**: Complete data import system with CSV/Excel support, template downloads, and file validation (company-scoped)

Each module follows a consistent pattern with dedicated pages, API endpoints, reusable components, and integrated advanced filtering systems. All business data is properly isolated by company context and supports sophisticated data filtering and analysis.

## Advanced Inventory Features
- **Professional KPIs**: ROI, inventory turnover, service level, days of inventory, ABC distribution, liquidity index
- **Intelligent Alert System**: Multi-priority alerts for stock levels, expiration, and optimization opportunities
- **Smart Recommendations**: Automated suggestions for replenishment and liquidation based on business rules
- **ABC Analysis**: Product classification by value and impact with visual distribution
- **Advanced Analytics**: Comprehensive performance metrics and trend analysis
- **Multi-criteria Filtering**: Search by name, SKU, category, and stock status

# External Dependencies

## Database & ORM
- **Neon Database**: Serverless PostgreSQL database (actively used in production)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect (fully implemented)
- **Drizzle Kit**: Database migration and management tools (deployed)
- **Database Connection**: Pool-based connections with proper error handling and optimization

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

The architecture has been successfully migrated to a full PostgreSQL setup with all database configurations operational and data persistence working across the entire application.

## Documentation and Setup
- **Complete Technical Documentation**: Comprehensive guides covering functional, technical, and architectural aspects
- **Database Migration Completed**: PostgreSQL integration successfully implemented and operational
- **Professional Testing Environment**: Complete testing setup with data seeding and API validation
- **Production Deployment Ready**: PostgreSQL-based configuration deployed and tested
- **Advanced KPI Calculations**: Professional algorithms for inventory optimization and business intelligence
- **Import System**: Full CSV/Excel import functionality with template generation
- **Data Persistence**: All business data properly stored in PostgreSQL with multi-tenant isolation