from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import Field


class GovScheme(Document):
    name: str
    description: str
    eligibility_criteria: List[str] = Field(default_factory=list)
    benefits: str
    required_documents: List[str] = Field(default_factory=list)
    application_deadline: Optional[datetime] = None
    application_steps: List[str] = Field(default_factory=list)
    official_source_url: str
    applicable_states: List[str] = Field(default_factory=list)

    class Settings:
        name = "gov_schemes"
