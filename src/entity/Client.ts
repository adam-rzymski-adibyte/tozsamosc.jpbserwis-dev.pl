import { Entity, Column, OneToMany } from 'typeorm';
import Model from './Model';
import { ClientScope } from './ClientScope';
import { ClientRedirectUri } from './ClientRedirectUri';
import { ClientPostLogoutRedirectUri } from './ClientPostLogoutRedirectUri';
import { ClientGrantType } from './ClientGrantType';
import { ClientCorsOrigin } from './ClientCorsOrigin';
import { ClientClaim } from './ClientClaim';

@Entity()
export abstract class Client extends Model {
    @Column()
    enabled: boolean;

    @Column()
    clientId: string;

    @Column()
    protocolType: string;

    @Column()
    requireClientSecret: boolean;

    @Column({ nullable: true, length: 36 })
    clientName: string;

    @Column({ nullable: true, length: 36 })
    description: string;

    @Column({ nullable: true, length: 36 })
    clientUri: string;

    @Column({ nullable: true, length: 36 })
    logoUri: string;

    @Column()
    requireConsent: boolean;

    @Column()
    allowRememberConsent: boolean;

    @Column()
    alwaysIncludeUserClaimsInIdToken: boolean;

    @Column()
    requirePkce: boolean;

    @Column()
    allowPlainTextPkce: boolean;

    @Column()
    allowAccessTokensViaBrowser: boolean;

    @Column({ nullable: true, length: 36 })
    frontChannelLogoutUri: string;

    @Column()
    frontChannelLogoutSessionRequired: boolean;

    @Column({ nullable: true, length: 36 })
    backChannelLogoutUri: string;

    @Column()
    backChannelLogoutSessionRequired: boolean;

    @Column()
    allowOfflineAccess: boolean;

    @Column()
    identityTokenLifetime: number;

    @Column()
    accessTokenLifetime: number;

    @Column()
    authorizationCodeLifetime: number;

    @Column({ nullable: true })
    consentLifetime: number;

    @Column()
    absoluteRefreshTokenLifetime: number;

    @Column()
    slidingRefreshTokenLifetime: number;

    @Column()
    refreshTokenUsage: number;

    @Column()
    updateAccessTokenClaimsOnRefresh: boolean;

    @Column()
    refreshTokenExpiration: number;

    @Column()
    accessTokenType: number;

    @Column()
    enableLocalLogin: boolean;

    @Column()
    includeJwtId: boolean;

    @Column()
    alwaysSendClientClaims: boolean;

    @Column({ nullable: true, length: 36 })
    clientClaimsPrefix: string;

    @Column({ nullable: true, length: 36 })
    pairWiseSubjectSalt: string;

    @Column({ nullable: true })
    userSsoLifetime: number;

    @Column()
    deviceCodeLifetime: number;

    @Column()
    nonEditable: boolean;

    @Column({ nullable: true, length: 36 })
    allowedIdentityTokenSigningAlgorithms: string;

    @Column()
    requireRequestObject: boolean;

    @OneToMany(() => ClientScope, clientScope => clientScope.client, { cascade: true })
    scopes: ClientScope[];

    @OneToMany(() => ClientRedirectUri, clientRedirectUri => clientRedirectUri.client, { cascade: true })
    redirectUris: ClientRedirectUri[];

    @OneToMany(() => ClientPostLogoutRedirectUri, clientPostLogoutRedirectUri => clientPostLogoutRedirectUri.client, { cascade: true })
    postLogoutRedirectUris: ClientPostLogoutRedirectUri[];

    @OneToMany(() => ClientGrantType, clientGrantType => clientGrantType.client, { cascade: true })
    grantTypes: ClientGrantType[];

    @OneToMany(() => ClientCorsOrigin, clientCorsOrigin => clientCorsOrigin.client, { cascade: true })
    corsOrigins: ClientCorsOrigin[];

    @OneToMany(() => ClientClaim, clientClaim => clientClaim.client, { cascade: true })
    claims: ClientClaim[];
}
