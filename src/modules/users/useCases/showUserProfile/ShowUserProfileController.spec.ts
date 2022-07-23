import request from "supertest";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import { createConnection, Connection } from "typeorm";

import { app } from "../../../../app";
import { response } from "express";
import { JWTInvalidTokenError } from "../../../../shared/errors/JWTInvalidTokenError";
import { JWTTokenMissingError } from "../../../../shared/errors/JWTTokenMissingError";

let connection: Connection;
let token: string;


describe("Show User Profile Controller", () => {
  beforeEach(async () => {
    connection = await (async () => await createConnection())();
    await connection.query(`delete from users;`);
    await connection.query(`delete from statements;`);

    await request(app)
      .post("/api/v1/users")
      .send({
        name: "jose",
        email:"jose@g.com",
        password: "123"
      });

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "jose@g.com",
        password: "123"
      });

    token = response.body.token;
  });

  afterEach(async () => {
    await connection.query(`delete from users;`);
    await connection.query(`delete from statements;`);
    await connection.close()
  });

  it("should be able to show user data only to authorized users (valid token)", async () => {

    const showUserProfileResult = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`
      });

    expect(showUserProfileResult.status).toBe(200);

  });

  it("should NOT be able to show user data to unauthorized user (invalid token)", async () => {

    const showUserProfileResult = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer 111`
      });

  // expect(async () => {}).rejects.toBeInstanceOf(JWTInvalidTokenError);

    expect(showUserProfileResult.status).toBe(401);

  });

  it("should NOT be able to show user data to a request without a token", async () => {

    const showUserProfileResult = await request(app)
      .get("/api/v1/profile");

    // expect(async () => {}).rejects.toBeInstanceOf(JWTTokenMissingError);

    expect(showUserProfileResult.status).toBe(401);

  });

});
