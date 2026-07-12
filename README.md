# DreamazeBook - Multilingual E-Book Platform

## Project Overview
DreamazeBook is a multilingual e-book platform built with Next.js, offering book browsing, purchasing, and personalized reading experiences. It supports internationalization, real-time communication, and payment integration.

## Tech Stack
- **Framework**: Next.js 15.3 + React 19
- **UI Libraries**: 
  - Material-UI (MUI)
  - Ant Design
  - Heroicons
- **State Management**: Zustand
- **Internationalization**: next-intl
- **Payments**: Stripe
- **Real-time Communication**: 
  - Pusher
  - Socket.io
- **Animation**: Framer Motion
- **Date Handling**: 
  - date-fns
  - MUI Date Pickers
- **Styling**: 
  - TailwindCSS
  - Emotion
- **Utilities**: 
  - Axios
  - React Hot Toast

## Project Structure
```
dreamazebook-frontend/
├── app/                  # Next.js app routes
│   ├── [locale]/         # Internationalized routes
│   │   ├── (marketing)/  # Marketing pages
│   │   ├── (website)/    # Main site features
│   │   │   ├── books/    # Book-related pages
│   │   │   ├── checkout/ # Checkout flow
│   │   │   ├── shopping-cart/ # Shopping cart
│   │   │   └── ...       # Other feature modules
│   ├── api/              # API routes
│   └── config/          # App configuration
├── components/           # Shared components (currently empty)
├── stores/               # State management
│   └── userStore.ts      # User state store
├── utils/                # Utility functions
│   ├── api.js            # API requests
│   ├── auth.js           # Authentication utilities
│   └── ...               # Other utilities
├── public/               # Static assets
└── ...                   # Other config files
```

## Core Features
1. **Multilingual Support** — Implemented via `[locale]` routes and next-intl
2. **User Authentication** — Login, registration, and password reset
3. **E-commerce**:
   - Book browsing and selection
   - Shopping cart management
   - Checkout flow
   - Order summary
4. **Personalized Reading**:
   - Book content selection
   - Reading preference settings
5. **Real-time Communication** — Powered by Pusher and Socket.io
6. **Analytics & Tracking** — User behavior tracking

## Getting Started
1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Copy `.env.example` to `.env` and fill in the required values.

3. Development mode:
```bash
npm run dev
```

4. Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | User registration |
| `/login` | POST | User login |
| `/login/send-code` | POST | Send login verification code |
| `/login/verify-code` | POST | Verify login code |
| `/logout` | POST | User logout |
| `/forgot-password` | POST | Send password reset email |
| `/reset-password` | POST | Reset password |
| `/user/profile` | GET/PUT | Get/update user profile |
| `/user/change-password` | POST | Change password |

### OAuth Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/{provider}/redirect` | GET | OAuth redirect (google, facebook) |
| `/api/auth/{provider}/callback` | GET | OAuth callback |

### Cart
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cart` | GET | Get cart items |
| `/cart/create` | POST | Create cart |
| `/cart/remove` | POST | Remove cart item |
| `/cart/{id}` | PUT | Update cart item |
| `/checkout/calculate-cost` | POST | Calculate order cost |

### Orders
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/orders` | GET | Get order list |
| `/orders/{id}` | GET | Get order details |
| `/orders/{id}/progress` | GET | Get order progress |
| `/orders/{id}/address` | PUT | Update order address |
| `/orders/{id}/shipping-method` | PUT | Update shipping method |
| `/orders/status` | GET | Get order status |
| `/order/update-message` | POST | Update order message |
| `/order/remove` | POST | Remove order |
| `/order/shipping-methods` | GET | Get shipping methods |

### Checkout
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/checkout/create-order` | POST | Create order |
| `/stripe/create-payment-intent` | POST | Create Stripe payment intent |
| `/stripe/confirm-payment` | POST | Confirm Stripe payment |
| `/shipping/countries` | GET | Get country list |
| `/shipping/prices` | POST | Estimate shipping cost |

### User Addresses
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/user/addresses` | GET/POST | Get/create addresses |
| `/user/addresses/{id}` | GET/PUT/DELETE | Address CRUD operations |

### Products
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products` | GET | Get product list |
| `/picbooks` | GET | Get picture book list |
| `/picbooks/{id}` | GET | Get picture book details |

### Kickstarter
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/kickstarter-packages` | GET | Get Kickstarter packages |
| `/kickstarter-packages/{id}/status` | GET | Get package status |
| `/kickstarter-packages/items/{itemId}/picbook` | GET | Get package item |
| `/kickstarter-packages/items/{itemId}/options` | GET | Get package options |

### Admin
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/login` | POST | Admin login |
| `/admin/users` | GET | User list |
| `/admin/roles` | GET | Role list |
| `/admin/permissions` | GET | Permission list |
| `/admin/user-roles/{userId}/roles` | PUT | Assign user roles |
| `/admin/orders` | GET | Order list |
| `/admin/orders/{id}` | GET | Order details |
| `/admin/orders/{id}/retry-face-swap` | POST | Retry face swap |
| `/admin/orders/{id}/generate-pdf` | POST | Generate PDF |
| `/admin/orders/{id}/pdf-urls` | GET | Get PDF URLs |
| `/admin/orders/{id}/send-preview-pdf` | POST | Send preview PDF |
| `/admin/orders/{id}/items/{itemId}/upload-final-images` | POST | Upload final images |
| `/admin/orders/{id}/items/{itemId}/confirm` | POST | Manually confirm order |
| `/admin/orders/download-images` | GET | Download order images |
| `/admin/logistics` | GET | Logistics list |
| `/admin/logistics/{id}` | GET | Logistics details |
| `/admin/logistics/{id}/print-label` | POST | Print shipping label |
| `/admin/logistics/confirm` | POST | Confirm shipment |
| `/admin/logistics/print-pickup-order` | POST | Print pickup order |
| `/admin/logistics/{id}/reschedule-pickup` | POST | Reschedule pickup |
| `/admin/picbooks` | GET | Picture book management |
| `/admin/picbooks/{id}` | GET | Picture book details |

### Webhooks
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe-webhook` | POST | Stripe payment webhook |
| `/api/meta-webhook` | POST | Meta (Facebook) webhook |
| `/api/hubspot` | POST | HubSpot integration |

### Other APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ping` | GET | Service health check |
| `/api/send-mail` | POST | Send email |
| `/api/subscriptions` | GET/POST | Subscription management |
| `/api/cover-base-image` | GET | Cover base image |
| `/api/cover-page-properties` | GET | Cover page properties |
| `/api/image-proxy/{encoded}` | GET | Image proxy |
| `/api/local-gallery/{...segments}` | GET | Local image gallery |

## Contributing
Pull requests are welcome. Please keep code style consistent and ensure all tests pass.
