# TwinAI - Predictive Life Monitoring System

## Overview

TwinAI is a hackathon-ready SaaS web application that provides predictive life monitoring for machine-critical spare parts with real-time automation. The system focuses on monitoring critical CNC components like ball screws, LM guideways, tool magazines, and spindle motors. It predicts remaining component life based on operating hours and load factors, providing visual dashboards and automated WhatsApp alerts when maintenance thresholds are breached.

### Latest Updates (January 13, 2025)
- **REAL-TIME ENGINE ACTIVATED**: Automated 30-second interval monitoring with live WhatsApp notifications
- **CSV DATA INTEGRATION**: Successfully loaded 59 critical spare parts from real inventory data
- **DUAL DASHBOARD SYSTEM**: Machine monitoring + Critical spares inventory management
- **LIVE WHATSAPP ALERTS**: Working notifications to +918248286007 for critical conditions
- **AUTOMATED INVENTORY**: Real-time stock consumption simulation and maintenance logging

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent, modern design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for API endpoints
- **Development Setup**: Vite for fast development with Hot Module Replacement (HMR)
- **API Design**: RESTful endpoints for machine CRUD operations and wear simulation
- **Build Process**: ESBuild for production bundling with Node.js compatibility

### Data Storage Solutions
- **Development Storage**: In-memory storage using Map data structures for rapid prototyping
- **Database Schema**: Drizzle ORM with PostgreSQL schema definitions for future scalability
- **Data Models**: Machine entities with properties like name, component type, remaining life percentage, operating hours, and load factor

### Machine Learning Logic
- **Prediction Model**: Simple wear calculation using formula: Remaining Life % = Initial Life % - (Hours × Load Factor × Wear Rate)
- **Simulation Engine**: Wear simulation endpoint that updates all machines and triggers alerts
- **Threshold Monitoring**: Automatic alert generation when remaining life drops below 30%

### Alert System Architecture
- **WhatsApp Integration**: Twilio WhatsApp API for real-time maintenance alerts
- **Alert Storage**: Database tracking of sent alerts with WhatsApp delivery status
- **Alert Categorization**: Critical (< 30%), Warning (30-60%), and Healthy (> 60%) status levels

## External Dependencies

### Third-party Services
- **Twilio WhatsApp API**: Real-time alert delivery service
  - Account SID and Auth Token for authentication
  - Sandbox environment for development testing
  - Message formatting and delivery tracking

### Database Integration
- **Neon Database**: PostgreSQL provider with serverless architecture
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Connection Pooling**: Efficient database connection management

### UI Component Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Recharts**: Data visualization library for system overview charts
- **Lucide React**: Icon library for consistent visual elements

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **Vite**: Development server with hot reload capabilities
- **TypeScript**: Type checking and enhanced developer experience
- **TanStack React Query**: Server state synchronization and caching

### Styling and Design
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **CSS Variables**: Dynamic theming support with design tokens
- **PostCSS**: CSS processing with autoprefixer for browser compatibility