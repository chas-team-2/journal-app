# --- Builder stage ---
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies for build
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build Next.js app
RUN npm run build

# --- Production stage ---
FROM node:22-alpine AS runner
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force

# Copy build output and essential files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000

# Run Next.js
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0"]
