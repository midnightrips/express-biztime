process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");

    await db.query(`INSERT INTO companies (code, name, description) 
                    VALUES ('apple', 'Apple', 'Maker of iPhones')`);

    await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date)
                    VALUES ('apple', 100, false, '2024-01-01')`);
});

afterAll(async () => {
    await db.end();
});

describe("GET /invoices", () => {
    test("Gets a list of invoices", async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoices: [{ id: expect.any(Number), comp_code: 'apple' }]
        });
    });
});

describe("GET /invoices/:id", () => {
    test("Gets details of a single invoice by id", async () => {
        const res = await request(app).get('/invoices/1');  // Assuming id 1 exists from setup
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                id: 1,
                amt: 100,
                paid: false,
                add_date: '2024-01-01T00:00:00.000Z',
                paid_date: null,
                name: 'Apple',
                description: 'Maker of iPhones'
            }
        });
    });

    test("Responds with 404 if invoice not found", async () => {
        const res = await request(app).get('/invoices/999');  // Non-existing id
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /invoices", () => {
    test("Creates a new invoice", async () => {
        const newInvoice = { comp_code: 'apple', amt: 200 };
        const res = await request(app).post('/invoices').send(newInvoice);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: {
                id: expect.any(Number),
                comp_code: 'apple',
                amt: 200,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    });

    test("Throws error when missing required fields", async () => {
        const res = await request(app).post('/invoices').send({});
        expect(res.statusCode).toBe(500);  // Assuming no validation is set up yet
    });
});

describe("PUT /invoices/:id", () => {
    test("Updates an existing invoice", async () => {
        const updatedInvoice = { amt: 150 };
        const res = await request(app).put('/invoices/1').send(updatedInvoice);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                id: 1,
                comp_code: 'apple',
                amt: 150,
                paid: false,
                add_date: '2024-01-01T00:00:00.000Z',
                paid_date: null
            }
        });
    });

    test("Responds with 404 if invoice not found", async () => {
        const res = await request(app).put('/invoices/999').send({ amt: 300 });
        expect(res.statusCode).toBe(404);
    });
});

describe("DELETE /invoices/:id", () => {
    test("Deletes an existing invoice", async () => {
        const res = await request(app).delete('/invoices/1');  // Assuming id 1 exists
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
    });

    test("Responds with 404 if invoice not found", async () => {
        const res = await request(app).delete('/invoices/999');  // Non-existing id
        expect(res.statusCode).toBe(404);
    });
});
