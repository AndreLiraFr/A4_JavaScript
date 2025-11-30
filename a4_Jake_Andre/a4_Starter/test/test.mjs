/* DO NOT CHANGE THIS FILE */

// A4 - Full Web Service Test Suite (uses SuperTest, Mocha, and Chai)

import { assert } from "chai";
import request from "supertest";
import * as constants from "../utils/constants.mjs";
import { rebuild } from "../db/database-builder.mjs";
import { MenuItem } from "../entity/menu-item.mjs";
import * as menuItemAccessor from "../db/menu-item-accessor.mjs";
import { readFile } from "fs/promises";
import { buildApp } from "../app.mjs";
import { ConnectionManager } from "../db/connection-manager.mjs";

let app; // SuperTest will drive this directly

const TEST_ITEMS = {
    goodItem: new MenuItem(107, "ENT", "nothing", 99, false),
    badItem: new MenuItem(777, "ENT", "nothing", 99, false),
    itemToAdd: new MenuItem(888, "ENT", "poutine", 99, false),
    itemToDelete: new MenuItem(202, "ENT", "nothing", 99, false),
    itemToUpdate: new MenuItem(303, "ENT", "after update", 99, false),
};

describe("A4 - Web Service Testing (SuperTest Version)", function () {
    before("Setup", async function () {
        await rebuild();
        app = buildApp({ menuItemAccessor });
    });

    after("Teardown", async function () {
        await rebuild();
        await ConnectionManager.closeConnection();
    });

    // ------------------------------------------------------------
    // SUPPORTED OPERATIONS
    // ------------------------------------------------------------
    describe("Supported Operations", function () {
        describe("Expected Successes", function () {
            it("GET /menuitems --> status 200, 39 items", async function () {
                const res = await request(app).get("/menuitems").expect(200);

                assert.equal(res.body.data.length, constants.NUM_ITEMS);
            });

            it(`POST /menuitems/${TEST_ITEMS.itemToAdd.id} --> status 201, item added`, async function () {
                await request(app)
                    .post(`/menuitems/${TEST_ITEMS.itemToAdd.id}`)
                    .send(TEST_ITEMS.itemToAdd.toJSON())
                    .expect(201);

                assert.isTrue(
                    await menuItemAccessor.itemExists(TEST_ITEMS.itemToAdd)
                );

                await menuItemAccessor.deleteItem(TEST_ITEMS.itemToAdd);
            });

            it(`PUT /menuitems/${TEST_ITEMS.itemToUpdate.id} --> status 200, item updated`, async function () {
                const originalItem = await menuItemAccessor.getItemByID(
                    TEST_ITEMS.itemToUpdate.id
                );

                await request(app)
                    .put(`/menuitems/${TEST_ITEMS.itemToUpdate.id}`)
                    .send(TEST_ITEMS.itemToUpdate.toJSON())
                    .expect(200);

                const updated = await menuItemAccessor.getItemByID(
                    TEST_ITEMS.itemToUpdate.id
                );
                assert.deepEqual(updated, TEST_ITEMS.itemToUpdate);

                await menuItemAccessor.updateItem(originalItem);
            });

            it(`DELETE /menuitems/${TEST_ITEMS.itemToDelete.id} --> status 200, item deleted`, async function () {
                const originalItem = await menuItemAccessor.getItemByID(
                    TEST_ITEMS.itemToDelete.id
                );

                await request(app)
                    .delete(`/menuitems/${TEST_ITEMS.itemToDelete.id}`)
                    .expect(200);

                assert.isFalse(
                    await menuItemAccessor.itemExists(TEST_ITEMS.itemToDelete)
                );

                await menuItemAccessor.addItem(originalItem);
            });
        });

        // ------------------------------------------------------------
        // EXPECTED FAILURES (409, 404)
        // ------------------------------------------------------------
        describe("Expected Failures I - conflicts", function () {
            it(`POST /menuitems/${TEST_ITEMS.goodItem.id} --> 409 conflict`, async function () {
                const res = await request(app)
                    .post(`/menuitems/${TEST_ITEMS.goodItem.id}`)
                    .send(TEST_ITEMS.goodItem.toJSON())
                    .expect(409);

                assert.equal(
                    res.body.err,
                    `item ${TEST_ITEMS.goodItem.id} already exists`
                );
            });

            it(`PUT /menuitems/${TEST_ITEMS.badItem.id} --> 404 not found`, async function () {
                const res = await request(app)
                    .put(`/menuitems/${TEST_ITEMS.badItem.id}`)
                    .send(TEST_ITEMS.badItem.toJSON())
                    .expect(404);

                assert.equal(
                    res.body.err,
                    `item ${TEST_ITEMS.badItem.id} does not exist`
                );
            });

            it(`DELETE /menuitems/${TEST_ITEMS.badItem.id} --> 404 not found`, async function () {
                const res = await request(app)
                    .delete(`/menuitems/${TEST_ITEMS.badItem.id}`)
                    .expect(404);

                assert.equal(
                    res.body.err,
                    `item ${TEST_ITEMS.badItem.id} does not exist`
                );
            });
        });

        // ------------------------------------------------------------
        // EXPECTED FAILURES II — BAD DATA (400 constructor errors)
        // ------------------------------------------------------------
        describe("Expected Failures II - bad data sent", function () {
            describe("POST Requests", function () {
                it("POST missing fields --> 400", async function () {
                    const res = await request(app)
                        .post(`/menuitems/${TEST_ITEMS.itemToAdd.id}`)
                        .send({})
                        .expect(400);

                    assert.isTrue(
                        res.body.err.startsWith("MenuItem constructor error")
                    );
                });

                it("POST invalid ID --> 400", async function () {
                    const res = await request(app)
                        .post(`/menuitems/${TEST_ITEMS.itemToAdd.id}`)
                        .send({
                            id: 99,
                            category: "ENT",
                            description: "x",
                            price: 9,
                            vegetarian: false,
                        })
                        .expect(400);

                    assert.isTrue(
                        res.body.err.startsWith("MenuItem constructor error")
                    );
                });

                it("POST invalid category --> 400", async function () {
                    const res = await request(app)
                        .post(`/menuitems/${TEST_ITEMS.itemToAdd.id}`)
                        .send({
                            id: 999,
                            category: "EN",
                            description: "x",
                            price: 9,
                            vegetarian: false,
                        })
                        .expect(400);

                    assert.isTrue(
                        res.body.err.startsWith("MenuItem constructor error")
                    );
                });

                it("POST invalid price --> 400", async function () {
                    const res = await request(app)
                        .post(`/menuitems/${TEST_ITEMS.itemToAdd.id}`)
                        .send({
                            id: 999,
                            category: "ENT",
                            description: "x",
                            price: -9,
                            vegetarian: false,
                        })
                        .expect(400);

                    assert.isTrue(
                        res.body.err.startsWith("MenuItem constructor error")
                    );
                });
            });

            describe("PUT Requests", function () {
                it("PUT missing fields --> 400", async function () {
                    const original = await menuItemAccessor.getItemByID(
                        TEST_ITEMS.itemToUpdate.id
                    );

                    const res = await request(app)
                        .put(`/menuitems/${TEST_ITEMS.itemToUpdate.id}`)
                        .send({})
                        .expect(400);

                    assert.isTrue(
                        res.body.err.startsWith("MenuItem constructor error")
                    );

                    const after = await menuItemAccessor.getItemByID(
                        TEST_ITEMS.itemToUpdate.id
                    );
                    assert.deepEqual(after, original);
                });

                it("PUT invalid ID --> 400", async function () {
                    const original = await menuItemAccessor.getItemByID(
                        TEST_ITEMS.itemToUpdate.id
                    );

                    const res = await request(app)
                        .put(`/menuitems/${TEST_ITEMS.itemToUpdate.id}`)
                        .send({
                            id: 99,
                            category: "ENT",
                            description: "x",
                            price: 9,
                            vegetarian: false,
                        })
                        .expect(400);

                    assert.isTrue(
                        res.body.err.startsWith("MenuItem constructor error")
                    );

                    const after = await menuItemAccessor.getItemByID(
                        TEST_ITEMS.itemToUpdate.id
                    );
                    assert.deepEqual(after, original);
                });

                it("PUT invalid category --> 400", async function () {
                    const original = await menuItemAccessor.getItemByID(
                        TEST_ITEMS.itemToUpdate.id
                    );

                    const res = await request(app)
                        .put(`/menuitems/${TEST_ITEMS.itemToUpdate.id}`)
                        .send({
                            id: 999,
                            category: "EN",
                            description: "x",
                            price: 9,
                            vegetarian: false,
                        })
                        .expect(400);

                    assert.isTrue(
                        res.body.err.startsWith("MenuItem constructor error")
                    );

                    const after = await menuItemAccessor.getItemByID(
                        TEST_ITEMS.itemToUpdate.id
                    );
                    assert.deepEqual(after, original);
                });

                it("PUT invalid price --> 400", async function () {
                    const original = await menuItemAccessor.getItemByID(
                        TEST_ITEMS.itemToUpdate.id
                    );

                    const res = await request(app)
                        .put(`/menuitems/${TEST_ITEMS.itemToUpdate.id}`)
                        .send({
                            id: 999,
                            category: "ENT",
                            description: "x",
                            price: -9,
                            vegetarian: false,
                        })
                        .expect(400);

                    assert.isTrue(
                        res.body.err.startsWith("MenuItem constructor error")
                    );

                    const after = await menuItemAccessor.getItemByID(
                        TEST_ITEMS.itemToUpdate.id
                    );
                    assert.deepEqual(after, original);
                });
            });
        });
    });

    // ------------------------------------------------------------
    // UNSUPPORTED OPERATIONS (405)
    // ------------------------------------------------------------
    describe("Unsupported Operations", function () {
        it("GET /menuitems/:id --> 405", async function () {
            const res = await request(app)
                .get(`/menuitems/${TEST_ITEMS.goodItem.id}`)
                .expect(405);

            assert.equal(res.body.err, "Single GETs not supported");
        });

        it("POST /menuitems --> 405", async function () {
            const res = await request(app)
                .post("/menuitems")
                .send(TEST_ITEMS.goodItem)
                .expect(405);

            assert.equal(res.body.err, "Bulk POSTs not supported");
        });

        it("PUT /menuitems --> 405", async function () {
            const res = await request(app)
                .put("/menuitems")
                .send(TEST_ITEMS.itemToUpdate)
                .expect(405);

            assert.equal(res.body.err, "Bulk PUTs not supported");
        });

        it("DELETE /menuitems --> 405", async function () {
            const res = await request(app).delete("/menuitems").expect(405);

            assert.equal(res.body.err, "Bulk DELETEs not supported");
        });
    });

    // ------------------------------------------------------------
    // INVALID URLS (custom 404 page)
    // ------------------------------------------------------------
    describe("Invalid URLs", function () {
        const badUrls = [
            "/menuitem",
            "/menuitemss",
            "/menuitems/12",
            "/menuitems/1234",
        ];

        badUrls.forEach((url) => {
            it(`DELETE ${url} --> 404, custom 404 page`, async function () {
                const expectedContent = await readFile("./public/404.html");

                const res = await request(app).delete(url).expect(404);

                assert.equal(res.text, expectedContent.toString());
            });
        });
    });

    // ------------------------------------------------------------
    // INTERNAL SERVER ERRORS (500 via DI)
    // ------------------------------------------------------------
    describe("500-Level Internal Errors (DI-Based)", function () {
        // Fake accessor that throws for everything
        const brokenAccessor = {
            getAllItems: async () => {
                throw new Error("Simulated accessor failure");
            },
            getItemByID: async () => {
                throw new Error("Simulated accessor failure");
            },
            addItem: async () => {
                throw new Error("Simulated accessor failure");
            },
            updateItem: async () => {
                throw new Error("Simulated accessor failure");
            },
            deleteItem: async () => {
                throw new Error("Simulated accessor failure");
            },
            itemExists: async () => {
                throw new Error("Simulated accessor failure");
            },
        };

        let brokenApp;

        before("Setup broken app", function () {
            brokenApp = buildApp({ menuItemAccessor: brokenAccessor });
        });

        let originalConsoleError;

        before(() => {
            originalConsoleError = console.error;
            console.error = () => {}; // silence expected error logs
        });

        after(() => {
            console.error = originalConsoleError;
        });

        it("GET /menuitems --> 500 when accessor throws", async function () {
            const res = await request(brokenApp).get("/menuitems").expect(500);

            assert.include(res.body.err.toLowerCase(), "internal");
        });

        it("POST /menuitems/999 --> 500 when accessor throws", async function () {
            const res = await request(brokenApp)
                .post("/menuitems/999")
                .send({
                    id: 999,
                    category: "ENT",
                    description: "x",
                    price: 9,
                    vegetarian: false,
                })
                .expect(500);

            assert.include(res.body.err.toLowerCase(), "internal");
        });

        it("PUT /menuitems/303 --> 500 when accessor throws", async function () {
            const res = await request(brokenApp)
                .put("/menuitems/303")
                .send({
                    id: 303,
                    category: "ENT",
                    description: "updated",
                    price: 99,
                    vegetarian: false,
                })
                .expect(500);

            assert.include(res.body.err.toLowerCase(), "internal");
        });

        it("DELETE /menuitems/202 --> 500 when accessor throws", async function () {
            const res = await request(brokenApp)
                .delete("/menuitems/202")
                .expect(500);

            assert.include(res.body.err.toLowerCase(), "internal");
        });
    });
});

/* DO NOT CHANGE THIS FILE */
