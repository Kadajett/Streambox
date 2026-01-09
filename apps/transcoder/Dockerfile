# NVIDIA CUDA-enabled Dockerfile for video transcoding
# Supports hardware-accelerated H.264 encoding via NVENC

FROM nvidia/cuda:12.2.2-runtime-ubuntu22.04 AS base

# Install Node.js and FFmpeg with NVIDIA support
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy shared packages
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-types/src ./packages/shared-types/src
COPY packages/shared-types/tsconfig.json ./packages/shared-types/

# Copy transcoder package
COPY apps/transcoder/package.json ./apps/transcoder/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy transcoder source
COPY apps/transcoder/src ./apps/transcoder/src
COPY apps/transcoder/tsconfig.json ./apps/transcoder/

# Copy Prisma schema from API (for client generation)
COPY apps/api/prisma ./apps/api/prisma

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build shared-types
RUN cd packages/shared-types && pnpm build

# Build transcoder
RUN cd apps/transcoder && pnpm build

# Production stage
FROM nvidia/cuda:12.2.2-runtime-ubuntu22.04 AS production

RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built application
COPY --from=base /app/apps/transcoder/dist ./dist
COPY --from=base /app/apps/transcoder/node_modules ./node_modules
COPY --from=base /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=base /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=base /app/apps/api/node_modules/.prisma ./node_modules/.prisma

# Create data directories
RUN mkdir -p /data/raw /data/hls /data/thumbnails

ENV NODE_ENV=production
ENV USE_GPU=true
ENV DATA_DIR=/data

EXPOSE 3000

CMD ["node", "dist/index.js"]
