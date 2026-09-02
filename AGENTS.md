# Project agent notes

## Brush screenshot SSIM environment

- Reuse the repository-local `.ssim-env` virtual environment. Do not recreate it or reinstall its packages when it already exists and imports successfully.
- On Windows, run its interpreter as `.\.ssim-env\Scripts\python.exe`.
- The environment currently contains Pillow 12.3.0, NumPy 2.5.2, and scikit-image 0.26.0.
- `.ssim-env\pip.ini` contains a valid ISO-date `uploaded-prior-to` value. This overrides an invalid global pip configuration value that otherwise prevents package installation. Preserve this file if the environment needs maintenance.
- If the environment is genuinely absent, create it with `python -m venv .ssim-env`, write the local `pip.ini` workaround, and install Pillow, NumPy, and scikit-image once.
- Run screenshot comparisons with `scripts\compare-brush-screenshots.py`. It reports foreground-weighted, shared-region, and full-frame RGB SSIM discrepancies. The full-frame score must continue to use `structural_similarity(..., channel_axis=2, data_range=255)` and discrepancy `1 - SSIM`.
- Keep `.ssim-env` for the duration of the brush-comparison work; do not delete it between brushes or turns.

## Shader dependency pins

- A shader update is not complete until its source repository is committed and every applicable downstream revision pin is updated to that exact commit.
- Treat `icosa-sketch-assets` as the brush-shader source of truth. After changing its shaders, synchronize the shader copies in `three-icosa`, commit that synchronization, update `three-tiltloader` to the resulting `three-icosa` commit, and then update Brushspace and Gallery Viewer to the resulting library commits where applicable.
- Update Brushspace's pinned `icosa-sketch-assets` revision whenever the source-of-truth shader commit changes.
- Do not leave a consumer pointing at an earlier shader or library revision while reporting the shader work complete.
