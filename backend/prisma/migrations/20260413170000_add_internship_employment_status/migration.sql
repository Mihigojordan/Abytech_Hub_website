-- AlterTable
ALTER TABLE `InternshipApplication`
  ADD COLUMN `employmentStatus` ENUM('INTERN', 'FULL_TIME_EMPLOYEE') NULL;

-- Backfill accepted applications into an explicit lifecycle.
-- Historical rows that already have matching admin accounts are treated as converted.
UPDATE `InternshipApplication` AS `ia`
LEFT JOIN `Admin` AS `a`
  ON `a`.`adminEmail` = `ia`.`email`
SET `ia`.`employmentStatus` = CASE
  WHEN `ia`.`status` = 'ACCEPTED' AND `a`.`id` IS NOT NULL THEN 'FULL_TIME_EMPLOYEE'
  WHEN `ia`.`status` = 'ACCEPTED' THEN 'INTERN'
  ELSE NULL
END;
