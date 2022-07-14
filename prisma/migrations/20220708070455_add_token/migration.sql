/*
  Warnings:

  - Added the required column `provider` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `access_token` VARCHAR(191) NULL,
    ADD COLUMN `provider` VARCHAR(191) NOT NULL,
    ADD COLUMN `refresh_token` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;
