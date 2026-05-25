-- Seed: 20 customers with organizations and extras
-- Import order: customer_organizations → customer_profile → customer_profile_extras

SET FOREIGN_KEY_CHECKS=0;

-- --------------------------------------------------------
-- CREATE TABLE customer_organizations
-- --------------------------------------------------------

DROP TABLE IF EXISTS `customer_organizations`;
CREATE TABLE `customer_organizations` (
  `id` varchar(64) NOT NULL,
  `name` text DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `invoice_email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- CREATE TABLE customer_profile
-- --------------------------------------------------------

DROP TABLE IF EXISTS `customer_profile`;
CREATE TABLE `customer_profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `to_user` int(11) NOT NULL,
  `organization_id` varchar(10) DEFAULT NULL,
  `status` tinyint(1) NOT NULL,
  `first_visit` tinyint(1) NOT NULL DEFAULT 0,
  `first_name` varchar(64) NOT NULL DEFAULT '',
  `last_name` varchar(64) DEFAULT NULL,
  `pers_nr` varchar(40) NOT NULL DEFAULT '',
  `sex` enum('male','female','unknown') NOT NULL DEFAULT 'unknown',
  `careof` varchar(100) DEFAULT NULL,
  `adress` varchar(256) DEFAULT NULL,
  `post_nr` varchar(11) DEFAULT NULL,
  `ort` varchar(64) DEFAULT NULL,
  `tel` varchar(20) DEFAULT NULL,
  `date_added` datetime DEFAULT NULL,
  `email` varchar(64) DEFAULT NULL,
  `alternative_tel` varchar(20) DEFAULT NULL,
  `alternative_email` varchar(64) DEFAULT NULL,
  `want_newsletter` tinyint(1) DEFAULT 1,
  `comments` text DEFAULT NULL,
  `gothia_account` int(11) DEFAULT 1,
  `ledgers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ledgers`)),
  `blocked_fees` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`blocked_fees`)),
  `reminders` tinyint(1) DEFAULT 1,
  `do_not_call` tinyint(1) DEFAULT 0,
  `difficult_customer` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `region_code` char(2) NOT NULL DEFAULT 'SE',
  `language` char(2) DEFAULT NULL,
  `birthdate` varchar(20) DEFAULT NULL,
  `sync` tinyint(1) NOT NULL DEFAULT 1,
  `credit_check` int(11) DEFAULT 1,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `to_user_index` (`to_user`),
  KEY `pers_nr` (`pers_nr`),
  KEY `tel` (`tel`),
  KEY `alternative_email_index` (`alternative_email`),
  KEY `IDX_customer_profile_alternative_tel` (`alternative_tel`),
  KEY `IDX_postnr` (`post_nr`),
  KEY `IDX_donotcal` (`do_not_call`),
  KEY `IDX_difficult` (`difficult_customer`),
  KEY `idx_region` (`region_code`),
  KEY `IDX_credit_check` (`credit_check`),
  KEY `IDX_sex` (`sex`),
  KEY `IDX_first_name` (`first_name`),
  KEY `IDX_last_name` (`last_name`),
  KEY `IDX_ort` (`ort`),
  KEY `email` (`email`),
  KEY `date_added` (`date_added`),
  KEY `idx_customer_profile_to_user_region_code` (`to_user`,`region_code`),
  CONSTRAINT `fk_organization` FOREIGN KEY (`organization_id`) REFERENCES `customer_organizations` (`id`),
  FULLTEXT KEY `IDX_adress` (`adress`),
  FULLTEXT KEY `FullName` (`first_name`,`last_name`),
  FULLTEXT KEY `FullNameAdress` (`first_name`,`last_name`,`adress`),
  FULLTEXT KEY `email_2` (`email`),
  FULLTEXT KEY `FullNameEmail` (`first_name`,`last_name`,`email`,`alternative_email`),
  FULLTEXT KEY `FullNameAdressEmail` (`first_name`,`last_name`,`adress`,`email`,`alternative_email`),
  FULLTEXT KEY `AdressEmail` (`adress`,`email`,`alternative_email`),
  FULLTEXT KEY `FullNameSsnEmailTelAdress` (`first_name`,`pers_nr`,`tel`,`last_name`,`email`,`adress`),
  FULLTEXT KEY `FullNameEmailOnly` (`first_name`,`last_name`,`email`),
  FULLTEXT KEY `FullNameEmailAdress` (`first_name`,`last_name`,`email`,`adress`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- CREATE TABLE customer_profile_extras
-- --------------------------------------------------------

DROP TABLE IF EXISTS `customer_profile_extras`;
CREATE TABLE `customer_profile_extras` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `date_cancelled` datetime DEFAULT NULL,
  `school_start` date DEFAULT NULL,
  `block_dm` tinyint(1) NOT NULL DEFAULT 0,
  `block_gdpr` tinyint(1) NOT NULL DEFAULT 0,
  `trial_reducer` tinyint(1) NOT NULL DEFAULT 0,
  `trial_xantan` tinyint(1) NOT NULL DEFAULT 0,
  `trial_bredsp` tinyint(1) NOT NULL DEFAULT 0,
  `trial_sinfrid` tinyint(1) NOT NULL DEFAULT 0,
  `trial_date` date DEFAULT NULL,
  `migration_date` date DEFAULT NULL,
  `block_trials` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `has_purchased` tinyint(1) NOT NULL DEFAULT 0,
  `visited_introduction` date DEFAULT NULL,
  `points_accumulated` int(11) NOT NULL DEFAULT 0,
  `points_credits` int(11) NOT NULL DEFAULT 0,
  `points_from_friends` int(11) NOT NULL DEFAULT 0,
  `points_from_purchases` int(11) NOT NULL DEFAULT 0,
  `stowaway` tinyint(1) NOT NULL DEFAULT 0,
  `parcel_machine` int(11) DEFAULT 0,
  `parcel_machine_name` mediumtext DEFAULT NULL,
  `payment_preference` enum('autogiro','b-post','email','sms','paper, no fee','einvoice') DEFAULT NULL,
  `delivery_method` varchar(100) DEFAULT NULL,
  `metadata` longtext DEFAULT NULL,
  `date_exported` timestamp NULL DEFAULT NULL,
  `creditclass` tinyint(4) DEFAULT NULL,
  `bisnode_id` varchar(30) DEFAULT NULL,
  `remark_count` int(11) DEFAULT NULL,
  `remarks` mediumtext DEFAULT NULL,
  `amount` float DEFAULT NULL,
  `other_remarks` varchar(200) DEFAULT NULL,
  `household_adults` int(11) DEFAULT NULL,
  `household_children` int(11) DEFAULT NULL,
  `last_open_at` timestamp NULL DEFAULT NULL,
  `block_email` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `to_user_index` (`customer_id`),
  KEY `IDX_date_cancelled` (`date_cancelled`),
  KEY `IDX_customer_profile_stowaway` (`stowaway`),
  KEY `IDX_payment_preference` (`payment_preference`),
  KEY `IDX_trial_sinfrid` (`trial_sinfrid`),
  KEY `IDX_trial_date` (`trial_date`),
  KEY `IDX_migration_date` (`migration_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- customer_organizations (4 orgs)
-- --------------------------------------------------------

INSERT INTO `customer_organizations` (`id`, `name`, `contact_email`, `invoice_email`, `created_at`, `updated_at`) VALUES
('ORG001', 'Nordisk AB',          'contact@nordisk.se',    'invoice@nordisk.se',    '2024-01-10 08:00:00', '2024-01-10 08:00:00'),
('ORG002', 'Svensson & Co',       'info@svenssonco.se',    'faktura@svenssonco.se', '2024-02-15 09:30:00', '2024-02-15 09:30:00'),
('ORG003', 'Lindqvist Group',     'hello@lindqvist.se',    'invoice@lindqvist.se',  '2024-03-20 10:00:00', '2024-03-20 10:00:00'),
('ORG004', 'Bergstrom Trading',   'contact@bergstrom.se',  'billing@bergstrom.se',  '2024-04-05 11:15:00', '2024-04-05 11:15:00');

-- --------------------------------------------------------
-- customer_profile (20 customers)
-- --------------------------------------------------------

INSERT INTO `customer_profile`
(`to_user`, `organization_id`, `status`, `first_visit`, `first_name`, `last_name`, `pers_nr`, `sex`, `careof`, `adress`, `post_nr`, `ort`, `tel`, `date_added`, `email`, `alternative_tel`, `alternative_email`, `want_newsletter`, `comments`, `gothia_account`, `ledgers`, `blocked_fees`, `reminders`, `do_not_call`, `difficult_customer`, `region_code`, `language`, `birthdate`, `sync`, `credit_check`, `updated_at`)
VALUES
(1001, 'ORG001', 1, 0, 'Erik',    'Karlsson',   '19850312-1234', 'male',    NULL,            'Storgatan 12',       '111 22', 'Stockholm',  '070-1234567', '2024-01-15 10:00:00', 'erik.karlsson@email.se',    NULL,            NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1985-03-12', 1, 1, '2024-01-15 10:00:00'),
(1002, 'ORG001', 1, 0, 'Anna',    'Johansson',  '19900621-5678', 'female',  NULL,            'Kungsgatan 5',       '411 19', 'Göteborg',   '073-2345678', '2024-01-20 11:00:00', 'anna.johansson@email.se',   '031-123456',    'anna.j@work.se',              1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1990-06-21', 1, 1, '2024-01-20 11:00:00'),
(1003, 'ORG002', 1, 0, 'Lars',    'Andersson',  '19780905-9012', 'male',    NULL,            'Vasagatan 8',        '211 22', 'Malmö',      '076-3456789', '2024-02-01 09:00:00', 'lars.andersson@email.se',   NULL,            NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1978-09-05', 1, 1, '2024-02-01 09:00:00'),
(1004, 'ORG002', 1, 0, 'Maria',   'Nilsson',    '19921118-3456', 'female',  NULL,            'Drottninggatan 22',  '753 10', 'Uppsala',    '070-4567890', '2024-02-10 14:00:00', 'maria.nilsson@email.se',    NULL,            'maria.n@alt.se',              0, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1992-11-18', 1, 1, '2024-02-10 14:00:00'),
(1005, 'ORG002', 1, 0, 'Johan',   'Eriksson',   '19880214-7890', 'male',    NULL,            'Östra Hamngatan 3',  '582 22', 'Linköping',  '073-5678901', '2024-02-18 10:30:00', 'johan.eriksson@email.se',   '013-654321',    NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1988-02-14', 1, 1, '2024-02-18 10:30:00'),
(1006, 'ORG003', 1, 0, 'Karin',   'Larsson',    '19950430-2345', 'female',  NULL,            'Fredsgatan 14',      '722 15', 'Västerås',   '076-6789012', '2024-03-05 08:45:00', 'karin.larsson@email.se',    NULL,            NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1995-04-30', 1, 1, '2024-03-05 08:45:00'),
(1007, 'ORG003', 1, 0, 'Peter',   'Olsson',     '19810727-6789', 'male',    NULL,            'Nygatan 7',          '602 23', 'Norrköping', '070-7890123', '2024-03-12 13:00:00', 'peter.olsson@email.se',     NULL,            'p.olsson@work.se',            1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1981-07-27', 1, 1, '2024-03-12 13:00:00'),
(1008, 'ORG003', 1, 1, 'Sofia',   'Persson',    '19971003-1234', 'female',  NULL,            'Södergatan 19',      '302 43', 'Halmstad',   '073-8901234', '2024-03-20 15:30:00', 'sofia.persson@email.se',    NULL,            NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1997-10-03', 1, 1, '2024-03-20 15:30:00'),
(1009, 'ORG004', 1, 0, 'Anders',  'Svensson',   '19760516-5678', 'male',    NULL,            'Klostergatan 4',     '803 20', 'Gävle',      '076-9012345', '2024-04-02 09:15:00', 'anders.svensson@email.se',  '026-112233',    NULL,                          0, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1976-05-16', 1, 1, '2024-04-02 09:15:00'),
(1010, 'ORG004', 1, 0, 'Emma',    'Lindqvist',  '19930822-9012', 'female',  NULL,            'Hamngatan 11',       '831 34', 'Östersund',  '070-0123456', '2024-04-08 12:00:00', 'emma.lindqvist@email.se',   NULL,            'emma.l@alt.se',               1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1993-08-22', 1, 1, '2024-04-08 12:00:00'),
(1011, 'ORG004', 1, 0, 'Mikael',  'Bergstrom',  '19841209-3456', 'male',    NULL,            'Torggatan 6',        '971 32', 'Luleå',      '073-1234560', '2024-04-15 10:00:00', 'mikael.bergstrom@email.se', NULL,            NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1984-12-09', 1, 1, '2024-04-15 10:00:00'),
(1012, 'ORG001', 1, 0, 'Sara',    'Holm',       '19991125-7890', 'female',  NULL,            'Biblioteksgatan 2',  '114 46', 'Stockholm',  '076-2345671', '2024-04-22 14:30:00', 'sara.holm@email.se',        NULL,            NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1999-11-25', 1, 1, '2024-04-22 14:30:00'),
(1013, 'ORG001', 0, 0, 'David',   'Lindgren',   '19870318-2345', 'male',    NULL,            'Avenyn 33',          '411 36', 'Göteborg',   '070-3456782', '2024-05-01 09:00:00', 'david.lindgren@email.se',   '031-987654',    'david.l@work.se',             0, NULL, 1, NULL, NULL, 0, 0, 0, 'SE', 'sv', '1987-03-18', 1, 1, '2024-05-01 09:00:00'),
(1014, 'ORG002', 1, 0, 'Maja',    'Wallin',     '19940607-6789', 'female',  NULL,            'Limhamnsgatan 9',    '216 13', 'Malmö',      '073-4567893', '2024-05-06 11:15:00', 'maja.wallin@email.se',      NULL,            NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1994-06-07', 1, 1, '2024-05-06 11:15:00'),
(1015, 'ORG002', 1, 0, 'Thomas',  'Hansson',    '19801014-1234', 'male',    NULL,            'Dragarbrunnsgatan 5','753 20', 'Uppsala',    '076-5678904', '2024-05-10 13:45:00', 'thomas.hansson@email.se',   NULL,            NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1980-10-14', 1, 1, '2024-05-10 13:45:00'),
(1016, 'ORG003', 1, 1, 'Lena',    'Bjork',      '19960229-5678', 'female',  NULL,            'Klostergatan 17',    '582 28', 'Linköping',  '070-6789015', '2024-05-14 10:00:00', 'lena.bjork@email.se',       NULL,            'lena.b@alt.se',               1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1996-02-29', 1, 1, '2024-05-14 10:00:00'),
(1017, 'ORG003', 1, 0, 'Henrik',  'Sandstrom',  '19831121-9012', 'male',    NULL,            'Pilgatan 3',         '722 30', 'Västerås',   '073-7890126', '2024-05-18 09:30:00', 'henrik.sandstrom@email.se', '021-445566',    NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1983-11-21', 1, 1, '2024-05-18 09:30:00'),
(1018, 'ORG004', 1, 0, 'Ida',     'Gustafsson', '20010415-3456', 'female',  NULL,            'Hospitalsgatan 8',   '602 14', 'Norrköping', '076-8901237', '2024-05-20 15:00:00', 'ida.gustafsson@email.se',   NULL,            NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '2001-04-15', 1, 1, '2024-05-20 15:00:00'),
(1019, 'ORG004', 1, 0, 'Mattias', 'Nordin',     '19890803-7890', 'male',    NULL,            'Bredgatan 21',       '302 51', 'Halmstad',   '070-9012348', '2024-05-22 11:00:00', 'mattias.nordin@email.se',   NULL,            'mattias.n@work.se',           1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1989-08-03', 1, 1, '2024-05-22 11:00:00'),
(1020, 'ORG001', 1, 1, 'Frida',   'Magnusson',  '19910512-2345', 'female',  NULL,            'Sveavägen 44',       '113 34', 'Stockholm',  '073-0123459', '2024-05-24 10:30:00', 'frida.magnusson@email.se',  NULL,            NULL,                          1, NULL, 1, NULL, NULL, 1, 0, 0, 'SE', 'sv', '1991-05-12', 1, 1, '2024-05-24 10:30:00');

-- --------------------------------------------------------
-- customer_profile_extras (one per customer)
-- customer_id matches to_user from customer_profile above
-- --------------------------------------------------------

INSERT INTO `customer_profile_extras`
(`customer_id`, `date_cancelled`, `school_start`, `block_dm`, `block_gdpr`, `trial_reducer`, `trial_xantan`, `trial_bredsp`, `trial_sinfrid`, `trial_date`, `migration_date`, `block_trials`, `has_purchased`, `visited_introduction`, `points_accumulated`, `points_credits`, `points_from_friends`, `points_from_purchases`, `stowaway`, `parcel_machine`, `parcel_machine_name`, `payment_preference`, `delivery_method`, `metadata`, `date_exported`, `creditclass`, `bisnode_id`, `remark_count`, `remarks`, `amount`, `other_remarks`, `household_adults`, `household_children`, `last_open_at`, `block_email`)
VALUES
(1001, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 1, '2024-01-16', 250,  50,  20,  180, 0, 0, NULL,                     'email',     'standard', NULL, NULL, 2, NULL, 0, NULL, 199.00, NULL,          2, 0, '2024-05-01 10:00:00', 0),
(1002, NULL,                  NULL,         0, 0, 1, 0, 0, 0, '2024-02-01', NULL,         0, 1, '2024-01-21', 100,  20,  10,  70,  0, 1, 'PostNord Box 1234',      'autogiro',  'standard', NULL, NULL, 1, NULL, 0, NULL, 99.00,  NULL,          1, 1, '2024-05-10 09:00:00', 0),
(1003, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 1, '2024-02-02', 500,  100, 50,  350, 0, 0, NULL,                     'b-post',    'express',  NULL, NULL, 3, NULL, 1, 'Late payer Q1', 349.00, NULL, 2, 2, '2024-05-12 14:00:00', 0),
(1004, NULL,                  NULL,         1, 0, 0, 0, 0, 0, NULL,         NULL,         0, 0, NULL,         0,    0,   0,   0,   0, 0, NULL,                     'sms',       'standard', NULL, NULL, 1, NULL, 0, NULL, 0.00,   NULL,          1, 0, '2024-05-08 11:00:00', 0),
(1005, NULL,                  NULL,         0, 0, 0, 1, 0, 0, '2024-03-01', NULL,         0, 1, '2024-02-19', 320,  80,  40,  200, 0, 0, NULL,                     'einvoice',  'standard', NULL, NULL, 2, NULL, 0, NULL, 249.00, NULL,          3, 1, '2024-05-15 08:30:00', 0),
(1006, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 1, '2024-03-06', 150,  30,  0,   120, 0, 0, NULL,                     'autogiro',  'standard', NULL, NULL, 1, NULL, 0, NULL, 149.00, NULL,          2, 0, '2024-05-18 16:00:00', 0),
(1007, NULL,                  NULL,         0, 0, 0, 0, 1, 0, '2024-04-01', NULL,         0, 1, '2024-03-13', 420,  90,  30,  300, 0, 1, 'DHL ServicePoint AB',    'email',     'express',  NULL, NULL, 2, NULL, 0, NULL, 299.00, NULL,          1, 2, '2024-05-20 10:00:00', 0),
(1008, NULL,                  '2024-09-01', 0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 0, '2024-03-21', 50,   10,  0,   40,  0, 0, NULL,                     'sms',       'standard', NULL, NULL, 1, NULL, 0, NULL, 49.00,  NULL,          0, 0, '2024-04-30 09:00:00', 0),
(1009, NULL,                  NULL,         0, 1, 0, 0, 0, 0, NULL,         '2023-01-15', 0, 1, '2024-04-03', 800,  200, 100, 500, 0, 0, NULL,                     'autogiro',  'standard', NULL, NULL, 4, NULL, 2, 'Disputed charge', 599.00, NULL, 3, 2, '2024-05-22 13:00:00', 0),
(1010, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 1, '2024-04-09', 200,  40,  20,  140, 0, 0, NULL,                     'email',     'standard', NULL, NULL, 2, NULL, 0, NULL, 179.00, NULL,          2, 1, '2024-05-19 11:00:00', 0),
(1011, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 1, '2024-04-16', 380,  70,  60,  250, 0, 1, 'Instabox Luleå Centrum', 'b-post',    'standard', NULL, NULL, 3, NULL, 0, NULL, 279.00, NULL,          2, 0, '2024-05-21 15:00:00', 0),
(1012, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 0, '2024-04-23', 30,   0,   0,   30,  0, 0, NULL,                     'sms',       'standard', NULL, NULL, 1, NULL, 0, NULL, 29.00,  NULL,          1, 0, '2024-05-05 10:00:00', 0),
(1013, '2024-04-30 00:00:00', NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         1, 1, '2024-05-02', 600,  120, 80,  400, 0, 0, NULL,                     'einvoice',  'express',  NULL, NULL, 3, NULL, 1, 'Account closed', 449.00, NULL, 2, 1, '2024-05-01 09:00:00', 1),
(1014, NULL,                  NULL,         0, 0, 1, 0, 0, 0, '2024-05-10', NULL,         0, 1, '2024-05-07', 90,   10,  0,   80,  0, 0, NULL,                     'autogiro',  'standard', NULL, NULL, 1, NULL, 0, NULL, 89.00,  NULL,          2, 0, '2024-05-23 12:00:00', 0),
(1015, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 1, '2024-05-11', 450,  100, 50,  300, 0, 0, NULL,                     'email',     'standard', NULL, NULL, 2, NULL, 0, NULL, 349.00, NULL,          3, 2, '2024-05-24 09:00:00', 0),
(1016, NULL,                  '2024-08-20', 0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 0, '2024-05-15', 10,   0,   0,   10,  0, 0, NULL,                     'sms',       'standard', NULL, NULL, 1, NULL, 0, NULL, 9.00,   NULL,          1, 0, '2024-05-14 10:00:00', 0),
(1017, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 1, '2024-05-19', 310,  60,  30,  220, 0, 1, 'PostNord Västerås Nord', 'autogiro',  'express',  NULL, NULL, 2, NULL, 0, NULL, 239.00, NULL,          2, 1, '2024-05-25 08:00:00', 0),
(1018, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 0, '2024-05-21', 60,   10,  0,   50,  0, 0, NULL,                     'email',     'standard', NULL, NULL, 1, NULL, 0, NULL, 59.00,  NULL,          1, 0, '2024-05-20 15:00:00', 0),
(1019, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 1, '2024-05-23', 270,  50,  20,  200, 0, 0, NULL,                     'einvoice',  'standard', NULL, NULL, 2, NULL, 0, NULL, 219.00, NULL,          2, 0, '2024-05-24 11:00:00', 0),
(1020, NULL,                  NULL,         0, 0, 0, 0, 0, 0, NULL,         NULL,         0, 1, '2024-05-25', 120,  20,  10,  90,  0, 0, NULL,                     'autogiro',  'standard', NULL, NULL, 1, NULL, 0, NULL, 119.00, NULL,          2, 1, '2024-05-25 10:30:00', 0);

SET FOREIGN_KEY_CHECKS=1;
