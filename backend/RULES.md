# Backend Engineering Rules

## STRICT RULES:
- **NEVER use `migrate:fresh`**, `dropIfExists`, or any destructive migration.
  - **Explanation**: These commands will delete all data and are not allowed in production.
- **NEVER delete existing data** from tables unless absolutely necessary.
  - **Explanation**: Always ensure that any data deletions are part of a clear, controlled process (e.g., with backups).
- **ALL migrations must be incremental and non-destructive**.
  - **Explanation**: Migrations should only add new columns, tables, or relationships. Avoid altering existing data types or structures unless absolutely necessary.
- **ALWAYS assume the database contains important production data**.
  - **Explanation**: Any change to the database must be treated with caution and reviewed thoroughly before being applied.

## ADDITIONAL GUIDELINES:
- **Backup Before Changes**: Always back up the database before applying any changes that might affect its structure.
- **Non-Disruptive Changes**: Aim for changes that do not require downtime or major disruptions in service.
- **Code Reviews**: Ensure all database migrations are reviewed before being applied to the production environment.
- **Monitoring**: After deploying changes, monitor the application for any issues that may arise from the database changes.

---

By following these rules, you will ensure a stable and safe database migration process in production systems.