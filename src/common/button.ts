export interface ButtonOptions {
  text?: string;
  className?: string;
  title?: string;
  iconSVG?: string; // for icon-only buttons
  onClick?: (e: MouseEvent) => void;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function createButton(options: ButtonOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  if (options.text) btn.textContent = options.text;
  if (options.className) btn.className = options.className;
  if (options.title) btn.title = options.title;
  if (options.id) btn.id = options.id;
  if (options.type) btn.type = options.type;
  if (options.iconSVG) btn.innerHTML = options.iconSVG; // overrides text if both provided
  if (options.onClick) btn.onclick = options.onClick;
  return btn;
} 