import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import request from "supertest";
import { createConnection, Connection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;
let user_id: string;
let id: string;

describe("Get Balance Controller", () => {

  beforeEach(async () => {
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

    id = uuid();

    await connection.query(
      `insert into statements(id, user_id, description, amount, type, created_at, updated_at )
          values('${id}', '${user_id}', 'salary deposit', 111, 'deposit', 'now()', 'now()')
      `
    );
  });

  afterEach(async () => {
    await connection.query(`delete from users;`);
    await connection.query(`delete from statements;`);
    await connection.close()
  })

  it("Should be able to show the Balance of the user's account with a valid token", async () => {

    const responseSession = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "joseizaias@ggg.com",
        password: "12345"
      });

    const { token } = responseSession.body;

    const userBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(userBalance.body).toHaveProperty('balance');

  })

  it("Should NOT be able to show the Balance if an invalid token is provided", async () => {

    const userBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer Invalid_Token`
      });

    expect(userBalance.status).toBe(401);
  })

  it("Should NOT be able to show the Balance if no token is provided", async () => {

    const userBalance = await request(app)
      .get("/api/v1/statements/balance")

    expect(userBalance.status).toBe(401);
  })

});
