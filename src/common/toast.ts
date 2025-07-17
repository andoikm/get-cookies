export function showToast(message: string, type: 'success' | 'error' = 'error'): void {
    let toast = document.getElementById('cookie-toast') as HTMLDivElement | null;
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cookie-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '4px';
        toast.style.zIndex = '9999';
        toast.style.fontSize = '14px';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.background = type === 'success' ? 'var(--toast-success-bg)' : 'var(--toast-error-bg)';
    toast.style.color = 'var(--toast-fg)';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
} 