export interface ChromeCookie {
    name: string;
    value: string;
    domain?: string;
    hostOnly?: boolean;
    path: string;
    secure: boolean;
    httpOnly: boolean;
    sameSite?: string;
    storeId?: string;
    expirationDate?: number;
    session?: boolean;
}

export type RefreshCookies = () => void;

export type CookieRowUrl = URL;
