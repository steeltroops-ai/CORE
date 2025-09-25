from __future__ import annotations

import logging
from collections import Counter
from typing import Any, Dict, List, Optional

from ..models.analysis import DocumentHit, StakeholderMap, TechTransferAnalysis
from .logic_mill import LogicMillClient, LogicMillError, SimilarityRequest, get_fallback_hits

logger = logging.getLogger(__name__)


def _extract_document(hit: Dict[str, Any]) -> DocumentHit:
    document = hit.get("document") or {}
    inventors = document.get("inventors") or []
    if not inventors:
        # publications sometimes expose authors via organizations or owners
        inventors = document.get("owners") or []
    assignees = document.get("assignees") or document.get("owners") or []
    institutions = document.get("organizations") or document.get("applicants") or []

    return DocumentHit(
        id=str(hit.get("id")),
        index=str(hit.get("index")),
        title=document.get("title", "Untitled"),
        summary=document.get("abstract"),
        score=float(hit.get("score", 0.0)),
        url=document.get("url"),
        inventors=[str(item) for item in inventors],
        assignees=[str(item) for item in assignees],
        institutions=[str(item) for item in institutions],
    )


def _aggregate_stakeholders(documents: List[DocumentHit]) -> StakeholderMap:
    inventors = Counter()
    assignees = Counter()
    institutions = Counter()

    for doc in documents:
        inventors.update(doc.inventors)
        assignees.update(doc.assignees)
        institutions.update(doc.institutions)

    top_inventors = [name for name, _ in inventors.most_common(5)]
    top_assignees = [name for name, _ in assignees.most_common(5)]
    top_institutions = [name for name, _ in institutions.most_common(5)]

    return StakeholderMap(
        inventors=top_inventors,
        assignees=top_assignees,
        institutions=top_institutions,
    )


def _identify_licensing_opportunities(stakeholders: StakeholderMap, focus_institution: Optional[str]) -> List[str]:
    opportunities = []
    focus_lower = (focus_institution or "").lower()
    for assignee in stakeholders.assignees:
        if focus_lower and focus_lower in assignee.lower():
            continue
        opportunities.append(f"Explore licensing conversation with {assignee}")
    if not opportunities:
        opportunities.append("Expand patent scan to adjacent EU filings for additional assignees")
    return opportunities[:5]


def run_tech_transfer_analysis(
    *,
    title: str,
    abstract: str,
    client: Optional[LogicMillClient],
) -> TechTransferAnalysis:
    query_text = f"{title}\n\n{abstract}"
    hits: List[Dict[str, Any]]
    if client:
        try:
            hits = client.similarity_search(
                SimilarityRequest(
                    text=query_text,
                    indices=["patents", "publications"],
                    amount=15,
                )
            )
        except LogicMillError as exc:
            logger.warning("Falling back to sample Logic Mill dataset: %s", exc)
            hits = get_fallback_hits()
    else:
        hits = get_fallback_hits()

    documents = [_extract_document(hit) for hit in hits]
    patents = [doc for doc in documents if doc.index == "patents"][:5]
    publications = [doc for doc in documents if doc.index != "patents"][:5]

    best_score = max((doc.score for doc in documents), default=0.0)
    novelty = round(max(0.0, 1.0 - best_score), 3)

    stakeholders = _aggregate_stakeholders(documents)
    licensing = _identify_licensing_opportunities(stakeholders, focus_institution="Max Planck")

    return TechTransferAnalysis(
        novelty_score=novelty,
        top_patents=patents,
        top_publications=publications,
        stakeholders=stakeholders,
        licensing_opportunities=licensing,
        retrieval_count=len(documents),
    )
