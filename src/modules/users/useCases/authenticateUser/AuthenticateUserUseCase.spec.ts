import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

describe("Authenticate User", () => {
    let authenticateUserUseCase: AuthenticateUserUseCase;
    let inMemoryUsersRepository: InMemoryUsersRepository;
    let createUserUseCase: CreateUserUseCase;

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    });

    it("should be able to authenticate a user with a valid token", async () => {
      const user = {
        name: "aaa",
        email: "aaa@g.com",
        password: "1234567"
      };

      await createUserUseCase.execute( user );

      const authenticatedResult = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password
      });

      expect(authenticatedResult).toHaveProperty("token");
    });

});
