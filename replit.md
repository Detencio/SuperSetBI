# Overview

**supersetBI** is a comprehensive Business Intelligence (BI) dashboard application built with full-stack architecture. The system provides comprehensive business analytics including inventory management, sales tracking, collection management, and advanced AI-powered business consulting. It features a modern React frontend with shadcn/ui components and an Express.js backend with full PostgreSQL database integration using Drizzle ORM for persistent data storage. The application now includes a sophisticated AI assistant with persistent chat history for intelligent business insights and recommendations.

# User Preferences
Preferred communication style: Simple, everyday language.
All responses must be in **SPANISH**.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite.
- **UI Library**: shadcn/ui components built on Radix UI.
- **Styling**: Tailwind CSS with custom design tokens.
- **State Management**: TanStack Query for server state.
- **Routing**: Wouter.
- **Charts**: Recharts for data visualization.

## Backend Architecture
- **Framework**: Express.js with TypeScript.
- **Runtime**: Node.js with ESM modules.
- **API Design**: RESTful API.
- **Build**: esbuild for production bundling.

## Data Storage Strategy
- **Production Implementation**: PostgreSQL database using Neon Database serverless platform.
- **DatabaseStorage Class**: Complete implementation with all CRUD operations for multi-tenant data.
- **Multi-Tenant Architecture**: Company-scoped data isolation using `companyId` for all business data.
- **Data Persistence**: All data persists between server restarts and deployments.
- **AI Chat System Database**: Dedicated `chat_conversations` and `chat_messages` tables with full persistence.
- **Schema Management**: Centralized schema definitions in shared folder with multi-tenant relationships and type safety.
- **Chat Conversation Schema**: Full relational design with conversation management, message tracking, and token counting.

## Authentication & Security
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions.
- **Type Safety**: Shared TypeScript types between frontend and backend.
- **Input Validation**: Drizzle-zod for runtime schema validation.
- **Data Isolation**: Multi-tenant security with company-scoped data access.

## Module Structure
The application is organized into distinct business modules with multi-tenant support and advanced filtering:
- **Dashboard**: Executive overview and KPIs.
- **Inventory**: Product management with KPIs, ABC analysis, alerts, recommendations, and advanced filtering.
- **Collections**: Payment tracking and customer management.
- **Sales**: Transaction recording and sales analytics.
- **Company Management**: Multi-tenant administration, user management, and invitations.
- **Data Management**: Data import (CSV/Excel) with template downloads and file validation.

## Advanced Features
- **AI Assistant**: Comprehensive AI-powered business intelligence assistant using Google Gemini 2.5 Flash model with:
  - Persistent chat conversation history stored in PostgreSQL
  - Real-time business data integration (inventory, sales, collections)
  - Advanced markdown message formatting with overflow control
  - Multi-tenant conversation isolation with company context
  - Token optimization through conversation history management
  - Professional UI with conversation management (create, load, delete conversations)
  - Context-aware responses based on current business metrics and historical data
- **Advanced Data Filtering**: Comprehensive filtering engine with dynamic types and smart segmentation across modules.
- **Multi-Company/Tenant Management**: Full tenant isolation with company creation, user roles (super_admin, company_admin, manager, user, viewer), and invitation system.
- **Advanced Inventory Features**: KPIs (ROI, turnover, service level, days of inventory, liquidity index), intelligent alerts, smart recommendations, and ABC analysis.
- **Mobile Responsive Design**: Fully responsive across all modules and screen sizes.

# External Dependencies

## AI & Machine Learning
- **Google Gemini AI 2.5 Flash**: Advanced language model for business intelligence analysis and conversational AI.
- **Real-Time Data Integration**: AI assistant has direct access to live business data for contextual responses.
- **Conversation Management**: Complete chat history persistence with PostgreSQL integration.
- **Token Optimization**: Smart conversation tracking to reduce API costs and improve response quality.
- **Business Context Processing**: AI analyzes inventory levels, sales patterns, and collection status for personalized insights.

## Database & ORM
- **Neon Database**: Serverless PostgreSQL database actively used in production with full data persistence.
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect fully implemented.
- **Drizzle Kit**: Database migration and management tools deployed in production.
- **Chat System Tables**: Dedicated schema for AI conversation persistence with `chat_conversations` and `chat_messages` tables.
- **Multi-Tenant Database**: All tables include company-scoped isolation for secure multi-tenant operations.

## UI & Styling
- **Radix UI**: Low-level UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Recharts**: Chart library for data visualization.
- **Lucide React**: Icon library.

## Development Tools
- **Vite**: Build tool with HMR.
- **TypeScript**: Static type checking.
- **ESBuild**: Fast JavaScript bundler.

## Utility Libraries
- **TanStack Query**: Server state synchronization and caching.
- **date-fns**: Date manipulation.
- **clsx/tailwind-merge**: Dynamic className composition.
- **wouter**: Minimal routing solution.
- **Google Gemini API (@google/genai)**: Complete AI assistant implementation with business intelligence capabilities.
- **AI Service Layer**: Comprehensive business data analysis, inventory insights, and conversational AI.
- **Context-Aware Processing**: Real-time integration with business data for personalized AI responses.