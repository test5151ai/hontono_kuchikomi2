const { Category } = require('../models');

async function checkCategories() {
    try {
        const categories = await Category.findAll();
        console.log('データベース内のカテゴリー:', JSON.stringify(categories, null, 2));
    } catch (error) {
        console.error('エラー:', error);
    } finally {
        process.exit();
    }
}

checkCategories(); 