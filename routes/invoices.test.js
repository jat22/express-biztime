process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require('../db');

let testCompany;
let testInvoice
beforeEach(async()=>{
	const companyResult = await db.query(`INSERT INTO companies(code, name, description) VALUES ('test', 'Test Company', 'Testing 123') RETURNING code, name, description`);
	testCompany = companyResult.rows[0];
	const invoiceResult = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('test', '400') RETURNING id, comp_code, amt, paid, add_date, paid_date`);
	testInvoice = invoiceResult.rows[0]
})

afterEach(async() => {
	await db.query(`DELETE FROM companies`);
	await db.query('DELETE FROM invoices')
});

afterAll(async() => {await db.end()});

describe("GET /invoices", () => {
	test('Get invoice list', async() => {
		const res = await request(app).get('/invoices');
		expect(res.statusCode).toBe(200);
		expect(res.body.invoices.length).toBe(1);
	});
});

describe("Get /invoices/:id", () => {
	test('Get a single invoice', async () => {
		const res = await request(app).get(`/invoices/${testInvoice.id}`);
		expect(res.statusCode).toBe(200);
		expect(res.body.invoice.id).toBe(testInvoice.id);
	});
	test('Responds with 404 if invalid invoice id', async () => {
		const res = await request(app).get('/invoices/999999999');
		expect(res.statusCode).toBe(404);
	});
})

describe("Post /invoices", () => {
	test('Create new invoice', async() => {
		const res = await request(app).post('/invoices').send({comp_code :'test', amt : 100});
		expect(res.statusCode).toBe(201);
		expect(res.body.invoice.amt).toBe(100);
		expect(res.body.invoice.id).toEqual(expect.any(Number))
	})
})

describe("Put /invoices/:id", () => {
	test('Edit invoice', async() => {
		const res = await request(app).put(`/invoices/${testInvoice.id}`).send({amt : 500});
		expect(res.statusCode).toBe(201);
		expect(res.body.invoice.amt).toBe(500);
	});
	test('Responds with 404 if invalid invoice number', async () => {
		const res = await request(app).put('/invoices/9999999').send({ amt : 500});
		expect(res.statusCode).toBe(404);
	});
})

describe("Delete /invoices/:id", () => {
	test('Delete invoice', async() => {
		const res = await request(app).delete(`/invoices/${testInvoice.id}`);
		expect(res.statusCode).toBe(202);
		expect(res.body).toEqual({status:"deleted"})
	});
	test('Responds with 404 if invalid invoice number', async () => {
		const res = await request(app).delete('/invoices/999999999');
		expect(res.statusCode).toBe(404);
	});
})