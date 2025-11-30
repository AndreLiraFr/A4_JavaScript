/* DO NOT CHANGE THIS FILE */

/** The connection URI for MongoDB. */
//const DB_URI = "mongodb://localhost:27017";
const DB_URI = "mongodb://127.0.0.1:27017";

/** The database name. */
const DB_NAME = "restaurantdb";

/** The collection name. */
const DB_COLLECTION = "menuitems";

/** The number of records in the collection. */
const NUM_ITEMS = 39;

/** Error code that Node uses if a file can't be found. */
const FILE_NOT_FOUND_ERROR_CODE = "ENOENT";

/** The port number of the web server. */
const PORT_NUM = 8000;

/** The folder containing the static files for the websites. */
const PUBLIC_FOLDER = "public";

export {
    DB_URI,
    DB_NAME,
    DB_COLLECTION,
    NUM_ITEMS,
    FILE_NOT_FOUND_ERROR_CODE,
    PORT_NUM,
    PUBLIC_FOLDER,
};

/* DO NOT CHANGE THIS FILE */
