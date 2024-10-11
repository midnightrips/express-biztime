const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

// Get list of companies
router.get('/', async function (req, res, next) {
    try {
        const result = await db.query(
            `SELECT code, name
            FROM companies
            ORDER BY name`
        );

        return res.json({ "companies": result.rows });
    } catch (err) {
        return next(err);
    }
});

// get information on specific company via company code
router.get('/:code', async function (req, res, next) {
    try {
        let code = req.params.code;

        const compResult = await db.query(
            `SELECT code, name, description FROM companies WHERE code = $1`, [code]
        );

        const invResult = await db.query(
            `SELECT id
            FROM invoices
            WHERE comp_code = $1`, [code]
        );


        if (compResult.rows.length === 0) {
            throw new ExpressError(`Company not found: ${code}`, 404);
        }

        const company = compResult.rows[0];
        const invoices = invResult.rows; //all invoices for the company

        company.invoices = invoices.map(inv => inv.id); //What is this line of code doing/for?

        return res.json({ "company": company });
    } catch (err) {
        return next(err);
    }

});

router.post('/', async function (req, res, next) {
    try {
        const { code, name, description } = req.body;

        const result = await db.query(
            `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]
        );

        return res.status(201).json({ "company": result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.put("/:code", async function (req, res, next) { //I originally put .patch
    try {
        const { name, description } = req.body;

        const result = await db.query(
            `UPDATE companies SET name=$1, description=$2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, req.params.code]
        );
        if (result.rows.length === 0) {
            throw new ExpressError(`Company not found: ${req.params.code}`, 404);
        }
        return res.json({ "company": result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.delete("/:code", async function (req, res, next) {
    try {
        const result = await db.query(
            `DELETE FROM companies WHERE code = $1`, [req.params.code]
        );
        if (result.rows.length === 0) {
            throw new ExpressError(`Company not found: ${req.params.code}`, 404);
        }
        return res.json({ "status": "deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;