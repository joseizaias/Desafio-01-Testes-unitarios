import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance", () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("should be able to show the account balance", async () => {

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

    const balanceResult = await getBalanceUseCase.execute({user_id});

    expect(balanceResult).toHaveProperty("statement");

  });

  it("should NOT be able to to show the account balance if the user does not exist", async () => {

    expect(async () => {
      const user_id = "1a";

      await getBalanceUseCase.execute({user_id});

    }).rejects.toBeInstanceOf(GetBalanceError);
  })

});
