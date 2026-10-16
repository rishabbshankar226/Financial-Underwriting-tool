from uuid import UUID

from streamlit_app.runtime import open_testing_store


def test_store_identity_survives_reopening_and_changes_after_a_reset(tmp_path):
    path = tmp_path / "private/cases.sqlite3"
    first = open_testing_store(path)
    assert str(UUID(first.generation)) == first.generation
    assert open_testing_store(path).generation == first.generation
    assert first.is_current()
    path.unlink()
    assert not first.is_current()
    replacement = open_testing_store(path)
    assert replacement.generation != first.generation
    assert not first.is_current()
    assert replacement.is_current()


def test_unknown_marker_is_not_silently_reused(tmp_path):
    path = tmp_path / "cases.sqlite3"
    first = open_testing_store(path)
    first.marker.write_text('{"generation":"unrecognized"}')
    assert not first.is_current()
    second = open_testing_store(path)
    assert second.generation != first.generation
