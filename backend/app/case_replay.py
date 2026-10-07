"""Retained v1 dispatch and conservative comparison; never updates stored runs."""
import json
from math import isclose

from pydantic import TypeAdapter

from .assessment_contracts import CommercialAssessmentRequest, SCHEMA_VERSION, SERIALIZATION_VERSION
from .case_contracts import ReplayResult
from .config import PolicyConfig
from .core import CALCULATION_VERSION


def compare_assessments(stored, computed):
    differences = []

    def compare(left, right, path, exact=False):
        # Input/policy/fingerprint and the entire decision must be exact. Policy
        # operands in traces must also never receive a financial-value tolerance.
        if isinstance(left, dict) and isinstance(right, dict):
            exact = exact or left.get("reference_type") == "policy"
            if left.keys() != right.keys():
                differences.append(path + "/keys")
            for key in sorted(left.keys() & right.keys()):
                compare(left[key], right[key], path + "/" + key,
                        exact or key in ("decision", "policy_snapshot", "normalized_input", "fingerprint"))
        elif isinstance(left, list) and isinstance(right, list):
            if len(left) != len(right):
                differences.append(path + "/length")
            for index, (a, b) in enumerate(zip(left, right)):
                compare(a, b, path + f"/{index}", exact)
        elif type(left) in (float, int) and type(right) in (float, int):
            if not (left == right if exact else isclose(left, right, rel_tol=1e-12, abs_tol=1e-8)):
                differences.append(path)
        elif type(left) is not type(right) or left != right:
            differences.append(path)

    compare(stored, computed, "")
    return differences


def replay_snapshot(snapshot, assessment_operation):
    assessment = snapshot.assessment
    versions = (assessment.get("schema_version"), assessment.get("calculation_version"),
                assessment.get("serialization_version"))
    supported = (SCHEMA_VERSION, CALCULATION_VERSION, SERIALIZATION_VERSION)
    identity = dict(case_id=snapshot.case_id, revision=snapshot.revision, run_id=snapshot.run_id)
    if versions != supported:
        return ReplayResult(**identity, status="replay_unavailable", differences=[],
                            explanation="The retained schema/calculation/serialization definition is unsupported")
    try:
        request = CommercialAssessmentRequest.model_validate_json(json.dumps(snapshot.normalized_input))
        policy = TypeAdapter(PolicyConfig).validate_json(json.dumps(assessment["policy_snapshot"]))
        computed = assessment_operation(request, policy).model_dump(mode="json")
    except (ValueError, OverflowError, RecursionError):
        return ReplayResult(**identity, status="replay_unavailable", differences=[],
                            explanation="The retained input/policy cannot be evaluated by the supported definition")
    differences = compare_assessments(assessment, computed)
    return ReplayResult(**identity, status="mismatch" if differences else "matched", differences=differences,
                        explanation="Comparison uses the stored policy; decision comparisons require exact equality")
