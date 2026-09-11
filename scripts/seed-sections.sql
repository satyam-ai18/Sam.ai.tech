INSERT OR IGNORE INTO "homepage_sections" ("id", "sectionId", "label", "isVisible", "order", "createdAt", "updatedAt")
VALUES 
  (lower(hex(randomblob(16))), 'announcement', 'Announcement Bar (Ticker)', 1, 0, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'notice_board', 'Notice Board', 1, 3, datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'stats', 'School At a Glance', 1, 14, datetime('now'), datetime('now'));
