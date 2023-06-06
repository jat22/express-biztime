
const db = require("../db")
const express = require('express');
const ExpressError = require("../expressError");
const router = express.Router();


router.get('/', async (req, res, next) => {
	try{
		const results = await db.query('SELECT * FROM companies');
		return res.json({companies: results.rows});
	} catch(e){
		next(e);
	};
		
});

router.get('/:code', async(req, res, next) => {
	
	try {
		const { code } = req.params;
		const compResult = await db.query(
			`SELECT * FROM companies WHERE code = $1`, 
			[code]);
		if (compResult.rows.length === 0){
			throw new ExpressError(`Can not find company with code ${code}`, 404);
		};
		const invResult = await db.query(
			'SELECT * FROM invoices WHERE comp_code=$1',
			[code]
		)
		return res.json({ company : compResult.rows[0], invoices : invResult.rows });
	} catch(e){
		return next(e);
	};
	
});

router.post('/', async(req, res, next) =>{
	try {
		const { code, name, description } = req.body;
		const result = db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
		return res.status(201).json({ company: result.rows[0] });
	} catch(e){
		next(e);
	};
});

router.put('/:code', async(req, res, next)=>{
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const result = await db.query(
			'UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description', 
			[code, name, description]);
		if (result.rows.length === 0){
			throw new ExpressError(`Can not find company with code ${code}`, 404);
		};
		return res.status(201).json({ company: result.rows[0] });
	} catch(e){
		next(e);
	};
});

router.delete('/:code', async(req,res,next) => {
	try{
		const { code } = req.params;
		const result = await db.query(
			'DELETE FROM companies WHERE code=$1', [code]
		);
		if(result.rowCount === 0){
			throw new ExpressError(`Can not find company with code ${code}`, 404);
		};
		return res.status(202).json({ status: "deleted" });
	} catch(e){
		next(e);
	};
});

module.exports = router;