import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reports } from './report.entity';
import { Repository } from 'typeorm';
import { mockAccount, mockReport } from '../../test/mockedData';
import { CreateReportDto } from './dtos/create-report.dto';
import { Account } from '../account/account.entity';
import { NotFoundException } from '@nestjs/common';


describe('ReportsService', () => {
  let service: ReportsService;
  let repo: Repository<Reports>;
  let reports = [];
  const sampleAccount = { 
    id: mockAccount.id, 
    email: mockAccount.email, 
    password: mockAccount.password, 
    role: mockAccount.role, 
  } 
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Reports),
          useValue: {
            findOne: jest.fn().mockImplementation((arg) => {
              const [[key,value]]= Object.entries(arg.where);
              const report = reports.filter(report => report[key] === value)[0];
              return Promise.resolve(report);
            }),
            find: jest.fn().mockImplementation((arg) => {
              const [[key,value]]= Object.entries(arg.where);
              const listOfReports = reports.filter(report => report[key]['id'] === value['id']);
              return Promise.resolve(listOfReports);
            }),
            create: jest.fn().mockImplementation((args: CreateReportDto) => {
              const report = {...args, id: Math.floor(Math.random()*999)};
              reports.push(report);
              return report;
            }),
            save: jest.fn().mockImplementation((args) => {
              reports = reports.map(report => {
                if(report.id === args.id && args.attrs){
                  Object.assign(report,args.attrs)
                }
                return report;
              })
              return args;
            }),
            /////////////////////////////////////////
            /// Poor implementation just for mock ///
            /////////////////////////////////////////
            createQueryBuilder:jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              setParameters: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockImplementation(() => {
                let approvedReportsQuantity = 0;
        
                const price = reports.reduce((acc,current)=> {
                  if(current.approved) {
                    approvedReportsQuantity++; 
                    return acc+current.price; 
                  } 
                  return acc; 
                },0);

                return { price: price/approvedReportsQuantity };
              }),
            })
            )
          }
        }
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    repo = module.get<Repository<Reports>>(getRepositoryToken(Reports));
  });

  afterEach(async() => {
    reports = [];
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new report', async()=>{
    const spyOnCreate = jest.spyOn(repo,'create');
    const spyOnSave = jest.spyOn(repo,'save');
    const report = await service.create(mockReport,sampleAccount as Account);
    
    expect(report).toBeDefined();
    expect(spyOnCreate).toBeCalledWith(mockReport)
    expect(spyOnSave).toBeCalledWith(report);
  });

  it('should list reports for the specified account', async() => {
    const report = await service.create(mockReport,sampleAccount as Account);
    const list = await service.list(sampleAccount as Account);
    
    expect(report).toBeDefined();
    expect(list).toHaveLength[1];
    expect(list[0].owner.id).toEqual(sampleAccount.id)
  });

  it('should update the approval status of a report', async()=>{
    const spyOnFindOne = jest.spyOn(repo,'findOne');
    const spyOnSave = jest.spyOn(repo,'save');
    const { ...report } = await service.create(mockReport,sampleAccount as Account);
    const result = await service.updateApproval(`${report.id}`,true);
    
    expect(report).toBeDefined();
    expect(result).toBeDefined();
    expect(report.approved).not.toEqual(result.approved);
    expect(spyOnFindOne).toBeCalledWith({ where: { id: report.id }});
    expect(spyOnSave).toBeCalledWith({ ...report,approved: result.approved });
  });

  it('should throw a NotFound error if provided wrong id for updating approval', async() => {
    const spyOnFindOne = jest.spyOn(repo,'findOne');
    const { id: fakeId } = mockReport;
    const { ...report } = await service.create(mockReport,sampleAccount as Account);

    expect(report).toBeDefined();
    expect(reports).toHaveLength(1);
    expect(fakeId).not.toEqual(report.id);
    expect(service.updateApproval(`${fakeId}`,true)).rejects.toThrow(NotFoundException);
    expect(spyOnFindOne).toBeCalledWith({ where: { id: fakeId}}); 
  });

  it('should return the average price estimate based on the given parameters', async() => {
    const spyOncreateQueryBuilder = jest.spyOn(repo,'createQueryBuilder');

    //Creating a few reports with different prices
    const firstReport = await service.create({ ...mockReport, price: 200000},sampleAccount as Account);
    const secondReport = await service.create({ ...mockReport, price: 100000},sampleAccount as Account);

    //Approving reports
    await service.updateApproval(`${firstReport.id}`,true );
    await service.updateApproval(`${secondReport.id}`,true );

    //Getting estimated price of approved reports
    const estimatedPrice = await service.createEstimate(reports[0]);

    expect(firstReport).toBeDefined();
    expect(secondReport).toBeDefined();
    expect(reports).toHaveLength(2);
    expect(spyOncreateQueryBuilder).toBeCalledTimes(1); 
    expect(estimatedPrice).toBeDefined();
    expect(estimatedPrice).toEqual({ price: 150000 })
  });
});
