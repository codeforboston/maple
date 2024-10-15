# Massachusetts Legislative Bill Analysis

This directory contains code for summarizing and tagging Massachusetts Legislative bills using LLMs.

## Overview

The main functionality is implemented in `llm_functions.py`, which provides methods for:

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

This project is designed to work with Massachusetts legislative bills, but could be adopted to work with other states' bills, general laws, etc.


For more detailed information on each module and function, please refer to the individual file docstrings.

## Data Files

### chapter_section_names.pq

This project currently uses a Parquet file named `chapter_section_names.pq` to store information about Massachusetts General Law (MGL) chapter and section names. This file is temporarily included as a binary blob in the repository for the following reasons:

1. **Quick Development**: It allows for rapid development and testing without setting up a full database backend.
2. **Offline Usage**: It enables the application to function without an active database connection.
3. **Performance**: Parquet files offer efficient storage and quick read times for structured data.

The file contains the following columns:
- `Chapter_Number`
- `Section_Number`
- `Chapter`
- `Section Name`

#### Current Usage

The file is used in the `get_chap_sec_names_internal` function to fetch chapter and section names for bills. This function reads the Parquet file and matches chapter and section numbers to their corresponding names.

#### Future Plans

The use of this local Parquet file is a temporary solution. In future iterations of the project, we plan to replace this with a direct query to our data backend. This change will:

- Improve data consistency and updates
- Remove the need for storing large data files in the repository
- Allow for more complex queries and data relationships

#### Note for Contributors

When working on features that interact with MGL chapter and section data, please be aware that the data source for this information will change in the future. Design your code with this eventual transition in mind.

If you're adding new features that require MGL data, consider how they might interface with a database in the future instead of relying solely on the Parquet file.
