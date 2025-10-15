import normalize_summaries


def test_normalize_summary_one():
    summary = """Summary:  
- The bill allows Joe, the chief of police in Gravity, to continue working.    
- The city can require annual health examinations   
    """
    assert normalize_summaries.normalize_summary(
        summary
    ) == "The bill allows Joe, the chief of police in Gravity, to continue working. The city can require annual health examinations"


def test_normalize_summary_two():
    summary = """Summary:  
The bill allows Joe, the chief of police in Gravity, to continue working.    
    """
    assert normalize_summaries.normalize_summary(
        summary
    ) == "The bill allows Joe, the chief of police in Gravity, to continue working."

def test_normalize_summary_three():
    summary = "Summary: The bill allows Joe, the chief of police in Gravity, to continue working."
    assert normalize_summaries.normalize_summary(
        summary
    ) == "The bill allows Joe, the chief of police in Gravity, to continue working."

def test_normalize_summary_four():
    summary = "The bill allows Joe, the chief of police in Gravity, to continue working."
    assert normalize_summaries.normalize_summary(
        summary
    ) == "The bill allows Joe, the chief of police in Gravity, to continue working."
