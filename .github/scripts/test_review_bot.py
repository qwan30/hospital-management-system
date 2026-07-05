import json
from review_bot import (
    filter_diff,
    truncate_diff,
    changed_files,
    strip_json_fences,
    parse_json_response,
    filter_high_confidence,
    parse_linked_issue,
    b64_encode,
    b64_decode_str,
    b64_decode_json,
)

def test_filter_diff_drops_skip_patterns():
    diff = (
        "diff --git a/backend/pom.xml b/backend/pom.xml\n"
        "--- a/backend/pom.xml\n"
        "+++ b/backend/pom.xml\n"
        "@@ -1,2 +1,2 @@\n"
        "diff --git a/backend/target/classes/Foo.class b/backend/target/classes/Foo.class\n"
        "--- a/backend/target/classes/Foo.class\n"
        "+++ b/backend/target/classes/Foo.class\n"
        "diff --git a/node_modules/express/index.js b/node_modules/express/index.js\n"
        "diff --git a/frontend/src/app/page.tsx b/frontend/src/app/page.tsx\n"
    )
    filtered = filter_diff(diff)
    assert "backend/pom.xml" in filtered
    assert "frontend/src/app/page.tsx" in filtered
    assert "Foo.class" not in filtered
    assert "node_modules" not in filtered


def test_truncate_diff_under_limit_unchanged():
    diff = "hello world diff"
    assert truncate_diff(diff, 100) == diff


def test_truncate_diff_over_limit_truncates():
    diff = "A" * 200
    res = truncate_diff(diff, 100)
    assert len(res) > 100
    assert "... [diff truncated due to size]" in res


def test_parse_json_response_plain():
    text = '{"summary": "test summary", "issues": []}'
    res = parse_json_response(text)
    assert res["summary"] == "test summary"
    assert res["issues"] == []


def test_parse_json_response_with_markdown_fence():
    text = '```json\n{"summary": "test summary", "issues": []}\n```'
    res = parse_json_response(text)
    assert res["summary"] == "test summary"


def test_parse_json_response_with_trailing_extra_data():
    text = '{"summary": "test summary", "issues": []} some extra garbage'
    res = parse_json_response(text)
    assert res["summary"] == "test summary"


def test_filter_high_confidence_threshold():
    issues = [
        {"file": "A.java", "confidence": 79},
        {"file": "B.java", "confidence": 80},
        {"file": "C.java", "confidence": 95},
    ]
    res = filter_high_confidence(issues, threshold=80)
    assert len(res) == 2
    assert res[0]["file"] == "B.java"
    assert res[1]["file"] == "C.java"


def test_changed_files_extracts_paths():
    diff = (
        "diff --git a/backend/src/Foo.java b/backend/src/Foo.java\n"
        "--- a/backend/src/Foo.java\n"
        "+++ b/backend/src/Foo.java\n"
        "diff --git a/frontend/src/Bar.tsx b/frontend/src/Bar.tsx\n"
    )
    files = changed_files(diff)
    assert files == ["backend/src/Foo.java", "frontend/src/Bar.tsx"]


def test_parse_linked_issue_variants():
    assert parse_linked_issue("This PR closes #42") == "42"
    assert parse_linked_issue("fixes #107") == "107"
    assert parse_linked_issue("Resolves: #999") == "999"
    assert parse_linked_issue("no issue mentioned") is None
    assert parse_linked_issue("") is None
    assert parse_linked_issue(None) is None


def test_parse_json_response_with_invalid_escape():
    # \p is an invalid escape in JSON, but common in path names
    text = '{"summary": "test \\path", "issues": []}'
    res = parse_json_response(text)
    assert res["summary"] == "test \\path"


def test_b64_roundtrip():
    data = {"hello": "world", "number": 123}
    encoded = b64_encode(data)
    assert b64_decode_str(encoded) == json.dumps(data)
    assert b64_decode_json(encoded) == data


def run_all():
    tests = [
        test_filter_diff_drops_skip_patterns,
        test_truncate_diff_under_limit_unchanged,
        test_truncate_diff_over_limit_truncates,
        test_parse_json_response_plain,
        test_parse_json_response_with_markdown_fence,
        test_parse_json_response_with_trailing_extra_data,
        test_parse_json_response_with_invalid_escape,
        test_filter_high_confidence_threshold,
        test_changed_files_extracts_paths,
        test_parse_linked_issue_variants,
        test_b64_roundtrip,
    ]
    
    failed = 0
    for test in tests:
        try:
            test()
            print(f"PASS: {test.__name__}")
        except Exception as e:
            print(f"FAIL: {test.__name__} - {e}")
            failed += 1
            
    if failed > 0:
        print(f"\n{failed} test(s) failed!")
        sys.exit(1)
    else:
        print("\nAll tests passed successfully!")

if __name__ == "__main__":
    run_all()
