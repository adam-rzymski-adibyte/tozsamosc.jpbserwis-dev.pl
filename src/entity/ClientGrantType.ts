import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './Client';

@Entity()
export class ClientGrantType {
  @Column({ primary: true, generated: true })
  id: number;

  @Column()
  grantType: string;

  @ManyToOne(() => Client, client => client.grantTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: number;
}
