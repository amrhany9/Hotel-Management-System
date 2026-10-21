import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1756836554000 implements MigrationInterface {
  name = 'InitialSchema1756836554000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF OBJECT_ID(N'[dbo].[Rooms]', N'U') IS NULL
      BEGIN
        CREATE TABLE [dbo].[Rooms] (
          [Id] int IDENTITY(1,1) NOT NULL,
          [RoomNumber] nvarchar(50) NOT NULL,
          [RoomType] nvarchar(50) NOT NULL,
          [PricePerNight] decimal(18,2) NOT NULL,
          [IsAvailable] bit NOT NULL,
          [CreatedAt] datetime2 NOT NULL,
          CONSTRAINT [PK_Rooms] PRIMARY KEY ([Id])
        );
        CREATE UNIQUE INDEX [IX_Rooms_RoomNumber] ON [dbo].[Rooms] ([RoomNumber]);
      END
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'[dbo].[Users]', N'U') IS NULL
      BEGIN
        CREATE TABLE [dbo].[Users] (
          [Id] int IDENTITY(1,1) NOT NULL,
          [FullName] nvarchar(100) NOT NULL,
          [Email] nvarchar(150) NOT NULL,
          [PasswordHash] nvarchar(max) NOT NULL,
          [IsActive] bit NOT NULL,
          [CreatedAt] datetime2 NOT NULL,
          CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
        );
        CREATE UNIQUE INDEX [IX_Users_Email] ON [dbo].[Users] ([Email]);
      END
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'[dbo].[AuditLogs]', N'U') IS NULL
      BEGIN
        CREATE TABLE [dbo].[AuditLogs] (
          [Id] int IDENTITY(1,1) NOT NULL,
          [Action] nvarchar(50) NOT NULL,
          [EntityName] nvarchar(50) NOT NULL,
          [EntityId] nvarchar(50) NOT NULL,
          [UserId] int NOT NULL,
          [ActionDate] datetime2 NOT NULL,
          [Details] nvarchar(1000) NOT NULL,
          CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([Id]),
          CONSTRAINT [FK_AuditLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
        );
        CREATE INDEX [IX_AuditLogs_UserId] ON [dbo].[AuditLogs] ([UserId]);
      END
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'[dbo].[Reservations]', N'U') IS NULL
      BEGIN
        CREATE TABLE [dbo].[Reservations] (
          [Id] int IDENTITY(1,1) NOT NULL,
          [RoomId] int NOT NULL,
          [GuestName] nvarchar(100) NOT NULL,
          [CheckInDate] date NOT NULL,
          [CheckOutDate] date NOT NULL,
          [TotalAmount] decimal(18,2) NOT NULL,
          [Status] nvarchar(20) NOT NULL,
          [CreatedBy] int NOT NULL,
          [CreatedAt] datetime2 NOT NULL,
          CONSTRAINT [PK_Reservations] PRIMARY KEY ([Id]),
          CONSTRAINT [FK_Reservations_Rooms_RoomId] FOREIGN KEY ([RoomId]) REFERENCES [dbo].[Rooms] ([Id]),
          CONSTRAINT [FK_Reservations_Users_CreatedBy] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users] ([Id])
        );
        CREATE INDEX [IX_Reservations_CreatedBy] ON [dbo].[Reservations] ([CreatedBy]);
        CREATE INDEX [IX_Reservations_RoomId] ON [dbo].[Reservations] ([RoomId]);
      END
    `);

    await queryRunner.query(`
      IF OBJECT_ID(N'[dbo].[__EFMigrationsHistory]', N'U') IS NULL
      BEGIN
        CREATE TABLE [dbo].[__EFMigrationsHistory] (
          [MigrationId] nvarchar(150) NOT NULL,
          [ProductVersion] nvarchar(32) NOT NULL,
          CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
        );
      END
      IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260902180914_InitialCreate')
      BEGIN
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
        VALUES (N'20260902180914_InitialCreate', N'8.0.13');
      END
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[AuditLogs]`);
    await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[Reservations]`);
    await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[Rooms]`);
    await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[Users]`);
  }
}
