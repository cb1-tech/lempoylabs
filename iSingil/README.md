# iSingil

Created by Lempoy Labs — Thoughtful software.

Standalone device-local billing PWA. Serve this directory over HTTPS (localhost also works for development). No build step or backend is required. Records are stored transactionally in IndexedDB. No data is sent to another billing system.

## Daily use

Complete the seven-step setup, add clients and services, and create an invoice. Preview it before finalization. Download its A4 PDF, send it yourself, and mark it sent. Confirm actual bank transfers against the invoice. Full payment requires an explicit paid-through date; access expiry remains separate.

Recurring billing advances the cycle after generation. Due cycles are generated on demand, not emailed automatically. Home shows expiry and billing attention when the app is opened. There are no closed-app push notifications.

Download JSON backups regularly. Full archive exports include JSON, invoices regenerated from immutable snapshots, CSV files, and a manifest. Restore validates checksums and references and requires confirmation; current records are downloaded first. Browser data clearing can remove the database, so keep backups outside the device.

## Privacy and limitations

- Browser data is device-local, with no cloud sync. Host access is private; local device/browser access still grants access to stored data.
- Browser storage persistence depends on platform policy. Backups are essential.
- Invoice language: English, Japanese, bilingual. App interface: English.
- JPY/USD and configurable supported ISO currencies. No currency conversion; receiving account currency must match payment currency.
- Payment amounts cannot exceed the invoice balance. Split bank transfers across separate invoice payment records.
- Tax is configurable, rounded per line, with qualified issuer OFF by default. Registration checks validate format only, not government registration.
- Multiple services retain separate coverage. Select a service for a client's single-row payment-status export when needed.
- Offline behavior needs one complete online load. Installation on a physical iPhone should be confirmed on that device.

## Verification

Run `node --test tests/domain.test.js`. Tests cover monetary precision, month-end dates, numbering snapshots, partial/full payments, voiding, currency validation, recurrence, portable backups, and CSV handling.

## Third-party components

PDF-Lib 1.17.1 (MIT), @pdf-lib/fontkit 1.1.1 (MIT), JSZip 3.10.1 (MIT), Noto Sans JP (SIL Open Font License). Vendored assets are included for offline operation.

## Lempoy Labs hosting

This app is published from the `iSingil/` folder at https://lempoylabs.com/iSingil/. All assets and PWA paths are relative to this folder. App source is public; billing records remain in the browser database and are not committed to Git. Records from the private Sites URL are separate because browser storage is origin-specific. To move them, export a full JSON backup there, then validate and restore it here.


Invoice layout: A4 print and downloadable PDF share bilingual labels and saved snapshot values. Optional Subject and per-line Transaction date are available on invoices; Postal code is available in Settings → Invoice profiles. Older invoices use their service-period start when a line date was not stored. Shipping and discount are shown as zero: no separate adjustments or changes to tax rounding are introduced. Existing finalized issuer/bank snapshots remain unchanged.
