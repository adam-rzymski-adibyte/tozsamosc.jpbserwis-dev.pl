import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './Client';

@Entity()
export class ClientRedirectUri {
    @Column({ primary: true, generated: true })
    id: number;

    @Column()
    redirectUri: string;

    @ManyToOne(() => Client, client => client.redirectUris, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @Column()
    clientId: number;
}
