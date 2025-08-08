# Flex Living Reviews Dashboard

A comprehensive review management system for Flex Living properties that integrates with Hostaway API and provides managers with powerful tools to assess property performance and manage guest reviews.

## Technology Stack

### Frontend Framework: Next.js 14 with App Router
**Why chosen:**
- **Full-stack capabilities**: API routes eliminate need for separate backend
- **Server-side rendering**: Better SEO and performance for public review pages
- **App Router**: Modern file-based routing with layouts and streaming
- **TypeScript support**: Built-in type safety and developer experience
- **Production-ready**: Deployed by Vercel with excellent performance optimizations

### Styling: Tailwind CSS + shadcn/ui
**Why chosen:**
- **Rapid development**: Utility-first CSS for fast prototyping
- **Consistent design**: Pre-built component library (shadcn/ui) with professional aesthetics
- **Customizable**: Easy theming and brand alignment for Flex Living
- **Performance**: Purged CSS bundle, only includes used styles
- **Developer experience**: IntelliSense support and responsive design utilities

### Database: Prisma ORM + PostgreSQL
**Why chosen:**
- **Type safety**: Generated TypeScript types from database schema
- **Migration system**: Version-controlled database schema changes
- **Query builder**: Intuitive API with excellent performance
- **Local development**: Easy setup with Docker or local PostgreSQL
- **Production ready**: Supports connection pooling and optimization

### State Management: Zustand
**Why chosen:**
- **Lightweight**: Minimal boilerplate compared to Redux
- **TypeScript native**: Excellent type inference and safety
- **Simple API**: Easy to learn and implement
- **Performance**: Selective subscriptions prevent unnecessary re-renders
- **DevTools**: Excellent debugging capabilities

### UI Components: Radix UI + Lucide React
**Why chosen:**
- **Accessibility**: WAI-ARIA compliant components out of the box
- **Headless**: Unstyled components allow custom design implementation
- **Keyboard navigation**: Full keyboard support for all interactive elements
- **Screen reader support**: Semantic HTML and proper ARIA attributes
- **Icon library**: Consistent, professional icon set (Lucide React)

### Data Visualization: Recharts
**Why chosen:**
- **React native**: Built specifically for React applications
- **Responsive**: Mobile-friendly charts with touch interactions
- **Customizable**: Extensive theming and styling options
- **Performance**: Optimized rendering for large datasets
- **TypeScript support**: Full type definitions included

### Date Handling: date-fns
**Why chosen:**
- **Tree-shakable**: Import only needed functions, reducing bundle size
- **Immutable**: Pure functions prevent date mutation bugs
- **Timezone support**: Proper handling of international properties
- **Performance**: Faster than Moment.js with smaller footprint
- **TypeScript**: Full type safety for date operations

## Architecture Decisions

### API Integration Strategy
```
Hostaway API → Data Normalization Layer → Database → Dashboard
                                   ↓
                       Foursquare Places API (Optional)
```

**Benefits:**
- **Data consistency**: Single source of truth after normalization
- **Performance**: Cached data reduces API calls
- **Reliability**: Graceful fallback to mock data during API issues
- **Scalability**: Background sync jobs for large datasets

### Component Architecture
```
Pages (App Router) → Layout Components → Feature Components → UI Components
```

**Benefits:**
- **Reusability**: Shared components across manager and public interfaces
- **Maintainability**: Clear separation of concerns
- **Testing**: Isolated components enable focused unit tests
- **Performance**: Code splitting at route level

### Data Flow Pattern
```
API Routes → Services → Database → React Query → Components
```

**Benefits:**
- **Caching**: React Query handles data fetching and caching
- **Optimistic updates**: Immediate UI feedback for manager actions
- **Error handling**: Centralized error states and retry logic
- **Real-time sync**: Background refetching keeps data current

## Key Features

### Manager Dashboard
- **Property Performance Analytics**: Rating trends, review volume, category breakdowns
- **Advanced Filtering**: By date range, rating, channel, property, guest type
- **Bulk Actions**: Approve/reject multiple reviews simultaneously
- **Issue Detection**: Automated flagging of negative patterns
- **Export Capabilities**: CSV export for external analysis

### Public Review Display
- **Approved Reviews Only**: Manager-curated content for public display
- **Responsive Design**: Mobile-optimized layout matching Flex Living style
- **Performance Optimized**: Server-side rendering with caching
- **SEO Friendly**: Structured data markup for search engines

### Data Management
- **Real-time Sync**: Automated Hostaway API synchronization
- **Conflict Resolution**: Handles duplicate reviews across channels
- **Data Validation**: Schema validation for all incoming review data
- **Audit Trail**: Complete history of manager actions and review changes

## Development Workflow

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint code analysis
npm run type-check   # TypeScript compilation check
```

### Database Management
```bash
npx prisma generate  # Generate TypeScript client
npx prisma db push   # Push schema to database
npx prisma studio    # Visual database browser
```

### Code Quality
- **ESLint**: Code linting with Next.js recommended rules
- **TypeScript**: Strict mode enabled for maximum type safety
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance

## Performance Optimizations

### Frontend
- **Server Components**: Reduced JavaScript bundle size
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Route-based and component-based splitting
- **Caching**: Static generation for public pages

### Backend
- **Database Indexing**: Optimized queries for review filtering
- **API Rate Limiting**: Prevents abuse of Hostaway API
- **Connection Pooling**: Efficient database connection management
- **Background Jobs**: Non-blocking data synchronization

## Security Considerations

### Environment Variables

| Variable | Description |
|----------|-------------|
| `FOURSQUARE_API_KEY` | Server-side API key for Foursquare Places. **Do not expose to client** |

### Data Protection
- **API Key Security**: Environment variables for sensitive credentials
- **Input Validation**: Zod schemas for all API endpoints
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **Rate Limiting**: Protection against API abuse

### Access Control
- **Manager Authentication**: Secure login for dashboard access
- **Role-based Permissions**: Different access levels for team members
- **Audit Logging**: Complete trail of all manager actions
- **CSRF Protection**: Built-in Next.js security features

This technology stack provides a robust, scalable, and maintainable solution for Flex Living's review management needs while ensuring excellent user experience for both managers and property guests.