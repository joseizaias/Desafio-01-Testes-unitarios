import request from "supertest";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import { createConnection, Connection } from "typeorm";

import { app } from "../../../../app";
import { response } from "express";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeEach(async () => {
    connection = await (async () => await createConnection())();
    await connection.query(`delete from users;`);
    await connection.query(`delete from statements;`);

    const id = uuid();
    const password = await hash("admin", 8);

    await connection.query(
      `insert into users(id, name, email, password)
          values('${id}', 'admin', 'admin@g.com', '${password}')
      `
    );
  });

  afterEach(async () => {
    await connection.query(`delete from users;`);
    await connection.query(`delete from statements;`);
    await connection.close()
  });

  it("should be able to authenticate a user that already exists.", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@g.com",
        password: "admin"
      });

    expect(response.body).toHaveProperty("token");

  });

  it("should NOT be able to authenticate user with wrong email", async () => {

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "wrongEmail@fake.com",
        password: "admin"
      });

    expect([500, 401, 404, undefined]).toContain(response.status);

  });

  it("should NOT be able to authenticate a user with wrong password", async () => {

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "admin@g.com",
        password: "wrongPassword!"
      });

    expect([500, 401, 404, undefined]).toContain(response.status);            //// rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

  });

});
