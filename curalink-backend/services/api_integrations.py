import httpx
from typing import List, Dict, Optional
from Bio import Entrez
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Set your email for NCBI
Entrez.email = os.getenv("ENTREZ_EMAIL", "your-email@example.com")

class PubMedService:
    """Service for fetching publications from PubMed"""
    
    @staticmethod
    async def search_publications(query: str, max_results: int = 20) -> List[Dict]:
        try:
            # Search PubMed
            handle = Entrez.esearch(db="pubmed", term=query, retmax=max_results, sort="relevance")
            record = Entrez.read(handle)
            handle.close()
            
            id_list = record["IdList"]
            if not id_list:
                return []
            
            # Fetch details
            handle = Entrez.efetch(db="pubmed", id=id_list, rettype="medline", retmode="xml")
            records = Entrez.read(handle)
            handle.close()
            
            publications = []
            for article in records['PubmedArticle']:
                try:
                    medline = article['MedlineCitation']
                    article_data = medline['Article']
                    
                    # Extract authors
                    authors = []
                    if 'AuthorList' in article_data:
                        for author in article_data['AuthorList'][:3]:  # First 3 authors
                            if 'LastName' in author and 'Initials' in author:
                                authors.append(f"{author['LastName']} {author['Initials']}")
                    
                    # Extract publication date
                    pub_date = ""
                    if 'ArticleDate' in article_data and article_data['ArticleDate']:
                        date_info = article_data['ArticleDate'][0]
                        pub_date = f"{date_info.get('Year', '')}-{date_info.get('Month', '')}-{date_info.get('Day', '')}"
                    elif 'Journal' in article_data and 'JournalIssue' in article_data['Journal']:
                        pub_date_info = article_data['Journal']['JournalIssue'].get('PubDate', {})
                        pub_date = pub_date_info.get('Year', '')
                    
                    publications.append({
                        "pmid": str(medline['PMID']),
                        "title": article_data.get('ArticleTitle', ''),
                        "abstract": article_data.get('Abstract', {}).get('AbstractText', [''])[0] if 'Abstract' in article_data else '',
                        "authors": ", ".join(authors),
                        "journal": article_data.get('Journal', {}).get('Title', ''),
                        "pub_date": pub_date,
                        "doi": next((id_data for id_data in article.get('PubmedData', {}).get('ArticleIdList', []) if id_data.attributes.get('IdType') == 'doi'), None)
                    })
                except Exception as e:
                    print(f"Error parsing article: {e}")
                    continue
            
            return publications
        except Exception as e:
            print(f"Error fetching from PubMed: {e}")
            return []

class ClinicalTrialsService:
    """Service for fetching clinical trials from ClinicalTrials.gov"""
    
    BASE_URL = "https://clinicaltrials.gov/api/v2/studies"
    
    @staticmethod
    async def search_trials(
        condition: str = None,
        location: str = None,
        phase: str = None,
        status: str = None,
        max_results: int = 20
    ) -> List[Dict]:
        try:
            params = {
                "format": "json",
                "pageSize": max_results,
            }
            
            # Build query
            query_parts = []
            if condition:
                query_parts.append(f"AREA[Condition]{condition}")
            if location:
                query_parts.append(f"AREA[LocationCountry]{location}")
            if status:
                query_parts.append(f"AREA[OverallStatus]{status}")
            
            if query_parts:
                params["query.cond"] = condition if condition else ""
                params["query.locn"] = location if location else ""
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(ClinicalTrialsService.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
            
            trials = []
            for study in data.get("studies", []):
                protocol = study.get("protocolSection", {})
                identification = protocol.get("identificationModule", {})
                status_module = protocol.get("statusModule", {})
                description = protocol.get("descriptionModule", {})
                conditions = protocol.get("conditionsModule", {})
                design = protocol.get("designModule", {})
                
                trials.append({
                    "nct_id": identification.get("nctId", ""),
                    "title": identification.get("briefTitle", ""),
                    "summary": description.get("briefSummary", ""),
                    "detailed_description": description.get("detailedDescription", ""),
                    "condition": ", ".join(conditions.get("conditions", [])),
                    "phase": ", ".join(design.get("phases", [])),
                    "status": status_module.get("overallStatus", ""),
                    "sponsor": protocol.get("sponsorCollaboratorsModule", {}).get("leadSponsor", {}).get("name", ""),
                    "enrollment": status_module.get("enrollmentInfo", {}).get("count", 0),
                    "study_type": design.get("studyType", ""),
                    "locations": ClinicalTrialsService._extract_locations(protocol.get("contactsLocationsModule", {}))
                })
            
            return trials
        except Exception as e:
            print(f"Error fetching clinical trials: {e}")
            return []
    
    @staticmethod
    def _extract_locations(contacts_module: Dict) -> List[str]:
        locations = []
        for location in contacts_module.get("locations", [])[:5]:  # First 5 locations
            city = location.get("city", "")
            country = location.get("country", "")
            if city and country:
                locations.append(f"{city}, {country}")
        return locations

class ORCIDService:
    """Service for fetching researcher data from ORCID"""
    
    BASE_URL = "https://pub.orcid.org/v3.0"
    
    @staticmethod
    async def get_researcher_profile(orcid_id: str) -> Optional[Dict]:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {"Accept": "application/json"}
                response = await client.get(
                    f"{ORCIDService.BASE_URL}/{orcid_id}/person",
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                
                # Extract basic info
                name = data.get("name", {})
                bio = data.get("biography", {})
                
                return {
                    "orcid_id": orcid_id,
                    "name": f"{name.get('given-names', {}).get('value', '')} {name.get('family-name', {}).get('value', '')}",
                    "biography": bio.get("content", ""),
                    "keywords": [kw.get("content", "") for kw in data.get("keywords", {}).get("keyword", [])]
                }
        except Exception as e:
            print(f"Error fetching ORCID profile: {e}")
            return None
    
    @staticmethod
    async def search_researchers(query: str, max_results: int = 20) -> List[Dict]:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {"Accept": "application/json"}
                response = await client.get(
                    f"{ORCIDService.BASE_URL}/search",
                    params={"q": query, "rows": max_results},
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                
                researchers = []
                for result in data.get("result", []):
                    orcid_id = result.get("orcid-identifier", {}).get("path", "")
                    researchers.append({
                        "orcid_id": orcid_id,
                        "name": result.get("given-names", "") + " " + result.get("family-names", ""),
                        "institution": result.get("institution-name", [""])[0] if result.get("institution-name") else ""
                    })
                
                return researchers
        except Exception as e:
            print(f"Error searching ORCID: {e}")
            return []
