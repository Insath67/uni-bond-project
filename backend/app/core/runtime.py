"""Runtime configuration helpers for local development stability."""

from __future__ import annotations

import gc
import os


def configure_runtime_environment() -> None:
    """Set conservative defaults that reduce multiprocessing side effects."""
    os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
    os.environ.setdefault("OMP_NUM_THREADS", "1")
    os.environ.setdefault("MKL_NUM_THREADS", "1")
    os.environ.setdefault("JOBLIB_MULTIPROCESSING", "0")
    os.environ.setdefault("LOKY_MAX_CPU_COUNT", "1")


def cleanup_runtime_environment() -> None:
    """Best-effort cleanup for third-party worker pools (e.g., loky/joblib)."""
    try:
        from joblib.externals.loky import get_reusable_executor

        get_reusable_executor().shutdown(wait=True, kill_workers=True)
    except Exception:
        # Optional dependency / no active executor / platform-specific behavior.
        pass

    gc.collect()
