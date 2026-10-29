# Walmart "Don't Replace" Substitutions

A small Chrome extension (Manifest V3) that adds a button to the Walmart checkout
"Pick substitutions, just in case" sidebar. One click sets every item's
substitution preference to **Don't replace**.

## Install (unpacked)

1. Clone or download this repo.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and choose this folder.

## Use

1. Go to Walmart checkout and open the substitutions sidebar (**Review**).
2. Click **Set all to Don't replace** in the panel at the bottom left.
3. Wait for the status line to report "Done". Use **Stop** to cancel.
4. Scroll through the sidebar to verify before you place your order.

## Safety

- The script only queries inside the substitutions dialog. It never clicks
  Place order, tip buttons or anything else on the checkout page.
- It does not send data anywhere and needs no extension permissions.
- Walmart can change its markup at any time. If items are reported as failed,
  the selectors in `content.js` need updating.

## Test

`test/mock.html` is a stand-in for the sidebar. Serve the repo folder
(`python -m http.server`) and open `/test/mock.html`.

## License

MIT
