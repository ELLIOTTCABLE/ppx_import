// This is run on Travis, and presumably eventually AppVeyor, builds. It's supposed to be as
// cross-platform as possible, unlike the adjacent release-script, which I only care if *I* can run.
//---
// FIXME: This is *really* similar to the ones for ppx-sedlex et al; but there's no runtime
// component to this one. I need to clean up and abstract this script into a separate module, so I
// don't forget to port fixes and changes around between the modules ...
const current_ppx_id = require("../identify"),
   path = require("path"),
   fs = require("fs"),
   cpy = require("cpy"),
   makeDir = require("make-dir"),
   archiver = require("archiver")

const zipfile = `ppx-import-${current_ppx_id}.zip`,
   dist_dir = "dist/",
   ppx_dir = `ppx-import-${current_ppx_id}/`,
   zip_dir = "ppx/",
   exe = "ppx_import.native"

// FIXME: Does any of these even work on Windows
;(async () => {
   // Copy the executable to the submodule,
   console.log(`Copy: ${exe} -> ${ppx_dir}`)
   await cpy(exe, ppx_dir)

   // ... and again to the zip-directory,
   console.log(`Copy: ${exe} -> ${zip_dir}`)
   await cpy(exe, zip_dir)

   // Create a zip-archive,
   const dist = await makeDir(dist_dir)
   console.log(`Zip: ${path.join(zip_dir, exe)} >>> ${path.join(dist, zipfile)}`)
   const output = fs.createWriteStream(path.join(dist, zipfile)),
      archive = archiver("zip", { zlib: { level: 9 } })

   output.on("close", function() {
      console.log(`>> Zipped: ${archive.pointer()} total bytes`)
   })

   archive.pipe(output)
   archive.directory(zip_dir, false)
   archive.finalize()
})()
