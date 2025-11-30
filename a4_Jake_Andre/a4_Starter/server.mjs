/* DO NOT CHANGE THIS FILE */

import * as menuItemAccessor from "./db/menu-item-accessor.mjs";
import { ConnectionManager } from "./db/connection-manager.mjs";
import * as constants from "./utils/constants.mjs";
import { buildApp } from "./app.mjs";

const app = buildApp({ menuItemAccessor });

const server = app.listen(constants.PORT_NUM, function () {
    console.log(`Example app listening on port ${constants.PORT_NUM}!`);
});

// === Graceful shutdown ===

function shutdown(signal) {
    console.log(`\nReceived ${signal} — shutting down...`);
    server.close(async function () {
        // close Mongo connection
        try {
            await ConnectionManager.closeConnection();
            process.exit(0);
        } catch (err) {
            console.error("Error closing Mongo:", err);
            process.exit(1);
        }
    });
}

process.once("SIGINT", () => shutdown("SIGINT (Ctrl+C)")); // Ctrl+C sends SIGINT
process.once("SIGTERM", () => shutdown("SIGTERM")); // container managers (Docker etc.) might send SIGTERM

/* DO NOT CHANGE THIS FILE */
