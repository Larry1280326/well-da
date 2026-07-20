// Plesk Passenger startup script for Next.js standalone server.
// Passenger sets the PORT env variable; this wrapper passes it through
// to the standalone server entry point.
process.env.PORT = process.env.PORT || "3000";
const path = require("path");
const serverPath = path.join(__dirname, ".next", "standalone", "server.js");
require(serverPath);
