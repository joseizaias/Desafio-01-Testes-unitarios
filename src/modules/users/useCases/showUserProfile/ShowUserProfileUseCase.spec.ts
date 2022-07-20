import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show User Profile", () => {
  let createUserUseCase: CreateUserUseCase;
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should be able to show user data if a valid token has been received", async () => {
    const user = await createUserUseCase.execute({
      name: "bbb",
      email: "bbb@g.com",
      password: "1234567"
    });

    const showUserProfileResult = await showUserProfileUseCase.execute(user.id as string);

    expect(showUserProfileResult).toHaveProperty("id");
  })

  it("should be able to deny accessing data if the user does not exist", async () => {
    expect(async () => {
      const user_id = "1a";
      await showUserProfileUseCase.execute(user_id);

    }).rejects.toBeInstanceOf(ShowUserProfileError);

  });

});
