import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const services = [
  { name: "AI", color: "\x1b[35m", cwd: path.join(__dirname, "ai"), cmd: "npm", args: ["run", "dev"] },
  { name: "BACKEND", color: "\x1b[34m", cwd: path.join(__dirname, "backend/You_Matter"), cmd: "npm", args: ["run", "dev"] },
  { name: "FRONTEND", color: "\x1b[36m", cwd: path.join(__dirname, "frontend/YouMatter"), cmd: "npm", args: ["run", "dev"] },
];

console.log("🚀 Starting YouMatter AI, Backend, and Frontend services...\n");

services.forEach((service) => {
  const proc = spawn(service.cmd, service.args, {
    cwd: service.cwd,
    shell: true,
    env: process.env,
  });

  proc.stdout.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    lines.forEach((line) => {
      if (line) console.log(`${service.color}[${service.name}]\x1b[0m ${line}`);
    });
  });

  proc.stderr.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    lines.forEach((line) => {
      if (line) console.log(`${service.color}[${service.name}]\x1b[0m ${line}`);
    });
  });

  proc.on("close", (code) => {
    console.log(`${service.color}[${service.name}]\x1b[0m Exited with code ${code}`);
  });
});
