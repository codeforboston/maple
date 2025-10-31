import normalize_summaries


def test_normalize_summary_handles_summary_prefix_and_bullets():
    summary = """Summary:  
- The bill allows Joe, the chief of police in Gravity, to continue working.    
- The city can require annual health examinations   
    """
    assert (
        normalize_summaries.normalize_summary(summary)
        == "The bill allows Joe, the chief of police in Gravity, to continue working. The city can require annual health examinations"
    )


def test_normalize_summary_handles_summary_prefix_and_no_bullets():
    summary = """Summary:  
The bill allows Joe, the chief of police in Gravity, to continue working.    
    """
    assert (
        normalize_summaries.normalize_summary(summary)
        == "The bill allows Joe, the chief of police in Gravity, to continue working."
    )


def test_normalize_summary_handles_summary_prefix_with_no_linebreak():
    summary = "Summary: The bill allows Joe, the chief of police in Gravity, to continue working."
    assert (
        normalize_summaries.normalize_summary(summary)
        == "The bill allows Joe, the chief of police in Gravity, to continue working."
    )


def test_normalize_summary_handles_bare_summary():
    summary = (
        "The bill allows Joe, the chief of police in Gravity, to continue working."
    )
    assert (
        normalize_summaries.normalize_summary(summary)
        == "The bill allows Joe, the chief of police in Gravity, to continue working."
    )
