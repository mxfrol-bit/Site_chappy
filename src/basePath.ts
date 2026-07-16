// GitHub Pages base-path shim.
// On GitHub Pages the app is served under /<repo>/, but many demo assets are
// referenced as root-absolute paths ('/trends/x.jpg'). This rewrites such
// element `src` values to include the base path so images resolve correctly.
// It is a NO-OP when the app is served from '/' (local dev, Vercel, root Pages).
const base = import.meta.env.BASE_URL;

if (base && base !== '/') {
  const prefix = base.replace(/\/$/, '');
  const needsPrefix = (v: unknown): v is string =>
    typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith(prefix + '/');

  // React may set image URLs either via setAttribute('src', …) or the .src property.
  const origSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name: string, value: string) {
    if (name === 'src' && needsPrefix(value)) value = prefix + value;
    return origSetAttribute.call(this, name, value as string);
  };

  const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (desc?.set && desc.get) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: true,
      get() { return desc.get!.call(this); },
      set(v: string) { desc.set!.call(this, needsPrefix(v) ? prefix + v : v); },
    });
  }
}

export {};
