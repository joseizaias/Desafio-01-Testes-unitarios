import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let connection: Connection;
let user_id: string;
let token: string;

describe("Create Statement Controller", () => {
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

      const sessionResponse = await request(app)
        .post("/api/v1/sessions")
        .send({
          email: "joseizaias@ggg.com",
          password: "12345"
        });

      token = sessionResponse.body.token
  });

  afterAll(async () => {
    await connection.query(`delete from users;`);
    await connection.query(`delete from statements;`);
    await connection.close()
  })

  it("Should NOT be able to create a new withdraw statement operation if the balance result is less than zero", async () => {

    const responseNewStatement = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 999,
        description: "First withdraw but there is nothing in the account!!!"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(responseNewStatement.status).toBe(400);
    expect(responseNewStatement.body).toEqual(
      expect.objectContaining({
        message: 'Insufficient funds'
      })
    );

  });

  it("Should be able to create a new statement for a logged user with a valid token", async () => {

    const responseNewStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 9,
        description: "First deposit"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(responseNewStatement.status).toBe(201);
    expect(responseNewStatement.body).toEqual(
      expect.objectContaining({
        amount: 9
      })
    );

  });

  it("Should be able to create a new withdraw statement for a logged user with valid token and balance more than -1", async () => {

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 11,
        description: "Second deposit"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    const responseNewStatement = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 11,
        description: "First withdraw, but with sufficient money in the account"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(responseNewStatement.status).toBe(201);
    expect(responseNewStatement.body).toEqual(
      expect.objectContaining({
        amount: 11,
        type: 'withdraw'
      })
    );

  });

  it("Should NOT be able to create a new statement for a user with an invalid token", async () => {

    const responseNewStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 9,
        description: "First deposit"
      })
      .set({
        Authorization: `Bearer 111`
      });

    expect(responseNewStatement.status).toBe(401);
    expect(responseNewStatement.body).toEqual(
      expect.objectContaining({
        message: 'JWT invalid token!'
      })
    );

  });

  it("Should NOT be able to create a new statement for a user without a token", async () => {

    const responseNewStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 9,
        description: "First deposit"
      });

    expect(responseNewStatement.status).toBe(401);
    expect(responseNewStatement.body).toEqual(
      expect.objectContaining({
        message: 'JWT token is missing!'
      })
    );

  });

});
