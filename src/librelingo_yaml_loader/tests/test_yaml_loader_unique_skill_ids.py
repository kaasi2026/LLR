from types import SimpleNamespace

import pytest

from librelingo_yaml_loader.yaml_loader import (
    ValidationError,
    _validate_unique_skill_ids,
)


def test_duplicate_skill_ids_raise_validation_error():
    modules = [
        SimpleNamespace(skills=[SimpleNamespace(id=7, filename="first.yaml")]),
        SimpleNamespace(skills=[SimpleNamespace(id="7", filename="second.yaml")]),
    ]

    with pytest.raises(ValidationError, match="Duplicate skill ID") as error:
        _validate_unique_skill_ids(modules)

    assert "first.yaml" in str(error.value)
    assert "second.yaml" in str(error.value)