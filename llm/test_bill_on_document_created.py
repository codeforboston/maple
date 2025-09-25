from bill_on_document_created import (
    category_by_topic,
    get_categories_from_topics,
    TopicAndCategory,
)
from collections import deque


def test_get_categories_from_topics_empty():
    topic_to_category = category_by_topic()
    tags = []
    topic_and_categories = get_categories_from_topics(tags, topic_to_category)
    assert topic_and_categories == deque([])


def test_get_categories_from_topics_non_existant():
    topic_to_category = category_by_topic()
    tags = ["This shouldn't be a category"]
    topic_and_categories = get_categories_from_topics(tags, topic_to_category)
    assert topic_and_categories == deque([])


def test_get_categories_from_topics_works():
    topic_to_category = category_by_topic()
    tags = [
        "Banking and financial institutions regulation",
        "Soil pollution",
    ]
    topic_and_categories = get_categories_from_topics(tags, topic_to_category)
    assert topic_and_categories == deque(
        [
            TopicAndCategory(
                topic="Banking and financial institutions regulation",
                category="Commerce",
            ),
            TopicAndCategory(
                topic="Soil pollution", category="Environmental Protection"
            ),
        ]
    )
