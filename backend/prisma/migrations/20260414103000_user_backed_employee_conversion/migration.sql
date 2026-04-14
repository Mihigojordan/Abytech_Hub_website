-- Add employee fields to the users table
ALTER TABLE `users`
  ADD COLUMN `phone` VARCHAR(50) NULL,
  ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN `role` ENUM('USER', 'EMPLOYEE') NOT NULL DEFAULT 'USER',
  ADD COLUMN `employeeType` ENUM('FULL_TIME', 'PART_TIME') NULL;

-- Add a stable internship start date for remaining-time calculations
ALTER TABLE `InternshipApplication`
  ADD COLUMN `internshipStartDate` DATETIME(3) NULL,
  MODIFY `employmentStatus` ENUM('INTERN', 'FULL_TIME_EMPLOYEE', 'PART_TIME_EMPLOYEE') NULL;

-- Backfill the internship start date for already accepted interns
UPDATE `InternshipApplication`
SET `internshipStartDate` = CASE
  WHEN `preferredStart` IS NOT NULL AND `preferredStart` > COALESCE(`reviewedAt`, `updatedAt`, `createdAt`)
    THEN `preferredStart`
  ELSE COALESCE(`reviewedAt`, `updatedAt`, `createdAt`)
END
WHERE `status` = 'ACCEPTED'
  AND `internshipStartDate` IS NULL;
