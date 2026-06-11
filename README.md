<img width="1919" height="1078" alt="image" src="https://github.com/user-attachments/assets/46f921fb-fe59-411e-b8d7-247edce8be66" /># 🍽️ MakanBajet - Restaurant Discovery Platform

MakanBajet is a comprehensive restaurant discovery and management platform that helps users find affordable restaurants, read reviews, and save their favorite dining spots. The system includes three user roles: Admin, Staff, and Regular User.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Structure](#database-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Contributors](#contributors)
- [License](#license)

---

## ✨ Features

### 👤 User Features
- User registration and login (Email/Password & Google)
- Browse and search restaurants by name, cuisine, location
- Filter restaurants by price range, rating, opening days, distance
- View restaurant details including menu, hours, location map
- Write reviews with ratings (1-5 stars)
- Love and save favorite restaurants
- View personal dashboard with activity stats
- Edit profile and upload profile picture

### 👨‍💼 Staff Features
- Add and manage own restaurant listings
- View customer reviews for owned restaurants
- Edit restaurant details including menu items
- Track restaurant performance

### 👑 Admin Features
- Full platform management
- Approve or reject restaurant submissions
- Manage user roles (admin/staff/user)
- View analytics dashboard with charts
- Manage all restaurants and reviews
- Add staff members

### 🗺️ Additional Features
- Location-based restaurant search
- Google Maps/OpenStreetMap integration
- Menu management with pricing
- Responsive design for mobile and desktop
- Dark mode support

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.4 | React framework for web application |
| React | 18.3.1 | UI library |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 4.x | Styling and responsive design |
| Lucide React | 1.14.0 | Icons |
| Recharts | 3.8.1 | Analytics charts |

### Backend & Services
| Service | Purpose |
|---------|---------|
| Firebase Authentication | User login and registration |
| Firebase Firestore | NoSQL database |
| Cloudinary | Image upload and storage |
| OpenStreetMap | Location maps |
| Vercel | Hosting and deployment |

### Development Tools
| Tool | Purpose |
|------|---------|
| Git & GitHub | Version control |
| npm | Package manager |
| VS Code | Code editor |

---

## 🏗️ System Architecture


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
