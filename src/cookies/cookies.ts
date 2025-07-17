import '../../styles/index.css';
import { showToast } from '../common/toast';
import { ChromeCookie, RefreshCookies, CookieRowUrl } from '../models/types';
import { createButton } from '../common/button';
import { TEXT, ICONS } from '../constants/constants';

function createCookieRow(
    cookie: ChromeCookie,
    url: CookieRowUrl,
    refreshCookies: RefreshCookies
): HTMLDivElement {
    const row = document.createElement('div');
    row.className = 'cookie-row';

    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'cookie-value-full';
    valueDisplay.style.display = 'none';

    let isEditing = false;

    const toggleEdit = (enable: boolean) => {
        isEditing = enable;
        valueDisplay.style.display = enable ? 'block' : 'none';
        editBtn.textContent = enable ? ICONS.COLLAPSE : ICONS.EXPAND;
        editBtn.title = enable ? TEXT.COLLAPSE_EDIT : TEXT.EXPAND_TO_EDIT;
    };

    const createTextareaEditor = () => {
        valueDisplay.innerHTML = '';

        const textarea = document.createElement('textarea');
        textarea.className = 'edit-textarea';
        textarea.value = cookie.value;
        textarea.rows = 6;
        textarea.style.width = '100%';
        valueDisplay.appendChild(textarea);

        const btnRow = document.createElement('div');
        Object.assign(btnRow.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            marginTop: '6px'
        });

        const validSameSiteValues: chrome.cookies.SameSiteStatus[] = ['no_restriction', 'lax', 'strict'];
        const mappedSameSite = validSameSiteValues.includes(cookie.sameSite as chrome.cookies.SameSiteStatus)
            ? (cookie.sameSite as chrome.cookies.SameSiteStatus)
            : undefined;

        const saveBtn = createButton({
            title: TEXT.SAVE_CHANGES,
            text: ICONS.SAVE,
            className: 'save-btn',
            onClick: () => {
                const setDetails: chrome.cookies.SetDetails = {
                    url: url.origin,
                    name: cookie.name,
                    value: textarea.value,
                    path: cookie.path,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: mappedSameSite
                };

                if (!cookie.hostOnly && cookie.domain) setDetails.domain = cookie.domain;
                if (cookie.storeId) setDetails.storeId = cookie.storeId;
                if (cookie.expirationDate) setDetails.expirationDate = cookie.expirationDate;

                chrome.cookies.set(setDetails, (result) => {
                    if (!result) {
                        showToast(TEXT.FAILED_EDIT, 'error');
                    }
                    toggleEdit(false);
                    refreshCookies();
                });
            }
        });

        const cancelBtn = createButton({
            title: TEXT.CANCEL_EDIT,
            text: ICONS.CANCEL,
            className: 'cancel-btn',
            onClick: () => toggleEdit(false)
        });

        btnRow.append(saveBtn, cancelBtn);
        valueDisplay.appendChild(btnRow);
    };

    const editBtn = createButton({
        title: TEXT.EXPAND_TO_EDIT,
        text: ICONS.EXPAND,
        className: 'edit-btn',
        onClick: () => {
            if (!isEditing) createTextareaEditor();
            toggleEdit(!isEditing);
        }
    });

    const copyBtn = createButton({
        title: TEXT.COPY,
        className: 'copy-btn',
        iconSVG: ICONS.COPY_SVG,
        onClick: () => {
            let valueToCopy = cookie.value;
            if (isEditing) {
                const textarea = valueDisplay.querySelector('textarea.edit-textarea') as HTMLTextAreaElement | null;
                if (textarea) valueToCopy = textarea.value;
            }
            navigator.clipboard.writeText(`${cookie.name}=${valueToCopy}`).then(() => {
                showToast(TEXT.COPY, 'success');
            });
        }
    });

    const deleteBtn = createButton({
        title: TEXT.DELETE_COOKIE,
        text: ICONS.DELETE,
        className: 'delete-btn',
        onClick: () => {
            chrome.cookies.getAll({ domain: url.hostname, name: cookie.name }, (cookies) => {
                if (!cookies?.length) return refreshCookies();

                let pending = cookies.length;

                cookies.forEach((c) => {
                    const cookieUrl = `${c.secure ? 'https://' : 'http://'}${c.domain?.replace(/^\./, '')}${c.path}`;

                    chrome.cookies.remove(
                        {
                            url: cookieUrl,
                            name: c.name,
                            storeId: c.storeId
                        },
                        (res) => {
                            if (!res) showToast(TEXT.FAILED_DELETE, 'error');
                            if (--pending === 0) refreshCookies();
                        }
                    );
                });
            });
        }
    });

    const actions = document.createElement('div');
    actions.className = 'cookie-actions';
    actions.append(editBtn, copyBtn, deleteBtn);

    const nameContainer = document.createElement('span');
    nameContainer.className = 'cookie-key';
    nameContainer.textContent = cookie.name;
    Object.assign(nameContainer.style, {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '180px'
    });

    const header = document.createElement('div');
    header.className = 'cookie-row-header';

    const left = document.createElement('div');
    left.className = 'cookie-row-left';
    left.appendChild(nameContainer);

    header.append(left, actions);
    row.append(header, valueDisplay);

    return row;
}

function getCurrentTab(callback: (url: URL) => void): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        if (!tabs.length || !tabs[0].url) return;
        callback(new URL(tabs[0].url));
    });
}

// 💡 New: Create a "Request Cookie Header" row like any other cookie
function createHeaderRow(cookieString: string, url: URL, refreshCookies: RefreshCookies): HTMLDivElement {
    const headerCookie: ChromeCookie = {
        name: TEXT.REQUEST_COOKIE_HEADER,
        value: cookieString,
        domain: url.hostname,
        path: '/',
        secure: false,
        httpOnly: false,
        hostOnly: true,
        sameSite: 'lax',
        session: true
    };

    return createCookieRow(headerCookie, url, refreshCookies);
}

function displayCookies(url: URL): void {
    chrome.cookies.getAll({ domain: url.hostname }, (cookies: ChromeCookie[]) => {
        const list = document.getElementById('cookie-list') as HTMLDivElement;
        list.innerHTML = '';

        if (!cookies.length) {
            list.textContent = TEXT.NO_COOKIES_FOUND;
            return;
        }

        // 1. Build cookie string
        const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        // 2. Add the header row first
        list.appendChild(createHeaderRow(cookieString, url, () => displayCookies(url)));

        // // 3. Render all cookies
        // cookies.forEach((cookie) => {
        //     list.appendChild(createCookieRow(cookie, url, () => displayCookies(url)));
        // });
    });
}

export function Popup(container: HTMLElement): void {
    container.innerHTML = '';

    let list = document.getElementById('cookie-list') as HTMLDivElement | null;
    if (!list) {
        list = document.createElement('div');
        list.id = 'cookie-list';
        container.appendChild(list);
    }

    list.textContent = TEXT.LOADING;

    if (typeof chrome === 'undefined' || !chrome.cookies || !chrome.tabs) {
        list.textContent = TEXT.EXTENSION_ONLY;
        return;
    }

    getCurrentTab(displayCookies);
}
