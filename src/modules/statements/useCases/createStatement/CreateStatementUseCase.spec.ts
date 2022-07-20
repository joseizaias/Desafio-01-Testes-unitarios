import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create a statement", () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to create a deposit (statement)", async () => {
    const user = await createUserUseCase.execute({
      name: "aaa",
      email: "aaa@g.com",
      password: "1234567"
    });

    const { id } = user;
    const user_id = id as string;
    const type = OperationType.DEPOSIT;
    const amount = 111;
    const description = "just a test...";

    const statement = await createStatementUseCase.execute({
      user_id,
      type,
      amount,
      description
    });

    expect(statement).toHaveProperty("user_id");

  });

  it("should NOT be able to create a new deposit or withdraw (statement) if the user does not exist", async () => {

    expect(async () => {
      const user_id = "1a";
      const type = OperationType.DEPOSIT;
      const amount = 111;
      const description = "just a test...";

      const statement = await createStatementUseCase.execute({
        user_id,
        type,
        amount,
        description
      });

    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);

  });

  it("should be able to create a withdraw (statement) if the balance minus amount is a positive number", async () => {
    const user = await createUserUseCase.execute({
      name: "aaa",
      email: "aaa@g.com",
      password: "1234567"
    });

    const { id } = user;
    const user_id = id as string;
    let type = OperationType.DEPOSIT;
    let amount = 111;
    let description = "It is a DEPOSIT";

    await createStatementUseCase.execute({
      user_id,
      type,
      amount,
      description
    });

    type = OperationType.WITHDRAW;
    amount = 1;
    description = "It is a WITHDRAW";

    const statement = await createStatementUseCase.execute({
      user_id,
      type,
      amount,
      description
    });

    expect(statement).toHaveProperty("user_id");

  });

  it("should NOT be able to create a withdraw (statement) if the balance minus amount is a negative number", async () => {

    await expect(async () => {
      const user = await createUserUseCase.execute({
        name: "aaa",
        email: "aaa@g.com",
        password: "1234567"
      });

      const { id } = user;
      const user_id = id as string;
      let type = OperationType.DEPOSIT;
      let amount = 111;
      let description = "It is a DEPOSIT";

      await createStatementUseCase.execute({
        user_id,
        type,
        amount,
        description
      });

      type = OperationType.WITHDRAW;
      amount = 9999;
      description = "It is a WITHDRAW";

      await createStatementUseCase.execute({
        user_id,
        type,
        amount,
        description
      });

    }).rejects.toEqual({"message": "Insufficient funds", "statusCode": 400});

  });

});
