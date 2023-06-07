const db = require("../db")
const express = require('express');
const ExpressError = require("../expressError");
const router = express.Router();


router.get('/', async (req, res, next) => {
	try{
		const results = await db.query(`
			SELECT i.code, i.name, ARRAY_AGG(c.code) AS companies
			FROM industries AS i
			LEFT JOIN ids_cps AS ic ON ic.ind_code = i.code
			LEFT JOIN companies AS c ON c.code = ic.comp_code
			GROUP BY i.code;`
		)
		return res.json({industries: results.rows});
	} catch(e){
		return next(e);
	};
});

router.post('/', async(req, res, next) => {
	try{
		const { code, name } = req.body;
		const result = await db.query('INSERT INTO industries (code, name) VALUES ($1,$2) RETURNING code, name', [code, name])
		return res.status(201).json({industry: result.rows[0]})
	} catch(e){
		return next(e)
	}
})


module.exports = router