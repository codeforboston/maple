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

- Python 3.12.0
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


## Environment Setup

### OpenAI API Key

This project uses OpenAI's API for various language processing tasks. To use the OpenAI API, you need to set up your API key as an environment variable. The application expects the API key to be available in the `OPENAI_API_KEY` environment variable.

#### Setting up the API Key

1. **Obtain an API Key**: If you haven't already, sign up for an OpenAI account and obtain an API key from the [OpenAI website](https://openai.com/).

2. **Set the Environment Variable**:

   - **On Unix-based systems (Linux, macOS)**:
     Open your terminal and add the following line to your shell configuration file (e.g., `.bashrc`, `.zshrc`):
     ```
     export OPENAI_API_KEY='your-api-key-here'
     ```
     Then, reload your shell configuration:
     ```
     source ~/.bashrc  # or ~/.zshrc, depending on your shell
     ```

   - **On Windows**:
     Open Command Prompt and run:
     ```
     setx OPENAI_API_KEY "your-api-key-here"
     ```
     Note: You'll need to restart your command prompt for the changes to take effect.

   - **For development environments**:
     If you're using a development environment like PyCharm or VS Code, you can set environment variables in your project configuration.

3. **Verify the Setup**:
   You can verify that the environment variable is set correctly by running:
   ```python
   import os
   print(os.environ.get('OPENAI_API_KEY'))

# Running the API

Set up a virtual environment and run the Flask app

```
python3 -m venv llm-api
source llm-api/bin/activate # .fish if using fish
pip3 install -r requirements.txt
python3 -m flask --app api run
```

TODO:

- [ ] Get an OpenAPI key
- [ ] Attempt to run the summary function locally using the flask API
- [ ] Try to add deploy this using cloud functions and `cloudbuild.yaml`
      Found some cloud functions documentation here,
      https://medium.com/@rez.archer/mastering-serverless-flask-apis-on-google-cloud-a-ci-cd-pipeline-setup-253b6de1c1ad
- [ ] Alphabetize the requirements.txt file
