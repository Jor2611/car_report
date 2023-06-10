import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccountService } from './account.service';
import { Account } from './account.entity';
import { mockAccount } from '../../test/mockedData'; 
import { JwtService } from '@nestjs/jwt';

const { 
  fakeId, 
  email, 
  updatedEmail, 
  password, 
  updatedPassword,
  role, 
  updatedRole 
} = mockAccount;

let accounts = [];

describe('AccountService', () => {
  let service: AccountService;
  let repo: Repository<Account>;
  let jwtService: JwtService;

  beforeEach(async () => {
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountService, 
        {
          provide: getRepositoryToken(Account),
          ///////////////////////////
          /// Repo functions mock ///
          ///////////////////////////
          useValue: {
            find: jest.fn().mockImplementation((arg) => {
              const [[key,value]]= Object.entries(arg.where);
              return accounts.filter(account => account[key] === value);
            }),
            findOne: jest.fn().mockImplementation((arg) => {
              const [[key,value]]= Object.entries(arg.where);
              const account = accounts.filter(account => account[key] === value)[0];
              return Promise.resolve(account);
            }),
            create: jest.fn().mockImplementation((args) => {
              const account = {...args, id: Math.floor(Math.random()*999)};
              accounts.push(account);
              return account;
            }),
            save: jest.fn().mockImplementation((args) => {
              accounts = accounts.map(account => {
                if(account.id === args.id && args.attrs){
                  Object.assign(account,args.attrs)
                }
                return account;
              })
              return args;
            }),
            remove: jest.fn().mockImplementation((arg) => {
              accounts = accounts.filter(account => account.id !== arg.id)
              return arg.id;
            })
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation(() => {
              return 'thisisToken';
            })
          }
        }
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    repo = module.get<Repository<Account>>(getRepositoryToken(Account));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(async() => {
    accounts = [];
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new account and return token', async() => {
    const spyOnFindOne = jest.spyOn(repo, 'findOne');
    const spyOnCreate = jest.spyOn(repo, 'create');
    const spyOneSave = jest.spyOn(repo, 'save');
    const spyOnJwt = jest.spyOn(jwtService, 'sign');

    const { token, ...account } = await service.signup(email,password,role);

    expect(spyOnFindOne).toBeCalledWith({ where : { email } });
    expect(spyOnCreate).toBeCalledWith({ email, password: account.password, role });
    expect(spyOneSave).toBeCalledWith(account);
    expect(spyOnJwt).toBeCalledWith({ id: account.id, email, role });
    expect(account).toBeDefined();
    expect(token).toBeDefined();
    expect(accounts).toHaveLength(1);
  });

  it('should throw BadRequestException if email already exists', async() => {
    const spyOnFindOne = jest.spyOn(repo, 'findOne');
    
    await service.signup(email,password,role);

    expect(spyOnFindOne).toBeCalledWith({ where: { email } });
    expect(service.signup(email,password,role))
      .rejects.toThrow(BadRequestException);
  });

  it('should create a new account with encrypted password', async() => {
    const account = await service.signup(email, password, role);
    const [salt,hash] = account.password.split('.');

    expect(account).toBeDefined();
    expect(password).not.toBe(account.password);
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('should sign in an existing account and return a token', async() => {
    const spyOnFindOne = jest.spyOn(repo, 'findOne');
    
    await service.signup(email,password,role);
    const account = await service.signin(email,password);

    expect(spyOnFindOne).toBeCalledWith({ where: { email } });
    expect(accounts).toHaveLength(1);
    expect(account).toBeDefined();
    expect(account.token).toBeDefined();
  });

  it('should throw a BadRequestException for invalid email', async() => {
    const fakeEmail = email; 
    const spyOnFindOne = jest.spyOn(repo, 'findOne');

    expect(service.signin(fakeEmail,password)).rejects.toThrow(BadRequestException);
    expect(spyOnFindOne).toBeCalledWith({ where: { email: fakeEmail } });
  });

  it('should throw a BadRequestException for invalid password', async() => {
    const spyOnFindOne = jest.spyOn(repo, 'findOne');

    await service.signup(email, password, role);

    expect(spyOnFindOne).toBeCalledWith({ where: { email } });
    expect(accounts).toHaveLength(1);
    expect(service.signin(email,'wrongpassword')).rejects.toThrow(BadRequestException);
  });

  it('should retrieve an account with the provided id', async() => {
    const spyOnFindOne = jest.spyOn(repo, 'findOne');

    const { id } = await service.signup(email,password,role);
    const account = await service.findOne(id);

    expect(spyOnFindOne).toBeCalledWith({ where: { id } });
    expect(accounts).toHaveLength(1);
    expect(account).toBeDefined();
    expect(account.id).toEqual(id);
    expect(account.email).toEqual(email);
  });
  
  it('should throw NotFound error when fetching an account with an invalid ID', async() => {
    const spyOnFindOne = jest.spyOn(repo, 'findOne');

    const { id } = await service.signup(email,password,role);
    
    expect(accounts).toHaveLength(1);
    expect(id).not.toBe(fakeId);
    expect(service.findOne(fakeId)).rejects.toThrow(NotFoundException);
    expect(spyOnFindOne).toBeCalledWith({ where: { id: fakeId } });
  });
  
  it('hould return null when fetching an account with a null ID', async() => {
    await service.signup(email,password,role);
    const account = await service.findOne(null);
    
    expect(accounts).toHaveLength(1);
    expect(account).toBeNull();
  });

  it('should update the account, if provided correct id and attributes', async() => {
    const spyOneFindOne = jest.spyOn(repo,'findOne');
    const spyOneSave = jest.spyOn(repo,'save');

    //////////////////////////////////////////////////////////
    /// Destructuring account object to avoid interference ///
    /// with the updatedAccount during testing.            ///
    //////////////////////////////////////////////////////////

    const { id, ...account } = await service.signup(email,password,role);

    const updatedAccount = await service.update(id, { 
      email: updatedEmail, 
      password: updatedPassword, 
      role: updatedRole 
    });

    //Attempt to signin with updated password
    const signedInAccount = await service.signin(updatedEmail, updatedPassword);
      
    expect(accounts).toHaveLength(1);
    expect(account).toBeDefined();
    expect(updatedAccount).toBeDefined();
    expect(spyOneFindOne).toBeCalledTimes(3);
    expect(spyOneSave).toBeCalledTimes(2);
    expect(id).toEqual(updatedAccount.id);
    expect(account.email).not.toEqual(updatedAccount.email);
    expect(account.role).not.toEqual(updatedAccount.role);
    expect(signedInAccount).toBeDefined();
    expect(signedInAccount.id).toEqual(updatedAccount.id);
  });

  it('should throw a NotFound error when updating an account with an incorrect ID',async() => {
    const { id } = await service.signup(email, password, role);

    expect(accounts).toHaveLength(1);
    expect(id).not.toEqual(fakeId);
    expect(service.update(fakeId,{ email: updatedEmail })).rejects.toThrow(NotFoundException);
  });

  it('should remove an account with provided id', async() => {
    const spyOnFindOne = jest.spyOn(repo,'findOne');
    const spyOnRemove = jest.spyOn(repo,'remove');

    const { token, ...account } = await service.signup(email, password, role);
    const result = await service.remove(account.id);

    expect(accounts).toHaveLength(0);
    expect(spyOnFindOne).toBeCalledWith({ where: { id: account.id } });
    expect(spyOnRemove).toBeCalledWith(account);
    expect(result).toEqual({ id: account.id });
  });

  it('should throw a NotFound error when attempting to remove a non-existing account', async() => {
    const spyOnFindOne = jest.spyOn(repo,'findOne');
    const spyOnRemove = jest.spyOn(repo,'remove');

    const account = await service.signup(email, password, role);

    expect(accounts).toHaveLength(1);
    expect(fakeId).not.toEqual(account.id);
    expect(service.remove(fakeId)).rejects.toThrow(NotFoundException);
    expect(spyOnFindOne).toBeCalledWith({ where: { id: fakeId } });
    expect(spyOnRemove).not.toBeCalled();
  });
});


