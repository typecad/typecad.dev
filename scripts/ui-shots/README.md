# ui-shots

Generates the screenshots on the `/hal/docs/ui*` pages (`static/hal/ui/*.png`).

Each image is a small `.ui` file in `snippets/`. `render.ts` runs it through the
typecad-hal preview pipeline headlessly: `buildPreviewSnapshot` (the same parser,
cascade, Yoga layout and font bake the firmware build uses), then
`PreviewUIRuntime`, then the framebuffer is written out as a PNG with `sharp`. There's
no browser and no board involved. `shots.ts` lists every image, the panel it renders
for, and any taps to replay first (for an open select, the keyboard, or a held
button).

## Run it

You need a checkout of [typecad/hal](https://github.com/typecad/hal) with its
dependencies installed. It defaults to `../hal`; set `HAL_DIR` to point somewhere
else.

```powershell
..\hal\node_modules\.bin\tsx scripts/ui-shots/render.ts          # everything
..\hal\node_modules\.bin\tsx scripts/ui-shots/render.ts forms    # names containing "forms"
```

Rerun it after a hal UI change and look at the git diff of `static/hal/ui`. A changed
image is either an improvement or a regression, and it's worth knowing which.

## Notes

- The script links `snippets/node_modules/@typecad/ui` to the hal checkout (it's
  gitignored) so snippets can `@import "@typecad/ui/themes/…"` the way a project does.
- Touch debounce, slides and the keyboard run on the wall clock, so steps really
  wait. A full run takes a few seconds.
- The images show the preview's rendering, not a photo of a panel. The preview aims
  to match the device, but it isn't the device.
