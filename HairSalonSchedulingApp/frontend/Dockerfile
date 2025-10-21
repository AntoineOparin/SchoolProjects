FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Install serve to run the built app
RUN npm install -g serve

EXPOSE 5173

# Start the app
CMD ["npm", "run", "dev", "--", "--host"]