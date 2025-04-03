const { Category } = require('../models');

async function checkCategories() {
    try {
        const categories = await Category.findAll();
        console.log('カテゴリー一覧:');
        console.log(JSON.stringify(categories, null, 2));
    } catch (error) {
        console.error('エラー:', error);
    } finally {
        process.exit();
    }
}

checkCategories(); 