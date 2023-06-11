import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { Account } from './account.entity';
import { Roles } from './roles.enum';

const scrypt = promisify(_scrypt);

@Injectable()
export class AccountService {
  constructor(@InjectRepository(Account) private accountRepo: Repository<Account>, private jwtService: JwtService){}

  async signup(email: string, password: string, role: Roles){
    const account = await this.accountRepo.findOne({ where: { email } });

    if(account){
      throw new BadRequestException('Account with this email already exists!');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = await scrypt(salt, password, 32) as Buffer;
    const passwordRecord = salt + '.' + hash.toString('hex');

    const newAccount = this.accountRepo.create({ email, password: passwordRecord, role });

    await this.accountRepo.save(newAccount);

    const token = this.jwtService.sign({ id:newAccount.id, email, role });
    return { ...newAccount, token };
  }

  async signin(email: string, password: string){
    const account = await this.accountRepo.findOne({ where: { email } });

    if(!account){
      throw new BadRequestException('Wrong Credentials!');
    }

    const [salt,storedHash] = account.password.split('.');
    const hash = await scrypt(salt, password, 32) as Buffer;
    
    if(storedHash !== hash.toString('hex')){
      throw new BadRequestException('Wrong Credentials!');
    }

    const token = this.jwtService.sign({ id:account.id, email: account.email, role: account.role });
    return { ...account, token };
  }

  async findOne(id:number){
    if(!id){
      return null;
    }

    const account = await this.accountRepo.findOne({ where: { id } });

    if(!account){
      throw new NotFoundException('Account not found!');
    }

    return account;
  }


  async update(id: number, attrs: Partial<Account>){
    const account = await this.accountRepo.findOne({ where: { id } });

    if(!account){
      throw new NotFoundException('Account not found!');
    }

    if(attrs.password){
      const salt = randomBytes(8).toString('hex');
      const hash = await scrypt(salt, attrs.password, 32) as Buffer;
      attrs.password = salt + '.' + hash.toString('hex');
    }

    Object.assign(account,attrs);

    return this.accountRepo.save(account);
  }

  async remove(id:number){
    const account = await this.accountRepo.findOne({ where: { id } });

    if(!account){
      throw new NotFoundException('Account not found!');
    }

    await this.accountRepo.remove(account);
    return { id };
  }
}
