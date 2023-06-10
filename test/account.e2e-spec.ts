import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { mockAccount } from "./mockedData";
import * as request from "supertest";
import { Roles } from "../src/account/roles.enum";
import { CreateAccountDto } from "../src/account/dtos/create-account.dto";

describe('Account', () => {
  let app: INestApplication;
  const { email, password, role, updatedEmail, updatedRole, updatedPassword } = mockAccount;
  const sampleAccount = { email, password, role };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const signUp = async(accountData: CreateAccountDto) => {
    const { body: account } = await request(app.getHttpServer())
      .post('/account/signup')
      .send(accountData)
      .expect(201);
    
    return account;
  };


  it('should create a new account and return the account id and issued token', async() => {
    const account = await signUp(sampleAccount);

    expect(account).toBeDefined();
    expect(account.id).toBeDefined();
    expect(account.token).toBeDefined();
  });

  it('should return a BadRequest error when attempting to sign up with an existing account email', async() => {
    await signUp(sampleAccount);
    await request(app.getHttpServer())
      .post('/account/signup')
      .send(sampleAccount)
      .expect(400);
  });

  it('should sign in an existing account and return the account id and issued token', async() => {
    const account = await signUp(sampleAccount);

    const { body: loggedInAccount } =  await request(app.getHttpServer())
      .post('/account/signin')
      .send({ email, password })
      .expect(200);
      
    expect(account).toBeDefined();
    expect(loggedInAccount).toBeDefined();
    expect(loggedInAccount.token).toBeDefined();
    expect(account.id).toEqual(loggedInAccount.id);
  });

  it('should return a BadRequest error when attempting to sign in with incorrect credentials', async() => {
    const account = await signUp(sampleAccount);

    await request(app.getHttpServer())
      .post('/account/signin')
      .send({ updatedEmail, password })
      .expect(400);

    await request(app.getHttpServer())
      .post('/account/signin')
      .send({ email, updatedPassword })
      .expect(400);
      
    expect(account).toBeDefined();
  });

  it('should fetch the account details for a given account ID, if provided valid token', async() => {
    const account = await signUp(sampleAccount);

    const { body: fetchedAccount } =  await request(app.getHttpServer())
      .get(`/account/${account.id}`)
      .set({ "Authorization": `Bearer ${account.token}` })
      .expect(200);

    expect(account).toBeDefined();
    expect(fetchedAccount).toBeDefined();  
    expect(account.id).toEqual(fetchedAccount.id);
  });

  it('should return an Unauthorized error when attempting to fetch account details with an invalid or missing token', async() => {
    await request(app.getHttpServer())
      .get(`/account/${1}`)
      .expect(401);

    await request(app.getHttpServer())
      .get(`/account/${1}`)
      .set({ "Authorization": `Bearer gibberishtext` })
      .expect(401);
  });

  it('should update the account details and return the updated account details',async() => {
    const account = await signUp(sampleAccount);

    await request(app.getHttpServer())
      .patch(`/account/${account.id}`)
      .set({ "Authorization": `Bearer ${account.token}` })
      .send({ email: updatedEmail, role: updatedRole })
      .expect(200);
    
    const { body: updatedAccount } = await request(app.getHttpServer())
      .get(`/account/${account.id}`)
      .set({ "Authorization": `Bearer ${account.token}` })
      .expect(200);
    
    expect(account).toBeDefined();
    expect(updatedAccount).toBeDefined();
    expect(updatedAccount.id).toEqual(account.id);
    expect(updatedAccount.email).toEqual(updatedEmail);
    expect(updatedAccount.role).toEqual(updatedRole);
  });

  it('should return an Unauthorized error when attempting to update account details with an invalid or missing token', async() => {
    await request(app.getHttpServer())
      .patch(`/account/${1}`)
      .send({ email: updatedEmail, role: updatedRole })
      .expect(401);

    await request(app.getHttpServer())
      .patch(`/account/${1}`)
      .send({ email: updatedEmail, role: updatedRole })
      .set({ "Authorization": `Bearer gibberishtext` })
      .expect(401);
  });


  it('should remove the specified account when requested by an admin account', async() => {
    const adminAccount = await signUp({ ...sampleAccount, role: Roles.Admin });
    const accountToRemove =  await signUp({ email: updatedEmail, password: updatedPassword, role: updatedRole });
  
    await request(app.getHttpServer())
      .delete(`/account/${accountToRemove.id}`)
      .set({ 'Authorization': `Bearer ${adminAccount.token}` })
      .expect(204);
    
    expect(adminAccount).toBeDefined();
    expect(accountToRemove).toBeDefined();
  });

  it('should return a Forbidden error when a non-admin account attempts to remove an account', async() => {
    const nonAdminAccount = await signUp({ ...sampleAccount, role: Roles.User });
    const accountToRemove =  await signUp({ email: updatedEmail, password: updatedPassword, role: updatedRole });

    await request(app.getHttpServer())
      .delete(`/account/${accountToRemove.id}`)
      .set({ 'Authorization': `Bearer ${nonAdminAccount.token}` })
      .expect(403);
    
    expect(nonAdminAccount).toBeDefined();
    expect(accountToRemove).toBeDefined();
  });

  it('should return a NotFound error when accessing, updating, or deleting a nonexistent account', async() => {
    const account = await signUp(sampleAccount);

    // Request to get a nonexistent account
    await request(app.getHttpServer())
    .get(`/account/${787}`)
    .set({ 'Authorization': `Bearer ${account.token}` })
    .expect(404);

    // Request to update a nonexistent account
    await request(app.getHttpServer())
    .patch(`/account/${787}`)
    .set({ 'Authorization': `Bearer ${account.token}` })
    .send({ email: updatedEmail, role: updatedRole })
    .expect(404);
    
    // Request to delete a nonexistent account
    await request(app.getHttpServer())
    .delete(`/account/${787}`)
    .set({ 'Authorization': `Bearer ${account.token}` })
    .expect(404);

    expect(account).toBeDefined();
  });
});

