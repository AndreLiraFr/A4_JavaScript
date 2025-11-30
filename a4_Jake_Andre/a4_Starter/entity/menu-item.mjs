/* DO NOT CHANGE THIS FILE */

class MenuItem {
    #id;
    #category;
    #description;
    #price;
    #vegetarian = false; // default

    /**
     * Creates a new MenuItem object.
     *
     * @param {number} id - the item's ID
     * @param {string} category - the item's category
     * @param {string} description - the item's description
     * @param {number} price - the item's price
     * @param {boolean} vegetarian - whether the item is vegetarian
     * @throws {Error} if any parameters are invalid
     */
    constructor(id, category, description, price, vegetarian) {
        let err = MenuItem.checkArgs(
            id,
            category,
            description,
            price,
            vegetarian
        );
        if (err) {
            throw new Error("MenuItem constructor error: " + err);
        }

        this.#id = id;
        this.#category = category;
        this.#description = description;
        this.#price = price;
        this.#vegetarian = vegetarian;
    }

    static checkArgs(id, category, description, price, vegetarian) {
        let err = null;
        if (id === null || id === undefined) {
            err = "id must be defined";
        } else if (typeof id !== "number") {
            err = "id must be a number";
        } else if (id < 100 || id > 999) {
            err = "id must be in range [100,999]";
        } else if (category === null || category === undefined) {
            err = "category must be defined";
        } else if (typeof category !== "string") {
            err = "category must be a string";
        } else if (category.length !== 3) {
            err = "category must be three letters";
        } else if (description === null || description === undefined) {
            err = "description must be defined";
        } else if (typeof description !== "string") {
            err = "description must be a string";
        } else if (price === null || price === undefined) {
            err = "price must be defined";
        } else if (typeof price !== "number") {
            err = "price must be a number";
        } else if (price < 0) {
            err = "price must be greater than 0";
        } else if (vegetarian === null || vegetarian === undefined) {
            err = "vegetarian must be defined";
        } else if (typeof vegetarian !== "boolean") {
            err = "vegetarian must be a boolean";
        }
        return err;
    }

    // Getters
    get id() {
        return this.#id;
    }
    get category() {
        return this.#category;
    }
    get description() {
        return this.#description;
    }
    get price() {
        return this.#price;
    }
    get vegetarian() {
        return this.#vegetarian;
    }

    /**
     * Needed because JSON.stringify can't see the (private) fields.
     * JSON.stringify will call this method instead.
     * You can also call this method to get a JS object containing just the data (no methods).
     *
     * @returns an object containing the data without the methods
     */
    toJSON() {
        return {
            id: this.#id,
            category: this.#category,
            description: this.#description,
            price: this.#price,
            vegetarian: this.#vegetarian,
        };
    }

    toCSV() {
        return `${this.#id}, ${this.#category}, ${this.#description}, ${
            this.#price
        }, ${this.#vegetarian}`;
    }

    formatItem() {
        return `\t${this.#description} (ID: ${this.#id}): ${this.#price} ${
            this.#vegetarian ? " (veg)" : ""
        }`;
    }
} // end class

export { MenuItem };

/* DO NOT CHANGE THIS FILE */
