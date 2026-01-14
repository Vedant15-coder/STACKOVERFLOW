FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev --no-audit

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
