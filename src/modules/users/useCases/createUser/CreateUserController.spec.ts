import request from "supertest";
import { createConnection, Connection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {

  beforeEach(async () => {
    connection = await (async () => await createConnection())();
    await connection.query(`delete from users;`);
    await connection.query(`delete from statements;`);
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "izaias",
        email:"izaias@ggg.com",
        password: "123"
      });
  });

  afterEach(async () => {
    await connection.query(`delete from users;`);
    await connection.query(`delete from statements;`);
    await connection.close()
  })

  it("should be able to create a new user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "jose",
        email:"jose@g.com",
        password: "123"
      });

    expect(response.status).toBe(201);

  });

  it("should NOT be able to create a new user with an already existing email", async () => {

    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "izaias",
        email:"izaias@ggg.com",
        password: "123"
      });

    expect(response.status).toBe(500);
  });

});
