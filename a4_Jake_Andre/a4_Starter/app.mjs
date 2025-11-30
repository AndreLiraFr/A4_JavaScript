import express from "express";
import cors from "cors";
import { MenuItem } from "./entity/menu-item.mjs";
import * as constants from "./utils/constants.mjs";



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

    // get /menuitems  get all
    app.get("/menuitems", async (req, res) => {
        try {
            const items = await menuItemAccessor.getAllItems();
            res.status(200).json(items);
        } catch (err) {
            res.status(500).json({ error: "Unable to retrieve items" });
        }
    });

    // get /menuitems/:id  get one
    app.get("/menuitems/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const item = await menuItemAccessor.getItemByID(id);
            
            if (item === null) {
                return res.status(404).json({ error: "Item not found" });
            }
            
            res.status(200).json(item);
        } catch (err) {
            res.status(500).json({ error: "Unable to retrieve item" });
        }
    });

    // post /menuitems  create
    app.post("/menuitems", async (req, res) => {
        try {
            const { id, category, description, price, vegetarian } = req.body;
            
            let newItem;
            try {
                newItem = new MenuItem(id, category, description, price, vegetarian);
            } catch (err) {
                return res.status(400).json({ error: err.message.replace("MenuItem constructor error: ", "") });
            }
            
            const added = await menuItemAccessor.addItem(newItem);
            
            if (!added) {
                return res.status(409).json({ error: "Item already exists" });
            }
            
            res.status(201).json(newItem);
        } catch (err) {
            res.status(500).json({ error: "Unable to create item" });
        }
    });

    // put /menuitems/:id update
    app.put("/menuitems/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { category, description, price, vegetarian } = req.body;
            
            let updatedItem;
            try {
                updatedItem = new MenuItem(id, category, description, price, vegetarian);
            } catch (err) {
                return res.status(400).json({ error: err.message.replace("MenuItem constructor error: ", "") });
            }
            
            const updated = await menuItemAccessor.updateItem(updatedItem);
            
            if (!updated) {
                return res.status(404).json({ error: "Item not found" });
            }
            
            res.status(200).json(updatedItem);
        } catch (err) {
            res.status(500).json({ error: "Unable to update item" });
        }
    });

    // delete /menuitems/:id
    app.delete("/menuitems/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const item = await menuItemAccessor.getItemByID(id);
            
            if (!item) {
                return res.status(404).json({ error: "Item not found" });
            }
            
            await menuItemAccessor.deleteItem(item);
            res.status(200).json({ message: "Item deleted" });
        } catch (err) {
            res.status(500).json({ error: "Unable to delete item" });
        }
    });

    // bulk delete /menuitems 
    app.delete("/menuitems", (req, res) => {
        res.status(405).json({ error: "Bulk delete not supported" });
    });

    //404 to file not found
    app.use((req, res) => {
        res.status(404).sendFile(constants.PAGE_404);

    });

    return app; // make sure this is the last line
}
