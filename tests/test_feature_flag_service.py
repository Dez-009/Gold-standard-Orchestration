"""Tests for the feature flag service."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services import feature_flag_service
from tests.conftest import TestingSessionLocal


def test_feature_flag_defaults_enabled():
    db = TestingSessionLocal()
    assert feature_flag_service.get_feature_flag(db, "journal", "free")
    db.close()


def test_set_and_get_feature_flag():
    db = TestingSessionLocal()
    feature_flag_service.set_feature_flag(db, "pdf_export", "pro", True)
    # Free user should be blocked
    assert not feature_flag_service.get_feature_flag(db, "pdf_export", "free")
    # Pro user allowed
    assert feature_flag_service.get_feature_flag(db, "pdf_export", "pro")
    # Disable flag
    feature_flag_service.set_feature_flag(db, "pdf_export", "pro", False)
    assert not feature_flag_service.get_feature_flag(db, "pdf_export", "pro")
    db.close()
