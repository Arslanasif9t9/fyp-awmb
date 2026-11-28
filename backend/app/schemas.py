import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Domains the engine knows about. New domain adapters are added here later.
Domain = Literal["general", "news_incident", "city_traffic"]


class RegisterIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str
    role: str
    status: str
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class WorldCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=2, max_length=100)
    domain: Domain = "general"
    purpose: str = Field(min_length=3, max_length=2000)


class WorldOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    domain: str
    purpose: str
    current_version: int
    created_at: datetime
    updated_at: datetime

class FileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    filename: str
    file_type: str
    status: str
    uploaded_at: datetime

class EvidenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    claim_text: str
    chunk_ref: str | None
    status: str # <-- Ye add karo
    created_at: datetime

class ChangeLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    action: str
    target_type: str
    target_id: uuid.UUID
    old_state: str | None
    new_state: str | None
    performed_at: datetime

class QARequest(BaseModel):
    question: str = Field(min_length=2, max_length=500)

class QAResponse(BaseModel):
    answer: str
    citations: list[EvidenceOut]

class EntityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    entity_type: str

class RelationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    source_entity_id: uuid.UUID
    target_entity_id: uuid.UUID
    relation_type: str

class GraphDataOut(BaseModel):
    entities: list[EntityOut]
    relations: list[RelationOut]

class ContradictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    explanation: str
    evidence_1_text: str
    evidence_2_text: str
    status: str
    created_at: datetime

