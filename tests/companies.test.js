process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');


beforeEach(async () => {
    await db.query("DELETE FROM companies");
    await db.query(`INSERT INTO companies (code, name, description) 
                    VALUES ('apple', 'Apple', 'Maker of iPhones')`);
});

afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test('Gets a list of companies', async function () {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            companies: [{ code: 'apple', name: 'Apple' }]
        });
    });
});

describe("GET /companies/:code", () => {
    test("Gets details of a single company via company code", async function () {
        const res = await request(app).get('/companies/apple');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                code: 'apple',
                name: 'Apple',
                description: 'Maker of iPhones',
                invoices: []
            }
        });
    });
    test("Responds with 404 if company not found", async function () {
        const res = await request(app).get('/companies/test');
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /companies", () => {
    test("Creates a new company", async () => {
        const newCompany = { code: 'ibm', name: 'IBM', description: 'Tech company' };
        const res = await request(app).post('/companies').send(newCompany);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: newCompany
        });
    });

    test("Throws error when missing required fields", async () => {
        const res = await request(app).post('/companies').send({ name: 'IBM' });
        expect(res.statusCode).toBe(500); // Assuming validation isn't set up yet
    });
});

describe("PUT /companies/:code", () => {
    test("Updates an existing company", async () => {
        const updatedCompany = { name: 'Apple Inc.', description: 'Tech giant' };
        const res = await request(app).put('/companies/apple').send(updatedCompany);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                code: 'apple',
                name: 'Apple Inc.',
                description: 'Tech giant'
            }
        });
    });

    test("Responds with 404 if company not found", async () => {
        const res = await request(app).put('/companies/unknown').send({ name: 'Test', description: 'Testing' });
        expect(res.statusCode).toBe(404);
    });
});

describe("DELETE /companies/:code", () => {
    test("Deletes an existing company", async () => {
        const res = await request(app).delete('/companies/apple');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
    });

    test("Responds with 404 if company not found", async () => {
        const res = await request(app).delete('/companies/unknown');
        expect(res.statusCode).toBe(404);
    });
});