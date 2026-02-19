/*
  Settings Access Control Schema
  - Table: roles
  - Table: organization_users
  - Aligned with the current Settings UI payloads
*/

IF OBJECT_ID(N'dbo.roles', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.roles (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_roles PRIMARY KEY DEFAULT NEWID(),
    organization_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(150) NOT NULL,
    description NVARCHAR(500) NULL,
    permissions_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_roles_permissions_json DEFAULT N'[]',
    branches_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_roles_branches_json DEFAULT N'[]',
    additional_permissions_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_roles_additional_permissions_json DEFAULT N'[]',
    back_days_limit INT NOT NULL CONSTRAINT DF_roles_back_days_limit DEFAULT 0,
    time_restriction_enabled BIT NOT NULL CONSTRAINT DF_roles_time_restriction_enabled DEFAULT 0,
    time_from NVARCHAR(5) NULL,
    time_to NVARCHAR(5) NULL,
    off_day NVARCHAR(20) NULL,
    is_system_role BIT NOT NULL CONSTRAINT DF_roles_is_system_role DEFAULT 0,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_roles_status DEFAULT N'ACTIVE',
    created_at DATETIME2 NOT NULL CONSTRAINT DF_roles_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_roles_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_roles_org_name UNIQUE (organization_id, name)
  );
END;
GO

IF OBJECT_ID(N'dbo.organization_users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.organization_users (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_organization_users PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    organization_id UNIQUEIDENTIFIER NOT NULL,
    role_id UNIQUEIDENTIFIER NULL,
    name NVARCHAR(200) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_organization_users_status DEFAULT N'ACTIVE',
    permissions_allow_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_organization_users_permissions_allow_json DEFAULT N'[]',
    permissions_deny_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_organization_users_permissions_deny_json DEFAULT N'[]',
    branches_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_organization_users_branches_json DEFAULT N'[]',
    back_days_limit INT NOT NULL CONSTRAINT DF_organization_users_back_days_limit DEFAULT 0,
    time_restriction_enabled BIT NOT NULL CONSTRAINT DF_organization_users_time_restriction_enabled DEFAULT 0,
    time_from NVARCHAR(5) NULL,
    time_to NVARCHAR(5) NULL,
    off_day NVARCHAR(20) NULL,
    invited_by UNIQUEIDENTIFIER NULL,
    joined_at DATETIME2 NULL,
    last_active_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_organization_users_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_organization_users_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_organization_users_role_id FOREIGN KEY (role_id) REFERENCES dbo.roles(id),
    CONSTRAINT UQ_organization_users_org_email UNIQUE (organization_id, email)
  );
END;
GO

/*
  Compatibility patch:
  If legacy tables already exist (with old column names), add the new UI/Prisma columns.
*/
IF COL_LENGTH('dbo.roles', 'permissions_json') IS NULL
  ALTER TABLE dbo.roles ADD permissions_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_roles_permissions_json_sb DEFAULT N'[]';
IF COL_LENGTH('dbo.roles', 'branches_json') IS NULL
  ALTER TABLE dbo.roles ADD branches_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_roles_branches_json_sb DEFAULT N'[]';
IF COL_LENGTH('dbo.roles', 'additional_permissions_json') IS NULL
  ALTER TABLE dbo.roles ADD additional_permissions_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_roles_additional_permissions_json_sb DEFAULT N'[]';
IF COL_LENGTH('dbo.roles', 'back_days_limit') IS NULL
  ALTER TABLE dbo.roles ADD back_days_limit INT NOT NULL CONSTRAINT DF_roles_back_days_limit_sb DEFAULT 0;
IF COL_LENGTH('dbo.roles', 'time_restriction_enabled') IS NULL
  ALTER TABLE dbo.roles ADD time_restriction_enabled BIT NOT NULL CONSTRAINT DF_roles_time_restriction_enabled_sb DEFAULT 0;
IF COL_LENGTH('dbo.roles', 'time_from') IS NULL
  ALTER TABLE dbo.roles ADD time_from NVARCHAR(5) NULL;
IF COL_LENGTH('dbo.roles', 'time_to') IS NULL
  ALTER TABLE dbo.roles ADD time_to NVARCHAR(5) NULL;
IF COL_LENGTH('dbo.roles', 'off_day') IS NULL
  ALTER TABLE dbo.roles ADD off_day NVARCHAR(20) NULL;
IF COL_LENGTH('dbo.roles', 'status') IS NULL
  ALTER TABLE dbo.roles ADD status NVARCHAR(20) NOT NULL CONSTRAINT DF_roles_status_sb DEFAULT N'ACTIVE';
GO

IF COL_LENGTH('dbo.organization_users', 'name') IS NULL
  ALTER TABLE dbo.organization_users ADD name NVARCHAR(200) NOT NULL CONSTRAINT DF_org_users_name_sb DEFAULT N'';
IF COL_LENGTH('dbo.organization_users', 'email') IS NULL
  ALTER TABLE dbo.organization_users ADD email NVARCHAR(255) NOT NULL CONSTRAINT DF_org_users_email_sb DEFAULT N'';
IF COL_LENGTH('dbo.organization_users', 'permissions_allow_json') IS NULL
  ALTER TABLE dbo.organization_users ADD permissions_allow_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_org_users_permissions_allow_json_sb DEFAULT N'[]';
IF COL_LENGTH('dbo.organization_users', 'permissions_deny_json') IS NULL
  ALTER TABLE dbo.organization_users ADD permissions_deny_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_org_users_permissions_deny_json_sb DEFAULT N'[]';
IF COL_LENGTH('dbo.organization_users', 'branches_json') IS NULL
  ALTER TABLE dbo.organization_users ADD branches_json NVARCHAR(MAX) NOT NULL CONSTRAINT DF_org_users_branches_json_sb DEFAULT N'[]';
IF COL_LENGTH('dbo.organization_users', 'back_days_limit') IS NULL
  ALTER TABLE dbo.organization_users ADD back_days_limit INT NOT NULL CONSTRAINT DF_org_users_back_days_limit_sb DEFAULT 0;
IF COL_LENGTH('dbo.organization_users', 'time_restriction_enabled') IS NULL
  ALTER TABLE dbo.organization_users ADD time_restriction_enabled BIT NOT NULL CONSTRAINT DF_org_users_time_restriction_enabled_sb DEFAULT 0;
IF COL_LENGTH('dbo.organization_users', 'time_from') IS NULL
  ALTER TABLE dbo.organization_users ADD time_from NVARCHAR(5) NULL;
IF COL_LENGTH('dbo.organization_users', 'time_to') IS NULL
  ALTER TABLE dbo.organization_users ADD time_to NVARCHAR(5) NULL;
IF COL_LENGTH('dbo.organization_users', 'off_day') IS NULL
  ALTER TABLE dbo.organization_users ADD off_day NVARCHAR(20) NULL;
GO

/* Migrate legacy JSON columns if they exist */
IF COL_LENGTH('dbo.roles', 'Permissions') IS NOT NULL
BEGIN
  UPDATE dbo.roles
  SET permissions_json = CASE
    WHEN ISNULL(LTRIM(RTRIM(permissions_json)), N'') = N'' THEN ISNULL(CONVERT(NVARCHAR(MAX), [Permissions]), N'[]')
    ELSE permissions_json
  END;
END;
GO

IF COL_LENGTH('dbo.roles', 'Branches') IS NOT NULL
BEGIN
  UPDATE dbo.roles
  SET branches_json = CASE
    WHEN ISNULL(LTRIM(RTRIM(branches_json)), N'') = N'' THEN ISNULL(CONVERT(NVARCHAR(MAX), [Branches]), N'[]')
    ELSE branches_json
  END;
END;
GO

IF COL_LENGTH('dbo.roles', 'AdditionalPermissions') IS NOT NULL
BEGIN
  UPDATE dbo.roles
  SET additional_permissions_json = CASE
    WHEN ISNULL(LTRIM(RTRIM(additional_permissions_json)), N'') = N'' THEN ISNULL(CONVERT(NVARCHAR(MAX), [AdditionalPermissions]), N'[]')
    ELSE additional_permissions_json
  END;
END;
GO

IF COL_LENGTH('dbo.organization_users', 'permissions_json') IS NOT NULL
BEGIN
  UPDATE dbo.organization_users
  SET permissions_allow_json = CASE
    WHEN ISNULL(LTRIM(RTRIM(permissions_allow_json)), N'') = N'' THEN ISNULL(CONVERT(NVARCHAR(MAX), [permissions_json]), N'[]')
    ELSE permissions_allow_json
  END;
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'IX_roles_organization_id'
    AND object_id = OBJECT_ID(N'dbo.roles')
)
BEGIN
  CREATE INDEX IX_roles_organization_id
    ON dbo.roles (organization_id);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'IX_organization_users_organization_id'
    AND object_id = OBJECT_ID(N'dbo.organization_users')
)
BEGIN
  CREATE INDEX IX_organization_users_organization_id
    ON dbo.organization_users (organization_id);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'IX_organization_users_role_id'
    AND object_id = OBJECT_ID(N'dbo.organization_users')
)
BEGIN
  CREATE INDEX IX_organization_users_role_id
    ON dbo.organization_users (role_id);
