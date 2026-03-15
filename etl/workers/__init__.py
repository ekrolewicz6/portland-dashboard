"""Portland Commons Dashboard — ETL Workers"""

from workers.bls_employment import BlsEmploymentWorker
from workers.business_licenses import BusinessLicenseWorker
from workers.census import CensusWorker
from workers.hud_vacancy import HudVacancyWorker
from workers.irs_migration import IrsMigrationWorker
from workers.permits import PermitsWorker
from workers.placer_traffic import PlacerTrafficWorker
from workers.ppb_crime import PpbCrimeWorker
from workers.trimet import TrimetWorker
from workers.zillow_rents import ZillowRentsWorker

ALL_WORKERS = [
    PpbCrimeWorker,
    PermitsWorker,
    BusinessLicenseWorker,
    HudVacancyWorker,
    ZillowRentsWorker,
    CensusWorker,
    IrsMigrationWorker,
    BlsEmploymentWorker,
    TrimetWorker,
    PlacerTrafficWorker,
]

__all__ = [
    "ALL_WORKERS",
    "PpbCrimeWorker",
    "PermitsWorker",
    "BusinessLicenseWorker",
    "HudVacancyWorker",
    "ZillowRentsWorker",
    "CensusWorker",
    "IrsMigrationWorker",
    "BlsEmploymentWorker",
    "TrimetWorker",
    "PlacerTrafficWorker",
]
