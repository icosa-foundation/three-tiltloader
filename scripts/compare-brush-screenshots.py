#!/usr/bin/env python3
"""Rank Open Brush screenshot differences with full-frame and brush-region SSIM."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity
from skimage.morphology import dilation, disk


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("reference", type=Path, help="directory containing reference PNG files")
    parser.add_argument("candidate", type=Path, help="directory containing candidate PNG files")
    parser.add_argument("--limit", type=int, default=20, help="maximum rows to print (default: 20)")
    parser.add_argument("--margin", type=int, default=16, help="pixels around the shared brush bounds (default: 16)")
    parser.add_argument(
        "--mask-radius",
        type=int,
        default=3,
        help="radius around rendered pixels included in foreground SSIM (default: 3)",
    )
    parser.add_argument(
        "--background-threshold",
        type=int,
        default=0,
        help="RGB values at or below this are background (default: 0)",
    )
    parser.add_argument("--brush", help="compare only filenames containing this text")
    return parser.parse_args()


def load_rgb(path: Path) -> np.ndarray:
    with Image.open(path) as image:
        return np.asarray(image.convert("RGB"))


def discrepancy(reference: np.ndarray, candidate: np.ndarray) -> float:
    return 1.0 - structural_similarity(
        reference,
        candidate,
        channel_axis=2,
        data_range=255,
    )


def foreground_discrepancy(
    reference: np.ndarray,
    candidate: np.ndarray,
    occupied: np.ndarray,
    radius: int,
) -> float:
    _, similarity_map = structural_similarity(
        reference,
        candidate,
        channel_axis=2,
        data_range=255,
        full=True,
    )
    foreground = dilation(occupied, footprint=disk(radius)) if radius else occupied
    return 1.0 - float(similarity_map[foreground].mean())


def shared_brush_crop(
    reference: np.ndarray,
    candidate: np.ndarray,
    threshold: int,
    margin: int,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, tuple[int, int, int, int]]:
    occupied = np.any(reference > threshold, axis=2) | np.any(candidate > threshold, axis=2)
    rows, columns = np.nonzero(occupied)
    if len(rows) == 0:
        height, width = reference.shape[:2]
        return reference, candidate, occupied, (0, 0, width, height)

    height, width = reference.shape[:2]
    left = max(0, int(columns.min()) - margin)
    top = max(0, int(rows.min()) - margin)
    right = min(width, int(columns.max()) + margin + 1)
    bottom = min(height, int(rows.max()) + margin + 1)
    return (
        reference[top:bottom, left:right],
        candidate[top:bottom, left:right],
        occupied[top:bottom, left:right],
        (left, top, right, bottom),
    )


def main() -> int:
    args = parse_args()
    if args.limit < 1 or args.margin < 0 or args.mask_radius < 0 or not 0 <= args.background_threshold <= 255:
        raise SystemExit("--limit must be positive, margins non-negative, and threshold 0..255")

    reference_files = {path.name: path for path in args.reference.glob("*.png")}
    candidate_files = {path.name: path for path in args.candidate.glob("*.png")}
    names = sorted(reference_files.keys() & candidate_files.keys())
    if args.brush:
        names = [name for name in names if args.brush.casefold() in name.casefold()]
    if not names:
        raise SystemExit("No matching PNG pairs found")

    results = []
    for name in names:
        reference = load_rgb(reference_files[name])
        candidate = load_rgb(candidate_files[name])
        if reference.shape != candidate.shape:
            raise SystemExit(f"Image dimensions differ for {name}: {reference.shape} vs {candidate.shape}")
        reference_crop, candidate_crop, occupied_crop, bounds = shared_brush_crop(
            reference,
            candidate,
            args.background_threshold,
            args.margin,
        )
        results.append(
            (
                discrepancy(reference_crop, candidate_crop),
                discrepancy(reference, candidate),
                foreground_discrepancy(reference_crop, candidate_crop, occupied_crop, args.mask_radius),
                name,
                bounds,
            )
        )

    results.sort(key=lambda result: result[2], reverse=True)
    print(
        f"{'rank':>4}  {'foreground discrepancy':>22}  {'region discrepancy':>18}  "
        f"{'full discrepancy':>16}  {'crop':>19}  brush"
    )
    for rank, (region_score, full_score, foreground_score, name, bounds) in enumerate(results[: args.limit], 1):
        left, top, right, bottom = bounds
        crop = f"{right-left}x{bottom-top}+{left}+{top}"
        print(
            f"{rank:4d}  {foreground_score:22.9f}  {region_score:18.9f}  "
            f"{full_score:16.9f}  {crop:>19}  {name}"
        )

    missing_candidates = len(reference_files.keys() - candidate_files.keys())
    missing_references = len(candidate_files.keys() - reference_files.keys())
    if missing_candidates or missing_references:
        print(
            f"Compared {len(names)} pairs; missing candidate={missing_candidates}, "
            f"missing reference={missing_references}",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
