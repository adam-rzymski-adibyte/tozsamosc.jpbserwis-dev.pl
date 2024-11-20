import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './Client';

@Entity()
export class ClientClaim {
  @Column({ primary: true, generated: true })
  id: number;

  @Column()
  type: string;

  @Column()
  value: string;

  @ManyToOne(() => Client, client => client.claims, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: number;
}
