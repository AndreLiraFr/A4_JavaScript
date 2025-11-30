import express from "express";
import cors from "cors";
import { MenuItem } from "./entity/menu-item.mjs";
import * as constants from "./utils/constants.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // absolute path to this file
const __dirname = path.dirname(__filename); // absolute path to folder containing this file

// The menuItemAccessor is passed in from "server.mjs"
export function buildApp({ menuItemAccessor }) {
    const app = express();

    // enable cors
    app.use(cors());

    /// START YOUR CODE HERE

    // middleware to parse JSON bodies
    app.use(express.json());

    // handle static file requests
    app.use(express.static(constants.PUBLIC_FOLDER));

   //validate ID has 3 digits
    function validateItemId(req, res, next) {
        let pattern = /^\d\d\d$/;
        if (!pattern.test(req.params.id)) {  
            //error 404         
            return next('route');
        }
        next();
    }

    //good endpoints
    // get /menuitems  get all
    app.get("/menuitems", async (req, res) => {
        try {
            let items = await menuItemAccessor.getAllItems();
            let obj = { err: null, data: items };
            res.status(200).json(obj);
        } catch (err) {
            let obj = { err: "Internal server error", data: null };
            res.status(500).json(obj);
        }
    });    

    // post /menuitems  create
    app.post("/menuitems/:id", validateItemId, async function (req, res) {
        try {
            let urlId = parseInt(req.params.id);
            let { id, category, description, price, vegetarian } = req.body;        
           
            let newItem;
            try {
                newItem = new MenuItem(id ?? urlId, category, description, price, vegetarian);
            } catch (err) {
                let obj = { err: err.message, data: null };
                return res.status(400).json(obj);
            }
            //validate id match
            if (newItem.id !== urlId) {
                let obj = { err: "Menu Item constructor error: ID does not  match", data: null };
                return res.status(400).json(obj);
            }
            //check if item already exists
            let exists = await menuItemAccessor.itemExists(newItem);
            if (exists) {
                let obj = { err: `item ${urlId} already exists`, data: null };
                return res.status(409).json(obj);
            }
            
            await menuItemAccessor.addItem(newItem);
            return res.status(201).json({ err: null, data: newItem });

        } catch (err) {
            console.error(err);
            let obj = { err: "Internal server error", data: null };
            res.status(500).json(obj);
        }
    });

    // put /menuitems/:id update
    app.put("/menuitems/:id", validateItemId, async function (req, res) {
        try {
            let urlId = parseInt(req.params.id);
            let { id, category, description, price, vegetarian } = req.body;        
            
            let updatedItem;
            try {
                updatedItem = new MenuItem(id ?? urlId, category, description, price, vegetarian);
            } catch (err) {
                let obj = { err: err.message, data: null };
                return res.status(400).json(obj);
            }
            
            //validate id match
            if (updatedItem.id !== urlId) {
                let obj = { err: "Menu Item constructor error: ID does not  match", data: null };
                return res.status(400).json(obj);
            }
            
            //check if item already exists
            let exists = await menuItemAccessor.itemExists(updatedItem);
            if (!exists) {
                let obj = { err: `item ${urlId} does not exist`, data: null };
                return res.status(404).json(obj);
            }

            let updated = await menuItemAccessor.updateItem(updatedItem);
            
            await menuItemAccessor.updateItem(updatedItem);
            return res.status(200).json({ err: null, data: updatedItem });

        } catch (err) {
            console.error(err);
            let obj = { err: "Internal server error", data: null };
            res.status(500).json(obj);
        }
    });

    // delete /menuitems/:id
    app.delete("/menuitems/:id", validateItemId, async function (req, res) {
        try {
            let id = parseInt(req.params.id);
            let item = await menuItemAccessor.getItemByID(id);
            
            if (!item) {
                let obj = { err: `item ${id} does not exist`, data: null };
                return res.status(404).json(obj);
            }
            
            let deleted = await menuItemAccessor.deleteItem(item);
            
            if (deleted) {
                let obj = { err: null, data: item };
                res.status(200).json(obj);
            } else {
                let obj = { err: `item ${id} does not exist`, data: null };
                res.status(404).json(obj);
            }
        } catch (err) {
            let obj = { err: "Internal server error", data: null };
            res.status(500).json(obj);
        }
    });

    //bad endpoints
    //get /menuitems/:id 
    app.get("/menuitems/:id", validateItemId, function (req, res) {
        let obj = { err: "Single GETs not supported", data: null };
        res.status(405).json(obj);
    });

    //post /menuitems 
    app.post("/menuitems", function (req, res) {
        let obj = { err: "Bulk POSTs not supported", data: null };
        res.status(405).json(obj);
    });

    //put /menuitems
    app.put("/menuitems", function (req, res) {
        let obj = { err: "Bulk PUTs not supported", data: null };
        res.status(405).json(obj);
    });

    // bulk delete /menuitems 
    app.delete("/menuitems", function (req, res) {
        let obj = { err: "Bulk DELETEs not supported", data: null };
        res.status(405).json(obj);
    });

    //404 to file not found
    app.use(function (req, res, next) {
        let fileToSend = path.join(__dirname, "public", "404.html");
        res.status(404).sendFile(fileToSend);

    });

    return app; // make sure this is the last line
}
