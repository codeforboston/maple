# Massachusetts Legislative Bill Analysis

This directory contains code for summarizing and tagging Massachusetts Legislative bills using LLMs.

## Overview

The main functionality is implemented in `demo_app_functions.py`, which provides methods for:

1. Summarizing bills
2. Categorizing bills
3. Tagging bills with relevant topics

## Files

- `demo_app_functions.py`: Main file containing the core functionality
- `prompts.py`: Contains predefined prompt templates for various NLP tasks
- `tagging.py`: Includes category and tag definitions for bill classification

## Key Features

- Bill summarization using GPT models
- Categorization of bills into predefined categories
- Tagging bills with relevant topics from a curated list
- Handling of both small and large documents using different approaches (standard and RAG)
- Integration with Massachusetts General Laws (MGL) for context-aware analysis

## Requirements

- Python 3.x
- Dependencies listed in `requirements.txt`

## Usage

To use the main functions:

```python
from demo_app_functions import get_summary_api_function, get_tags_api_function

# For summarization
summary = get_summary_api_function(bill_id, bill_title, bill_text)

# For tagging
tags = get_tags_api_function(bill_id, bill_title, bill_text)
```

## Note

This project is designed to work with Massachusetts legislative bills and may require specific data sources or API access for full functionality.

For more detailed information on each module and function, please refer to the individual file docstrings.