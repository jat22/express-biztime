process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require('../db');

let testCompany;
beforeEach(async()=>{
	const result = await db.query(`INSERT INTO companies(code, name, description) VALUES ('test', 'Test Company', 'Testing 123') RETURNING code, name, description`);
	testCompany = result.rows[0]
})

afterEach(async() => {
	await db.query(`DELETE FROM companies`),
	await db.query('DELETE FROM invoices')
});

afterAll(async() => {await db.end()});

describe("GET /companies", () => {
	test('Get company list', async() => {
		const res = await request(app).get('/companies');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({companies : [testCompany]});
	});
});

describe("Get /companies/:code", () => {
	test('Get a single company', async () => {
		const res = await request(app).get('/companies/test');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			company: testCompany,
			invoices : []
		});
	});
	test('Responds with 404 if invalid code', async () => {
		const res = await request(app).get('/companies/dnd');
		expect(res.statusCode).toBe(404);
	});
})

describe("Post /companies", () => {
	test('Create new company', async() => {
		const res = await request(app).post('/companies').send({code: "check", name: "Checking Create", description: 'Does this thing work?'});
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ company: { code: 'check', name : 'Checking Create', description: 'Does this thing work?'}} );
	})
})

describe("Put /comapnies/:code", () => {
	test('Edit company info', async() => {
		const res = await request(app).put('/companies/test').send({name : "New Test Comp", description : "WE have updated our company"});
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ company: { code : 'test', name : 'New Test Comp', description : "WE have updated our company"}})
	});
	test('Responds with 404 if invalid code', async () => {
		const res = await request(app).put('/companies/dnd').send({name : "New Test Comp", description : "WE have updated our company"});
		expect(res.statusCode).toBe(404);
	});
})

describe("Delete /companies/:code", () => {
	test('Delete company', async() => {
		const res = await request(app).delete('/companies/test');
		expect(res.statusCode).toBe(202);
		expect(res.body).toEqual({status:"deleted"})
	});
	test('Responds with 404 if invalid code', async () => {
		const res = await request(app).delete('/companies/dnd');
		expect(res.statusCode).toBe(404);
	});
})