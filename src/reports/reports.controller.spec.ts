import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dtos/create-report.dto';
import { Account } from '../account/account.entity';
import { mockAccount, mockReport } from '../../test/mockedData';
import { Request } from 'express';
import { Reports } from './report.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

describe('ReportsController', () => {
  let controller: ReportsController;
  let mockReportsService: Partial<ReportsService>;
  let reports: Reports[] = [];

  const sampleAccount = { 
    id: mockAccount.id, 
    email: mockAccount.email, 
    password: mockAccount.password, 
    role: mockAccount.role 
  } as Account;

  const sampleRequest = { account: sampleAccount } as Request;
  
  beforeEach(async () => {
    mockReportsService = {
      create:(reportData: CreateReportDto, account) => {
        const report = { ...reportData, approved: false, id: Math.floor(Math.random() * 999), owner: account };
        reports.push(report);
        return Promise.resolve(report);
      },
      list:(account: Account) => {
        const result = reports.filter(report => report.owner.id === account.id);
        return Promise.resolve(result);
      },
      updateApproval: (id: string, approved: boolean) => {
        let report;
        reports = reports.map(item => {
          if(item.id === parseInt(id)){
            item.approved = approved;
            report = item;
          }
          return item;
        });
        return Promise.resolve(report);
      },
      createEstimate:(dto: GetEstimateDto) => {
        let approvedReportsQuantity = 0;
        
        const price = reports.reduce((acc,current)=> {
          if(current.approved) {
            approvedReportsQuantity++; 
            return acc+current.price; 
          } 
           return acc; 
        },0);

        return Promise.resolve({ price: price/approvedReportsQuantity });
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService
        }
      ]
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  afterEach(async() => {
    reports = [];
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list reports', async() => {
    const spyOneCreate = jest.spyOn(mockReportsService,'create');
    const spyOneList = jest.spyOn(mockReportsService,'list');
    
    await controller.createReport(mockReport, sampleRequest);
    const report = await controller.listReports(sampleRequest);

    expect(report).toBeDefined();
    expect(reports).toHaveLength(1);
    expect(spyOneCreate).toBeCalledWith(mockReport, sampleAccount);
    expect(spyOneList).toBeCalledWith(sampleAccount);
  });

  it('should create a report', async() => {
    const spyOneCreate = jest.spyOn(mockReportsService,'create');
    const report = await controller.createReport(mockReport, sampleRequest);

    expect(report).toBeDefined();
    expect(reports).toHaveLength(1);
    expect(spyOneCreate).toBeCalledWith(mockReport, sampleAccount);
  });

  it('should update reports approval', async() => {
    const spyOneCreate = jest.spyOn(mockReportsService,'create');
    const spyOneUpdateApproval = jest.spyOn(mockReportsService,'updateApproval');
    
    const report = await controller.createReport(mockReport, sampleRequest);
    const updatedReport = await controller.updateApproval(`${report.id}`,{ approved: true });

    expect(report).toBeDefined();
    expect(reports).toHaveLength(1);
    expect(spyOneCreate).toBeCalledWith(mockReport, sampleAccount);
    expect(spyOneUpdateApproval).toBeCalledWith(`${report.id}`, true);
    expect(updatedReport.approved).toEqual(true);
  });

  it('should return the average price estimate based on the given parameters', async() => {
    const createEstimate = jest.spyOn(mockReportsService,'createEstimate');

    const firstReport = await controller.createReport({ ...mockReport, price: 200000 }, sampleRequest);
    const secondReport = await controller.createReport({ ...mockReport, price: 100000 }, sampleRequest);
    
    await controller.updateApproval(`${firstReport.id}`,{ approved: true });
    await controller.updateApproval(`${secondReport.id}`,{ approved: true });

    const estimatedPrice = await controller.getEstimate(reports[0]);

    expect(firstReport).toBeDefined();
    expect(secondReport).toBeDefined();
    expect(reports).toHaveLength(2);
    expect(createEstimate).toBeCalledTimes(1); 
    expect(estimatedPrice).toBeDefined();
    expect(estimatedPrice).toEqual({ price: 150000 })
  });
});
