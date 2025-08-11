# Fitness Machine Booking System

A simple web app for booking gym machines. Users see a 5x5 grid of machines and can book them (like selecting airplane seats).

## What it does

- Shows 25 machines in a grid
- Click to lock a machine for 2 minutes while you decide
- Confirm to book it permanently
- See who has each machine
- Updates every 3 seconds

## Tech Stack

**Backend:** Node.js, Express, TypeScript, PostgreSQL
**Frontend:** React, TypeScript, Tailwind CSS
**Infrastructure:** Docker, AWS (EC2 + RDS), Terraform
**CI/CD:** GitHub Actions

## Quick Start (Local Development)

### Option 1: Docker (Easiest)
```bash
git clone https://github.com/guillelopez22/BookingGrid.git
cd BookingGrid/fitness-booking
docker-compose up
```
Open http://localhost:3000

### Option 2: Manual Setup

1. Start PostgreSQL locally
2. Backend:
```bash
cd backend
npm install
# Create .env file with: DATABASE_URL=postgresql://user:password@localhost:5432/fitness_booking
npm run db:migrate
npm run dev
```
3. Frontend:
```bash
cd frontend
npm install
npm start
```

## How We Built This (8-hour challenge approach)

### Our Design Choices

**Why this architecture?**
- Went with a standard React + Node.js stack because it's quick to build and widely understood
- PostgreSQL for the database because we need transactions to handle race conditions
- Used polling instead of WebSockets to keep it simple (3-second refresh is good enough for this use case)

**The locking mechanism:**
- When you click a machine, it locks for 2 minutes
- This gives you time to confirm without someone else grabbing it
- Uses unique tokens to make sure only you can confirm your lock
- All database operations use transactions to prevent double-bookings

**Frontend approach:**
- Single page with a grid component
- Optimistic updates (shows your action immediately, then syncs with server)
- Simple modals for user actions
- Mobile responsive with Tailwind utilities

### If This Was a Real Production System

For a real gym with hundreds of users, we'd add:
- **WebSockets** instead of polling (real-time updates, less server load)
- **Redis** for caching and session management
- **Message queue** (RabbitMQ/SQS) for handling peak booking times
- **Load balancer** with multiple server instances
- **Proper authentication** (Auth0, Cognito, or custom JWT)
- **Booking history** and analytics dashboard
- **Email/SMS confirmations**
- **Scheduled maintenance windows** for machines
- **Different machine types** with specific booking rules

But for an 8-hour challenge, our approach shows:
- Understanding of race conditions and how to prevent them
- Clean code structure with TypeScript
- Basic DevOps with Docker and CI/CD
- Infrastructure as Code with Terraform
- Responsive UI design

## Project Structure
```
fitness-booking/
├── backend/           # Express API
├── frontend/          # React app
├── terraform/         # AWS infrastructure
├── .github/workflows/ # CI/CD pipeline
└── docker-compose.yml # Local development
```

## API Endpoints

- `GET /api/machines` - Get all machines
- `POST /api/machines/lock` - Lock a machine
- `POST /api/machines/book` - Confirm booking
- `POST /api/machines/release` - Cancel lock
- `POST /api/machines/unbook` - Cancel booking

## AWS Deployment

The Terraform config creates:
- 1 EC2 instance (t3.micro)
- 1 RDS PostgreSQL database
- Security groups for web traffic

To deploy:
```bash
cd terraform
terraform init
terraform apply
```

## Testing

No formal tests written (time constraint), but the app handles:
- Multiple users booking simultaneously
- Lock expiration after 2 minutes
- Network failures (retries)
- Mobile and desktop views

## Time Breakdown (8 hours)

- Hour 1-2: Project setup, database schema, basic backend
- Hour 3-4: Frontend grid, selection logic
- Hour 5-6: Lock/booking flow, race condition handling
- Hour 7: UI polish, responsive design
- Hour 8: Docker, Terraform, CI/CD setup

## Notes

This is a simplified booking system built for a coding challenge. The focus was on demonstrating full-stack development skills, understanding of concurrent systems, and basic DevOps practices within time constraints.