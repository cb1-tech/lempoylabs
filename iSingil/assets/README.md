# iSingil Asset Pack

Created for the iSingil PWA.

## Rules for implementation
- Use each SVG as an individual asset. Do not crop a contact sheet.
- Preserve each SVG viewBox and aspect ratio.
- UI icons use `currentColor`, so the app may apply its normal active/inactive UI colors without editing the files.
- Keep icon stroke weight consistent; do not mix with emoji or unrelated icon families.
- `isingil-app-icon.svg` is the proposed iSingil app mark (receipt + check).
- `isingil-wordmark.svg` is a simple text wordmark.
- The official Lempoy Labs logo is NOT included because no official source asset was supplied in this build. Use text `Created by Lempoy Labs` until the official logo is provided. Do not invent or redraw the Lempoy Labs logo.
- Invoice Profile logos (Auto Electron, Lempoy Labs Shop, etc.) remain user-uploadable in Settings.

## Suggested sizes
- Bottom navigation: 22–24 px
- Feature/settings icons: 22–24 px
- Inline action icons: 18–20 px
- App icon: generate required PWA raster sizes from `isingil-app-icon.svg` during the build.
