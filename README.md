# Lempoy Labs Website

Static homepage for Lempoy Labs.

Production domain: <https://lempoylabs.com/>

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

The repository is configured for GitHub Pages through the `CNAME` file. Pushes to the publishing branch update <https://lempoylabs.com/> once GitHub Pages and DNS are active.
