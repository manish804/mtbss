
# Page Management System

A comprehensive page management system built with Next.js, Prisma, and PostgreSQL that allows you to create, edit, and manage website pages through a user-friendly admin interface.

## 🚀 Features

### ✅ **Complete Backend API**

- RESTful API endpoints for full CRUD operations
- PostgreSQL database with Prisma ORM
- Type-safe operations with comprehensive validation
- Error handling and logging

### ✅ **Professional Admin Interface**

- Modern, responsive admin admin at `/admin`
- Section-based content editing (Hero, About Services, Industries, etc.)
- Real-time preview and validation
- Drag-and-drop section management
- Publication status controls

### ✅ **Section-Based Content Management**

- **Hero Section**: Main banner with background images and CTAs
- **About Services**: Service overview with descriptions
- **Industries**: Industry showcase with icons and descriptions
- **Trust & Statistics**: Key metrics and trust indicators
- **Customer Testimonials**: Client reviews and ratings
- **Call-to-Action**: Conversion-focused sections

### ✅ **Advanced Features**

- Live content preview
- Auto-save functionality
- Version control and change tracking
- Image upload and management
- SEO-friendly URL generation
- Responsive design support

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with JSONB for flexible content
- **UI**: Tailwind CSS, shadcn/ui components
- **Validation**: Zod schemas with React Hook Form
- **Testing**: Jest, React Testing Library

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin interface
│   │   ├── layout.tsx         # Admin layout
│   │   ├── page.tsx           # Dashboard
│   │   └── pages/             # Page management
│   └── api/
│       └── pages/             # API endpoints
├── components/
│   ├── admin/                 # Admin components
│   │   ├── section-editor.tsx # Main section editor
│   │   └── sections/          # Individual section editors
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── types/                 # TypeScript interfaces
│   ├── validation/            # Zod schemas
│   ├── services/              # Business logic
│   ├── utils/                 # Helper functions
│   └── api/                   # API client
└── __tests__/                 # Test suites
```

## 🚀 Getting Started

### 1. Database Setup

```bash
# Install dependencies
npm install

# Set up your PostgreSQL database
# Update .env with your DATABASE_URL

# Generate Prisma client and run migrations
npx prisma generate
npx prisma db push
```

### 2. Migrate Existing Data (Optional)

If you have existing JSON page data:

```bash
# Install tsx for running TypeScript scripts
npm install -g tsx

# Run the migration script
npx tsx src/scripts/migrate-json-data.ts
```

### 3. Start Development Server

```bash
npm run dev
```

Visit:

- **Admin Interface**: http://localhost:9002/admin
- **Main Site**: http://localhost:9002

## 📖 API Documentation

### Endpoints

| Method  | Endpoint           | Description                                |
| ------- | ------------------ | ------------------------------------------ |
| `GET`   | `/api/pages`       | List all pages (with pagination/filtering) |
| `POST`  | `/api/pages`       | Create a new page                          |
| `GET`   | `/api/pages/[id]`  | Get a specific page                        |
| `PUT`   | `/api/pages/[id]`  | Update a page (full update)                |
| `PATCH` | `/api/pages/[id]`  | Partially update a page                    |
| `GET`   | `/api/pages/stats` | Get page statistics                        |

### Query Parameters

**GET /api/pages**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term (searches title, description, pageId)
- `published`: Filter by publication status (true/false)

### Request/Response Examples

**Create Page:**

```json
POST /api/pages
{
  "pageId": "about-us",
  "title": "About Us",
  "description": "Learn about our company",
  "content": {
    "pageId": "about-us",
    "title": "About Us",
    "description": "Learn about our company",
    "lastModified": "2024-01-01T00:00:00Z",
    "published": false,
    "hero": {
      "title": "About Our Company",
      "subtitle": "We're here to help",
      "styling": { ... }
    }
  },
  "isPublished": false
}
```

## 🎨 Admin Interface Guide

### Dashboard (`/admin`)

- Overview of all pages
- Quick statistics (total, published, drafts)
- Recent activity
- Quick actions

### Page Management (`/admin/pages`)

- List all pages with search and filtering
- Toggle publication status
- Create new pages
- Edit existing pages

### Page Editor (`/admin/pages/[id]`)

- **Content Tab**: Section-based content editing
- **Settings Tab**: Page metadata and publication settings
- Real-time auto-save
- Live preview

### Section Editing

Each section type has a dedicated editor:

- **Form fields** for text content
- **Visual controls** for styling options
- **Array management** for lists (industries, testimonials, etc.)
- **Image upload** for media content
- **Preview mode** to see changes

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test coverage includes:

- API route testing
- Service layer testing
- Component testing
- Utility function testing
- Integration testing

## 🔧 Configuration

### Admin Settings (`src/lib/config/admin.ts`)

- Pagination limits
- File upload restrictions
- Content length limits
- Available styling options
- Section type definitions

### Validation Rules

- Page ID format validation
- Content length limits
- Image file type/size validation
- URL format validation

## 📝 Content Structure

Pages are stored with this JSON structure:

```json
{
  "pageId": "home",
  "title": "Home Page",
  "description": "Welcome to our website",
  "lastModified": "2024-01-01T00:00:00Z",
  "published": true,
  "hero": {
    "title": "Welcome",
    "subtitle": "We're glad you're here",
    "description": "Discover what we can do for you",
    "ctaText": "Get Started",
    "ctaLink": "/contact",
    "backgroundImage": {
      "id": "hero-bg",
      "description": "Hero background",
      "imageUrl": "https://example.com/image.jpg",
      "imageHint": "hero background"
    },
    "styling": {
      "backgroundColor": "bg-gradient-to-r",
      "gradientFrom": "blue-600",
      "gradientTo": "purple-600",
      "textColor": "text-white",
      "padding": "py-20 px-4"
    }
  },
  "aboutServices": { ... },
  "industries": { ... },
  "trust": { ... },
  "customers": { ... },
  "callToAction": { ... }
}
```

## 🚀 Deployment

1. **Database**: Set up PostgreSQL database
2. **Environment**: Configure environment variables
3. **Build**: Run `npm run build`
4. **Deploy**: Deploy to your preferred platform (Vercel, Railway, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🎯 Next Steps

The system is fully functional and ready for production use. Potential enhancements:

- **Image Management**: Advanced image editing and optimization
- **SEO Tools**: Meta tag management and SEO analysis
- **Analytics**: Page performance tracking
- **Workflows**: Approval processes for content publishing
- **Multi-language**: Internationalization support
- **Templates**: Pre-built page templates
- **Backup/Restore**: Content backup and restoration tools
