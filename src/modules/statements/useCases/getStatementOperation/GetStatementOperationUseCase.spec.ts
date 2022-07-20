import { stat } from "fs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get a statement", () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to show the information of a statement", async () =>{
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

    const statement_id = statement.id as string;

    const statementOperationResult = await getStatementOperationUseCase.execute({ user_id, statement_id });

    expect(statementOperationResult).toHaveProperty("amount");
  });

  it("should NOT be able to show a statement if the user does not exist", async () => {

    expect(async () => {
      const user_id = "1a";
      const statement_id = "2b";

      await getStatementOperationUseCase.execute({ user_id, statement_id });

    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);

  });

  it("should NOT be able to show a statement if the statement id does not exist", async () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "aaa",
        email: "aaa@g.com",
        password: "1234567"
      });

      const user_id = user.id as string;

      const statement_id = "2b";

      await getStatementOperationUseCase.execute({ user_id, statement_id });

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);

  });

});
