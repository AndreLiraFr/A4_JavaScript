/* DO NOT CHANGE THIS FILE */

import { MongoClient } from "mongodb";
import * as constants from "../utils/constants.mjs";

class ConnectionManager {
    static #conn = null;

    /**
     * DO NOT CALL THE CONSTRUCTOR - USE STATIC METHODS
     */
    constructor() {}

    /**
     * Returns a new connection.
     *
     * @throws {Error} if database error occurs
     * @returns a Mongo database connection
     */
    static async getConnection() {
        if (this.#conn === null) {
            this.#conn = await MongoClient.connect(constants.DB_URI);
            console.log("Created new database connection.");
        }
        return this.#conn;
    }

    /**
     * Closes this connection.
     *
     * @throws {Error} if database error occurs
     */
    static async closeConnection() {
        if (this.#conn !== null) {
            await this.#conn.close();
            this.#conn = null;
            console.log("Closed active database connection.");
        }
    }
} // end class

export { ConnectionManager };

/* DO NOT CHANGE THIS FILE */