END;
GO

/*
  Legacy compatibility:
  Some existing environments still have organization_users.user_id linked to dbo.users(id),
  which breaks local settings user creation flow. Drop that FK if present.
*/
IF EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = N'FK_org_user_user'
    AND parent_object_id = OBJECT_ID(N'dbo.organization_users')
)
BEGIN
  ALTER TABLE dbo.organization_users
    DROP CONSTRAINT FK_org_user_user;
END;
GO

/*
  Normalize status check constraint for settings UI.
  Keep legacy statuses and add INACTIVE for UI toggle/update operations.
*/
DECLARE @dropStatusChecksSql NVARCHAR(MAX) = N'';

SELECT @dropStatusChecksSql = @dropStatusChecksSql
  + N'ALTER TABLE dbo.organization_users DROP CONSTRAINT '
  + QUOTENAME(cc.name)
  + N';'
FROM sys.check_constraints cc
WHERE cc.parent_object_id = OBJECT_ID(N'dbo.organization_users')
  AND cc.name <> N'CK_organization_users_status_sb';

IF (@dropStatusChecksSql <> N'')
BEGIN
  EXEC sp_executesql @dropStatusChecksSql;
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = N'CK_organization_users_status_sb'
    AND parent_object_id = OBJECT_ID(N'dbo.organization_users')
)
BEGIN
  ALTER TABLE dbo.organization_users
    WITH NOCHECK
    ADD CONSTRAINT CK_organization_users_status_sb
      CHECK ([status] IN (N'ACTIVE', N'INACTIVE', N'SUSPENDED', N'INVITED', N'REMOVED'));
END;
GO
