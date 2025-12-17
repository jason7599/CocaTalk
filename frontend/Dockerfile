FROM node:20-alpine

WORKDIR /app

# Copy only dependency files first (better cache usage)
COPY package*.json ./

# Install deps once at build time
RUN npm install

# Copy the rest of the project files
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]