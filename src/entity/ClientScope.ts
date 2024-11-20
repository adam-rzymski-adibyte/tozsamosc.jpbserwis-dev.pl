import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './Client';

@Entity()
export class ClientScope {
    @Column({ primary: true, generated: true })
    id: number;

    @Column()
    scope: string;

    @ManyToOne(() => Client, client => client.scopes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @Column()
    clientId: number;
}
