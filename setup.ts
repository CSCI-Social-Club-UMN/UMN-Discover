import fs from "node:fs";
import path from "node:path";
import { prompt } from "enquirer";
import { execSync } from "node:child_process";

async function confirmOverwrite(filePath: string): Promise<boolean> {
  if (!fs.existsSync(filePath)) return true;

  const { overwrite } = await prompt<{ overwrite: boolean }>({
    type: "confirm",
    name: "overwrite",
    message: `${filePath} already exists. Do you want to overwrite it?`,
    initial: false,
  });

  if (!overwrite) {
    console.log("Setup cancelled.");
    process.exit(0);
  }

  fs.unlinkSync(filePath);
  console.log(`Deleted old ${filePath}`);
  return true;
}

async function main() {
  console.log("UMN Discover Project Setup\n");
  console.log("Installing dependencies with pnpm...");
  execSync("pnpm install", { stdio: "inherit" });
  const serverEnvPath = path.join("server", ".env");
  await confirmOverwrite(serverEnvPath);

  const { accountSystem } = await prompt<{ accountSystem: boolean }>({
    type: "confirm",
    name: "accountSystem",
    message: "Enable account system?",
    initial: false,
  });

  let envContent = `# this disables account and database (remove ACCOUNT=false to enable account)\n\n`;
  if (!accountSystem) {
    envContent += `ACCOUNT=false\n\n`;
  }

  if (accountSystem) {
    const google = await prompt<{
      id: string;
      secret: string;
      callback: string;
    }>([
      {
        type: "input",
        name: "id",
        message: "Enter GOOGLE_CLIENT_ID:",
        initial: "your-google-client-id",
      },
      {
        type: "input",
        name: "secret",
        message: "Enter GOOGLE_CLIENT_SECRET:",
        initial: "your-google-client-secret",
      },
      {
        type: "input",
        name: "callback",
        message: "Enter GOOGLE_CALLBACK_URL:",
        initial: "http://localhost:3001/api/auth/google/callback",
      },
    ]);

    envContent += `GOOGLE_CLIENT_ID=${google.id}\n`;
    envContent += `GOOGLE_CLIENT_SECRET=${google.secret}\n`;
    envContent += `GOOGLE_CALLBACK_URL=${google.callback}\n\n`;

    const cloudinary = await prompt<{
      cloudName: string;
      apiKey: string;
      apiSecret: string;
    }>([
      {
        type: "input",
        name: "cloudName",
        message: "Enter CLOUDINARY_CLOUD_NAME:",
        initial: "your-cloudinary-cloud-name",
      },
      {
        type: "input",
        name: "apiKey",
        message: "Enter CLOUDINARY_API_KEY:",
        initial: "your-cloudinary-api-key",
      },
      {
        type: "input",
        name: "apiSecret",
        message: "Enter CLOUDINARY_API_SECRET:",
        initial: "your-cloudinary-api-secret",
      },
    ]);
    envContent += `CLOUDINARY_CLOUD_NAME=${cloudinary.cloudName}\n`;
    envContent += `CLOUDINARY_API_KEY=${cloudinary.apiKey}\n`;
    envContent += `CLOUDINARY_API_SECRET=${cloudinary.apiSecret}\n\n`;
  } else {
    envContent += `GOOGLE_CLIENT_ID=your-google-client-id\n`;
    envContent += `GOOGLE_CLIENT_SECRET=your-google-client-secret\n`;
    envContent += `GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback\n\n`;
    envContent += `CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name\n`;
    envContent += `CLOUDINARY_API_KEY=your-cloudinary-api-key\n`;
    envContent += `CLOUDINARY_API_SECRET=your-cloudinary-api-secret\n\n`;
  }

  envContent += `CLIENT_URL=http://localhost:3000\n\n`;
  envContent += `JWT_SECRET=umn-discover-secret-key-2025\n`;
  envContent += `SESSION_SECRET=umn-discover-session-secret-2025\n\n`;
  envContent += `DB_USER=umn-app\nDB_HOST=localhost\nDB_NAME=umn_discover\nDB_PASSWORD=umn1234\nDB_PORT=5432\n\n`;
  envContent += `NODE_ENV=development\n`;

  fs.writeFileSync(serverEnvPath, envContent, { encoding: "utf-8" });
  console.log("server/.env created");
  const clientEnvPath = path.join("client", ".env");
  await confirmOverwrite(clientEnvPath);

  const { clientPort } = await prompt<{ clientPort: string }>({
    type: "input",
    name: "clientPort",
    message: "Enter client port:",
    initial: "3000",
  });

  const clientEnv = `VITE_API_URL=http://localhost:${clientPort}/api\n`;
  fs.writeFileSync(clientEnvPath, clientEnv, { encoding: "utf-8" });
  console.log("client/.env created");

  console.log("\nSetup complete!");
  console.log("Run `pnpm -r dev` to start both client and server.");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
