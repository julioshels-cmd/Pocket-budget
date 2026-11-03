# Pocket Budget — safe public-hosting package

This package contains **no transaction history or merchant rules**. It may be placed on public static hosting such as GitHub Pages without publishing those transactions.

## Install on iPhone free

1. Create a free GitHub account, a new public repository, and upload the files in this ZIP **into the repository root**.
2. In repository Settings → Pages, select Deploy from a branch → main → /(root).
3. Open the generated HTTPS site in iPhone Safari, and use Share → Add to Home Screen.
4. In the app choose Budget → Restore a backup, then select your **private** Pocket_Budget_Private_Backup.json file. This loads your bank history on **your device only**, not on GitHub.
5. Export a new backup frequently and keep it safe.

All app data and OCR screenshot processing stay in the browser. The free Tesseract library/model is downloaded when needed.

**Important**: anyone with your app's hosted URL can load the empty app (but cannot see your locally stored data unless they have access to your device/browser). This is not a password-protected account or live bank connection.
