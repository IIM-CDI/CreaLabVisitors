from enum import Enum


class UserRole(str, Enum):
    ETUDIANT = "etudiant"
    STAFF = "staff"