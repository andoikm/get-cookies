import { TEXT, ICONS } from '../constants/constants';

export function AddThemeToggleButton(container: HTMLElement): void {
    let btn = document.getElementById('theme-toggle-btn') as HTMLButtonElement | null;
    if (btn) btn.remove();
    btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.className = 'theme-toggle-btn';
    btn.title = TEXT.TOGGLE_THEME;
    btn.innerHTML = ICONS.THEME_TOGGLE;
    btn.onclick = () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('cookie-theme', next);
    };
    container.appendChild(btn);
} 