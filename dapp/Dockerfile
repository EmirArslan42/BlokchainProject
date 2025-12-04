FROM node:20 

WORKDIR /app

COPY package*.json ./
RUN npm install --force
RUN npm install dotenv --save

COPY . .

CMD ["npx", "hardhat", "run", "scripts/deploy.js", "--network", "ganache"]
