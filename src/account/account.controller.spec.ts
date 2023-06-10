import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Account } from './account.entity';
import { mockAccount } from '../../test/mockedData';
import { Roles } from './roles.enum';
import { Serialize } from '../interceptors/serialize.interceptor';

const { email, updatedEmail, password, updatedPassword, role, updatedRole, token } = mockAccount;
describe('AccountController', () => {
  let controller: AccountController;
  let mockAccountService: Partial<AccountService>;
  let accounts = [];

  beforeEach(async () => {
    mockAccountService = {
      findOne:(id:number) => {
        const [account] = accounts.filter(item => item.id===id);
        return Promise.resolve(account);
      },
      signup:(email: string, password: string, role: Roles) => {
        const account = { id: Math.floor(Math.random() * 999), email, password, role, token, reports: [] };
        accounts.push(account);
        return Promise.resolve(account);
      },
      signin:(email: string, password: string) => {
        const [account] = accounts.filter(item => item.email == email && item.password == password);
        return Promise.resolve(account);
      },
      update:(id: number, attrs: Partial<Account>) => {
        const [account] = accounts.filter(item => item.id == id);
        Object.assign(account,attrs);
        return Promise.resolve(account);
      },
      remove: (id: number) => {
        accounts = accounts.filter(item => item.id !== id);
        return Promise.resolve({ id });
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService
        }
      ]
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  afterEach(async() => {
    accounts = [];
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should fetch an account by ID', async() => {
    const { id } = await controller.signup({ email, password, role});
    const account = await controller.fetchAccount(`${id}`);

    expect(account).toBeDefined();
    expect(account.id).toEqual(id);
  })

  it('should signup a new account', async() => {
    const account = await controller.signup({ email, password, role});

    expect(account).toBeDefined();
    expect(account.token).toBeDefined();
    expect(accounts).toHaveLength(1);
  });

  it('should sign in an account', async() => {
    const account = await controller.signup({ email, password, role});
    const signedAccount = await controller.signin({ email, password });

    expect(account).toBeDefined();
    expect(signedAccount).toBeDefined();
    expect(accounts).toHaveLength(1);
    expect(account.id).toEqual(signedAccount.id);
    expect(signedAccount.token).toBeDefined();
  });

  it('should update an account', async() => {
    const { ...account } = await controller.signup({ email, password, role});
    const updatedAccount = await controller.updateAccount(`${account.id}`, { email: updatedEmail, password: updatedPassword, role: updatedRole });

    expect(accounts).toHaveLength(1);
    expect(account.id).toEqual(updatedAccount.id);
    expect(account.email).not.toEqual(updatedAccount.email);
    expect(account.role).not.toEqual(updatedAccount.role);
  });

  it('should remove an account', async() => {
    const account = await controller.signup({ email, password, role});
    const result = await controller.removeAccount(`${account.id}`);
    
    expect(accounts).toHaveLength(0);
    expect(result).toEqual({ id: account.id});
  });

});
