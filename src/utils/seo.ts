import { useEffect } from 'react';

export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title ? `${title} | СВОБОДА МЕБЕЛЬ` : 'СВОБОДА МЕБЕЛЬ | Фурнитура из цельного дерева';
    if (description) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', 'description');
        document.head.appendChild(el);
      }
      el.setAttribute('content', description);
    }
  }, [title, description]);
}
