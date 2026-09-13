# Blessing E-Shop Frontend

This is the frontend application for the Blessing E-Shop platform. It provides a fast, responsive shopping experience for customers and a management interface for administrators. It is fully integrated with the Blessing backend API.

## Tech Stack
- **Framework:** React 19
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Bundler:** Vite 8

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (Package manager used for this project)

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd eshop-frontend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Environment Variables
Create a `.env` file in the root of the `eshop-frontend` directory. Specify your backend API URL so the frontend knows where to fetch data:
```env
VITE_API_URL=http://localhost:4000/api
```

### Running the Application
Start the Vite development server:
```bash
pnpm run dev
```
The application will be available at `http://localhost:8443` (or the port output in your terminal).

## Available Scripts
- `pnpm run dev`: Starts the local development server.
- `pnpm run build`: Compiles and bundles the application for production into the `dist/` folder.
- `pnpm run preview`: Previews the production build locally.
- `pnpm run format`: Formats the codebase.

## Project Structure
- `src/components/`: Reusable UI components (e.g., `Header.tsx`, `Cart.tsx`, `ProductCard.tsx`).
- `src/pages/`: Top-level page views (e.g., `Home.tsx`, `Shop.tsx`, `Checkout.tsx`, and the `admin/` portal).
- `src/services/`: Centralized API integration and HTTP requests (`api.ts`, `admin.ts`).
- `src/contexts/`: React context providers for global state (e.g., `AuthContext`).
- `src/data.ts`: Shared TypeScript interfaces (`Product`, `Category`, `CartItem`) that strictly mirror the backend Prisma schema.
