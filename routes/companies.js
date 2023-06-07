
const db = require("../db")
const express = require('express');
const ExpressError = require("../expressError");
const { default: slugify } = require("slugify");
const router = express.Router();


router.get('/', async (req, res, next) => {
	try{
		const results = await db.query('SELECT * FROM companies');
		return res.json({companies: results.rows});
	} catch(e){
		return next(e);
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
		const indResults = await db.query(
			`SELECT i.name
			FROM industries AS i
			JOIN ids_cps AS ic ON ic.ind_code = i.code
			JOIN companies AS c ON c.code = ic.comp_code
			WHERE c.code = $1`,
			[code]
		)
		return res.json({ company : compResult.rows[0], invoices : invResult.rows, industries : indResults.rows });
	} catch(e){
		return next(e);
	};
});

router.post('/', async(req, res, next) =>{
	try {
		const { name, description } = req.body;
		const code = slugify(name, {lower:true})
		const result = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
		return res.status(201).json({ company: result.rows[0] });
	} catch(e){
		return next(e);
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
		return next(e);
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
		return next(e);
	};
});

router.post('/:code/industries', async(req, res, next) => {
	try{
		const comp_code = req.params.code
		const { ind_code } = req.body

		const company = await db.query(
			'SELECT name FROM companies WHERE code=$1', [comp_code])
		if (company.rows.length === 0){
			throw new ExpressError(`Company ${comp_code} does not exist`, 404);
		}

		const industry = await db.query(
			'SELECT name FROM industries WHERE code=$1', [ind_code])
		if (industry.rows.length === 0){
			throw new ExpressError(`Industry ${ind_code} does not exist`, 404);
		}

		const result = await db.query(
			`INSERT INTO ids_cps (ind_code, comp_code) VALUES ($1, $2) RETURNING ind_code, comp_code`, [ind_code, comp_code])
		return res.status(201).json({association: result.rows[0]})
	} catch(e){
		return next(e)
	}
})

module.exports = router;