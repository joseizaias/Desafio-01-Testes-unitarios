import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import request from "supertest";
import { createConnection, Connection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;
let user_id: string;
let token: string;
let statement_id: string;

describe('Get Statement Controller', () => {

  beforeAll(async () => {
    connection = await (async () => await createConnection())();
    await connection.query(`delete from users;`);
    await connection.query(`delete from statements;`);

    user_id = uuid();
    const password = await hash("12345", 8);

    await connection.query(
      `insert into users(id, name, email, password, created_at, updated_at )
          values('${user_id}', 'joseizaias', 'joseizaias@ggg.com', '${password}', 'now()', 'now()')
      `
    );

    statement_id = uuid();

    await connection.query(
      `insert into statements(id, user_id, description, amount, type, created_at, updated_at )
          values('${statement_id}', '${user_id}', 'salary deposit', 111, 'deposit', 'now()', 'now()')
      `
    );

    const responseSession = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "joseizaias@ggg.com",
        password: "12345"
      });

    token = responseSession.body.token;

  });

  afterAll(async () => {
    await connection.query(`delete from users;`);
    await connection.query(`delete from statements;`);
    await connection.close()
  })

  it('Should NOT be able to get the amount for an invalid statement and a valid user token', async () => {

    const fakeIdStatement = uuid();

    const operationResponse = await request(app)
      .get(`/api/v1/statements/${fakeIdStatement}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(operationResponse.status).toBe(404);
    expect(operationResponse.body).toEqual(
      expect.objectContaining({
        message: 'Statement not found'
      })
    )
  });

  it('Should be able to get the amount for a valid statement and a valid user token', async () => {

    const operationResponse = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(operationResponse.status).toBe(200);
    expect(operationResponse.body).toEqual(
      expect.objectContaining({
        type: 'deposit'
      })
    )
  });

  it('Should NOT be able to get the amount for a valid statement and an invalid user token', async () => {

    const operationResponse = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer 111`
      });

    expect(operationResponse.status).toBe(401);
    expect(operationResponse.body).toEqual(
      expect.objectContaining({
        message: 'JWT invalid token!'
      })
    )
  });

});
