const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

// get info on invoices

router.get('/', async function (req, res, next) {
    try {
        const result = await db.query(
            `SELECT id, comp_code
            FROM invoices
            ORDER BY id`
        );

        return res.json({ "invoices": result.rows });
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;

        const result = await db.query(
            `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description
            FROM invoices AS i
            INNER JOIN companies AS c ON (i.comp_code = c.code)
            WHERE id = $1`, [id]
        );
        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice not found: ${id}`, 404);
        }
        return res.json({ "invoice": result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.post('/', async function (req, res, next) {
    try {
        const { comp_code, amt } = req.body;

        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]
        );

        return res.status(201).json({ "invoice": result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;

        const { amt } = req.body;

        const result = await db.query(
            `UPDATE inoives SET amt = $1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]
        );
        if (result.rows.length === 0) {
            throw new ExpressError(`Company not found: ${id}`, 404);
        }
        return res.json({ "invoice": result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;

        const result = await db.query(
            `DELETE FROM invoices WHERE id = $1`, [id]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`Company not found: ${id}`, 404);
        }
        return res.json({ "status": "deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;