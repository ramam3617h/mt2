# Multitenant Application Backend

Express.js backend with tenant context resolution and database isolation.

## Features

- Tenant context resolution from subdomains
- Database-level tenant isolation with RLS
- Tenant management APIs
- Tenant-specific data APIs
- Caching for improved performance

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

## API Endpoints

### Tenant Management
- `GET /api/tenants/current` - Get current tenant info
- `PUT /api/tenants` - Update tenant
- `POST /api/tenants/create` - Create new tenant
- `GET /api/tenants/configurations` - Get tenant configurations
- `POST /api/tenants/configurations` - Set tenant configuration
- `GET /api/tenants/users` - Get tenant users
- `POST /api/tenants/users` - Add user to tenant
- `DELETE /api/tenants/users/:userId` - Remove user from tenant

### Tenant Data
- `GET /api/data` - Get tenant data
- `POST /api/data` - Create tenant data
- `PUT /api/data/:id` - Update tenant data
- `DELETE /api/data/:id` - Delete tenant data

## Tenant Resolution

The middleware resolves tenant context from:
1. `X-Tenant-Subdomain` header (priority)
2. Subdomain from host (e.g., `tenant1.example.com`)

## Architecture

- **TenantContextManager**: Service for tenant operations with caching
- **tenantResolver**: Middleware for tenant context resolution
- **Routes**: RESTful APIs for tenant and data management
