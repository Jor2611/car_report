import { Account } from "../account/account.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Reports{
  @PrimaryGeneratedColumn()
  id:number;

  @Column({ default: false })
  approved: boolean;

  @Column()
  price: number;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  lng: number;
  
  @Column()
  lat: number;

  @Column()
  mileage: number;

  @ManyToOne(() => Account,(account) => account.reports,{ onDelete: 'CASCADE' })
  owner: Account;
}