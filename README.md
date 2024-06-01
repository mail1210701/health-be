# Init for starting
npm install \
pnpm install

# Install Sequelize Cli Global
npm install -g sequelize-cli \
pnpm add -g sequelize-cli

# Migrate database
npx sequelize-cli db:migrate

# Running Project
npm dev \
pnpm dev
