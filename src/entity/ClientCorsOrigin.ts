import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './Client';

@Entity()
export class ClientCorsOrigin {
  @Column({ primary: true, generated: true })
  id: number;

  @Column()
  origin: string;

  @ManyToOne(() => Client, client => client.corsOrigins, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: number;
}
