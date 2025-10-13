-- Tạo database mới
CREATE DATABASE AppUserDb;
GO

-- Sử dụng database vừa tạo
USE AppUserDb;
GO

-- Tạo bảng Users
CREATE TABLE [dbo].[Users] (
    [Id] INT NOT NULL PRIMARY KEY,
    [UserName] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(200) NOT NULL,
    [PasswordHash] VARBINARY(MAX) NOT NULL,
    [PasswordSalt] VARBINARY(MAX) NOT NULL
);
GO
