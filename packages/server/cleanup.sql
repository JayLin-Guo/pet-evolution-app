-- ========================================
-- 清理 pet_evolution 数据库旧表
-- ========================================

-- 先关闭外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 删除已废弃的旧表
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS pet_actions;
DROP TABLE IF EXISTS pet_eggs;

-- 清空 pets 表旧数据
TRUNCATE TABLE pets;

-- 重新开启外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 完成！数据库应只剩：users, pet_species, pet_forms, pets
