import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest"
import { AppModule } from "../src/app.module";
import { mockAccount, mockReport } from "./mockedData";
import { Roles } from "../src/account/roles.enum";
import { CreateAccountDto } from "../src/account/dtos/create-account.dto";

describe('Account',() => {
  let app: INestApplication;
  const { email, password, role } = mockAccount;

  beforeEach(async () => {
    const moduleFixtures: TestingModule = await Test.createTestingModule({
      imports: [ AppModule ]
    }).compile();

    app = moduleFixtures.createNestApplication();
    await app.init();
  });

  const signUp = async(accountData: CreateAccountDto) => {
    const { body: account } = await request(app.getHttpServer())
      .post('/account/signup')
      .send(accountData)
      .expect(201);
    
    return account;
  };


  it('should create a new report when a valid token is provided', async() => {
    const { id, token } = await signUp({ email, password, role });
    const { body: report } = await request(app.getHttpServer())
      .post('/reports')
      .set({ 'Authorization': `Bearer ${token}` })
      .send(mockReport)
      .expect(201);

    expect(report).toBeDefined();
    expect(report.ownerId).toEqual(id);
  });

  it('should return an error when an invalid or missing token is provided', async() => {
    await request(app.getHttpServer())
      .post('/reports')
      .set({ 'Authorization': 'Bearer gibberishtext' })
      .send(mockReport)
      .expect(401);
    
    await request(app.getHttpServer())
      .post('/reports')
      .send(mockReport)
      .expect(401);
  });

  it('should list reports when authorized with a valid token', async() => {
    const { token } = await signUp({ email, password, role });

    await request(app.getHttpServer())
      .post('/reports')
      .set({ 'Authorization': `Bearer ${token}` })
      .send(mockReport)
      .expect(201);

    await request(app.getHttpServer())
      .post('/reports')
      .set({ 'Authorization': `Bearer ${token}` })
      .send(mockReport)
      .expect(201);  
    
    const { body:reports } = await request(app.getHttpServer())
      .get('/reports')
      .set({ 'Authorization': `Bearer ${token}` })
      .expect(200);

    expect(reports).toBeDefined();
    expect(reports).toHaveLength(2);
  });

  it('should return an error when accessing bulk reports without authorization', async() => {
    const { token } = await signUp({ email, password, role });

    // Create two new reports using the provided token
    await request(app.getHttpServer())
      .post('/reports')
      .set({ 'Authorization': `Bearer ${token}` })
      .send(mockReport)
      .expect(201);

    await request(app.getHttpServer())
      .post('/reports')
      .set({ 'Authorization': `Bearer ${token}` })
      .send(mockReport)
      .expect(201);  
    
    // Attempt to retrieve all reports without providing any authorization token
    await request(app.getHttpServer())
      .get('/reports')
      .expect(401);
  });

  it('should mark a report as approved when authorized with a admins valid token', async() => {
    const { token } = await signUp({ email, password, role: Roles.Admin });

    const{ body: report } = await request(app.getHttpServer())
      .post('/reports')
      .set({ 'Authorization': `Bearer ${token}` })
      .send(mockReport)
      .expect(201);

    const { body: approvedReport } = await request(app.getHttpServer())
      .patch(`/reports/${report.id}`)
      .set({ 'Authorization': `Bearer ${token}` })
      .send({ approved: true })
      .expect(200);
    
    expect(report).toBeDefined();
    expect(approvedReport).toBeDefined();
    expect(approvedReport.approved).toBeTruthy();
  });

  it('should return a forbidden error when a non-admin account tries to mark a report as approved', async() => {
    const { token } = await signUp({ email, password, role:Roles.User });
   
    const{ body: report } = await request(app.getHttpServer())
      .post('/reports')
      .set({ 'Authorization': `Bearer ${token}` })
      .send(mockReport)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/reports/${report.id}`)
      .set({ 'Authorization': `Bearer ${token}` })
      .send({ approved: true })
      .expect(403);
  });

  it('should return a NotFound error when attempting to update a non-existent report', async() => {
    const { token } = await signUp({ email, password, role });
  
    await request(app.getHttpServer())
      .patch(`/reports/${964}`)
      .set({ 'Authorization': `Bearer ${token}` })
      .send({ approved: true })
      .expect(404);
  });

  it('should return an estimated price based on approved reports', async() => {
    const { token } = await signUp({ email, password, role });
    
    // Create two reports with a corresponding 150000 and 100000 prices 
    const { body: firstReport } = await request(app.getHttpServer())
      .post('/reports')
      .set({ 'Authorization': `Bearer ${token}` })
      .send({ ...mockReport, price: 150000 })
      .expect(201);

    
    const { body: secondReport } = await request(app.getHttpServer())
      .post('/reports')
      .set({ 'Authorization': `Bearer ${token}` })
      .send({ ...mockReport, price: 100000 })
      .expect(201);
 
    // Mark reports as approved  
    await request(app.getHttpServer())
      .patch(`/reports/${firstReport.id}`)
      .set({ 'Authorization': `Bearer ${token}` })
      .send({ approved: true })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/reports/${secondReport.id}`)
      .set({ 'Authorization': `Bearer ${token}` })
      .send({ approved: true })
      .expect(200);

    // Request an estimated report based on the provided mockReport 
    const { body: estimatedReport } = await request(app.getHttpServer())
      .post('/reports/estimate')
      .send(mockReport)
      .expect(200);

    expect(estimatedReport).toBeDefined();
    expect(estimatedReport.price).toEqual(125000);
  });
});
