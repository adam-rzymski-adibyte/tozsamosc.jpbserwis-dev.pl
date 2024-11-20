export interface Client {
    logoUri?: string;
}

export interface Details {
    missingOIDCScope?: string[];
    missingOIDCClaims?: string[];
    missingResourceScopes?: { [key: string]: string[] };
}

export interface Params {
    scope?: string[];
}

export interface ConfirmationFlags {
    hasLogo: boolean;
    logoUri?: string;
    requiresAuthorizationConfirmation: boolean;
    missingScopes: string[];
    missingClaims: string[];
    missingResourceScopes: { indicator: string, scopes: string[] }[];
    requiresOfflineAccess: boolean;
    hasGrantedOfflineAccess: boolean;
}
