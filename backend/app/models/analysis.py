from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class DocumentHit(BaseModel):
    id: str
    index: str
    title: str
    summary: Optional[str] = None
    score: float
    url: Optional[str] = None
    inventors: List[str] = Field(default_factory=list)
    assignees: List[str] = Field(default_factory=list)
    institutions: List[str] = Field(default_factory=list)


class StakeholderMap(BaseModel):
    inventors: List[str]
    assignees: List[str]
    institutions: List[str]


class TechTransferAnalysis(BaseModel):
    novelty_score: float
    top_patents: List[DocumentHit]
    top_publications: List[DocumentHit]
    stakeholders: StakeholderMap
    licensing_opportunities: List[str]
    retrieval_count: int


class AnalysisRecord(BaseModel):
    analysis_id: str
    title: str
    abstract: str
    tech_transfer: TechTransferAnalysis
    status: str = "completed"
