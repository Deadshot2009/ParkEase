# Multi-stage Docker build for ParkEase
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and frontend configs
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy source code
COPY . .

# Build frontend production bundle
RUN cd frontend && npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy node modules and built assets
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/package*.json ./

EXPOSE 5000

CMD ["node", "backend/src/app.js"]
