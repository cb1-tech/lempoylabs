# Lempoy Labs Website

Static homepage for Lempoy Labs.

## Local preview

Run a simple static server from this folder, for example:

```powershell
python -m http.server 4187
```

Then open <http://127.0.0.1:4187/>.

## Main files

- `index.html` — page structure and content
- `style.css` — visual design and responsive styling
- `main.js` — small configuration and navigation behavior
- `site.config.js` — optional contact configuration

## Deployment

Upload the contents of this folder to the web root that should serve the site. For the current cPanel installation, the destination is `/public_html/lempoylabs`.
