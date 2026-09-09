# Security architecture placeholders

Spreadline processes **synthetic data only**. These are architecture locations, not a GLBA compliance certification.

Current FTC Safeguards Rule resource: https://www.ftc.gov/legal-library/browse/rules/safeguards-rule

| Control | Production location | Prototype status |
|---|---|---|
| Encryption in transit | TLS termination / API gateway | Local development only; not certified |
| Encryption at rest | Managed database/object store keys | No production store exists |
| Access control | API authorization + role model | Placeholder; synthetic-only |
| MFA | Identity provider before application session | Not implemented |
| Audit logging | Append-only audit event store/SIEM export | In-memory/schema demonstration only |
| Incident response | Alerting + incident runbook + notification workflow | Documentation placeholder |
| Service-provider oversight | Vendor inventory / contracts / control reviews | Not applicable to prototype |

The amended FTC Safeguards Rule includes security requirements and a breach/security-event notification requirement that took effect May 13, 2024. A real deployment needs qualified security/legal review before handling nonpublic personal information.
