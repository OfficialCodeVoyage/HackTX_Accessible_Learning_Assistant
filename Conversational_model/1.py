from openai import AzureOpenAI
# Set up Azure OpenAI API key and endpoint
# openai.api_key = "#"
# openai.api_base = "https://hacktx.openai.azure.com/"
# openai.api_type = "azure"
# openai.api_version = "2023-05-15"  # Ensure this matches Azure's required version
# MODEL_NAME = "gpt-4"  # Replace with your deployment ID for the model in Azure
#
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

from openai import AzureOpenAI

token_provider = get_bearer_token_provider(DefaultAzureCredential(), "https://cognitiveservices.azure.com/.default")


# may change in the future
# https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#rest-api-versioning
api_version = "2023-07-01-preview"

# https://learn.microsoft.com/en-us/azure/cognitive-services/openai/how-to/create-resource?pivots=web-portal#create-a-resource
endpoint = "https://my-resource.openai.azure.com"

client = AzureOpenAI(
    api_version=api_version,
    azure_endpoint=endpoint,
    azure_ad_token_provider=token_provider,
)

completion = client.chat.completions.create(
    model="deployment-name",  # e.g. gpt-35-instant
    messages=[
        {
            "role": "user",
            "content": "How do I output all files in a directory using Python?",
        },
    ],
)
print(completion.to_json())