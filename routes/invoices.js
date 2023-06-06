const db = require("../db")
const express = require('express');
const ExpressError = require("../expressError");
const router = express.Router();

router.get('/', async(req, res, next) => {
	try {
		const results = await db.query('SELECT * FROM invoices');
		return res.json({invoices: [results.rows]})
	} catch(e){
		next(e)
	}
})

router.get('/:id', async(req, res, next) => {
	try{
		const { id } = req.params;
		const result = await db.query(
			'SELECT * FROM invoices WHERE id=$1', [id]
		);
		if (result.length === 0){
			throw new ExpressError(`Can not find invoice with id ${id}`, 404)
		}
		return res.json({invoice: result.rows[0]})
	} catch(e){
		next(e)
	}
})

router.post('/', async(req, res, next) => {
	try{
		const { comp_code, amt } = req.body;
		const result = await db.query(
			'INSERT INTO invoices (comp_code, amt) VALUES($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]
		);
		return res.status(201).json({invoice: result.rows[0]});
	}catch(e){
		next(e);
	}
});

router.put('/:id', async(req, res, next) => {
	try {
		const { id } = req.params;
		const { amt } = req.body
		const result = await db.query(
			'UPDATE invoices SET amt=$2 WHERE id=$1 RETURNING id, comp_code, amt, paid, add_date, paid_date', [id, amt]
		)
		if(result.rows.length === 0){
			throw new ExpressError(`Can not find invoice with id of ${id}`, 404);
		};
		return res.status(201).json({invoice: result.rows[0]})
	} catch(e){
		next(e);
	}
 });

router.delete('/:id', async(req, res, next) => {
	try {
		const { id } = req.params;
		const result = await db.query(
			'DELETE FROM invoices WHERE id=$1', [id]
		)
		if(result.rowCount === 0){
			throw new ExpressError(`Can not find invoice with id of ${id}`, 404);
		};
		return res.status(202).json({status : "deleted"})
	} catch(e){
		next(e);
	}
 });

module.exports = router;