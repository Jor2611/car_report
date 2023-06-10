import { Reports } from "../reports/report.entity";
import { 
  AfterInsert, 
  AfterUpdate, 
  BeforeRemove, 
  Column, 
  Entity, 
  OneToMany, 
  PrimaryGeneratedColumn 
} from "typeorm";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @AfterInsert()
  logInsert() {
    console.log('Inserted new account');
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated account with id ', this.id);
  }

  @BeforeRemove()
  logRemove(){
    console.log('Removed account with id: ', this.id);
  }

  @OneToMany(() => Reports, (report) => report.owner, { onDelete: 'CASCADE' })
  reports: Reports[];
}