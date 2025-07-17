import { Popup } from './cookies/cookies';
import { AddThemeToggleButton } from './themes/theme';

if (typeof document !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    Popup(root);
  }
  const header = document.getElementById('header');
  if (header) {
    AddThemeToggleButton(header);
  }
} 