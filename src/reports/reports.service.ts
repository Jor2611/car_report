import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reports } from './report.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { Account } from '../account/account.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Reports) private reportRepo: Repository<Reports>){}

  create(reportData: CreateReportDto, account: Account){
    const report = this.reportRepo.create(reportData);
    report.owner = account;
    return this.reportRepo.save(report);
  }

  list(account: Account){
    return this.reportRepo.find({ where : { owner: { id: account.id } }, relations: ['owner'] });
  }

  async updateApproval(id: string, approved: boolean){
    const report = await this.reportRepo.findOne({ where: { id: parseInt(id) } });

    if(!report){
      throw new NotFoundException('Report not found!');
    }

    report.approved = approved;
    return this.reportRepo.save(report);
  }

  async createEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDto) {
    return this.reportRepo.createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng Between -5 AND 5', { lng })
      .andWhere('lat - :lat Between -5 AND 5', { lat })
      .andWhere('year - :year Between -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
