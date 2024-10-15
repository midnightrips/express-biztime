const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async function (req, res, next) {
    try {
        // Query to get all industries and their associated company codes
        const result = await db.query(
            `SELECT i.industry, i.code AS industry_code, 
                    ARRAY_AGG(ci.company_code) AS company_codes
             FROM industries AS i
             LEFT JOIN companies_industries AS ci ON i.id = ci.industry_id
             GROUP BY i.code, i.industry
             ORDER BY i.industry`
        );

        return res.json({ "industries": result.rows });
    } catch (err) {
        return next(err);
    }
});

router.post('/', async function (req, res, next) {
    try {
        let { industry } = req.body; // Get industry name from the request body
        let code = slugify(industry, { lower: true }); // Create a slug code for the industry

        const result = await db.query(
            `INSERT INTO industries (code, industry) 
             VALUES ($1, $2) 
             RETURNING code, industry`,
            [code, industry]
        );

        return res.status(201).json({ "industry": result.rows[0] }); // Return the new industry data
    } catch (err) {
        return next(err);
    }
});

module.exports = router;