import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './Client';

@Entity()
export class ClientPostLogoutRedirectUri {
    @Column({ primary: true, generated: true })
    id: number;

    @Column()
    postLogoutRedirectUri: string;

    @ManyToOne(() => Client, client => client.postLogoutRedirectUris, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @Column()
    clientId: number;
}
