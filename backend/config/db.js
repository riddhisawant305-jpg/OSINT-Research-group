const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const dns = require("dns");

// On Windows / certain ISP networks, Node.js querySrv fails. Set reliable public DNS servers.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if permissions or platform restricts modifying DNS servers
}

const getMongoUri = () => {
  // First priority: user-provided atlas-credentials.env
  const atlasPath = path.join(__dirname, "..", "atlas-credentials.env");
  if (fs.existsSync(atlasPath)) {
    const content = fs.readFileSync(atlasPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (key === "MONGODB_URI") {
          return val;
        }
      }
    }
  }

  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  throw new Error("MongoDB URI not found in environment or atlas-credentials.env");
};

const connectDB = async () => {
  try {
    const uri = getMongoUri();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;