import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("Create User", () => {
    let createUserUseCase: CreateUserUseCase;
    let inMemoryUsersRepository: InMemoryUsersRepository;

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    });

    it("should be able to create a new user", async () => {
      const user = {
        name: "aaa",
        email: "aaa@g.com",
        password: "1234567"
      };

      await createUserUseCase.execute( user );

      const createdUser = await inMemoryUsersRepository.findByEmail(user.email);

      expect(createdUser).toHaveProperty("id");
    });

    it("should NOT be able to create a new user if it exists.", async () => {

      expect(async () => {
        const user = {
          name: "aaa",
          email: "aaa@g.com",
          password: "1234567"
        };

        await createUserUseCase.execute( user );

        await createUserUseCase.execute( user );

        const createdUser = await inMemoryUsersRepository.findByEmail(user.email);

      }).rejects.toBeInstanceOf(CreateUserError);

    });

});
