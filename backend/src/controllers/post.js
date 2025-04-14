const { Post } = require('../models');
const createResponse = require('../utils/response');

const postController = {
    // 投稿を更新する
    updatePost: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;

            const post = await Post.findByPk(id);
            if (!post) {
                return res.status(404).json(createResponse.error('投稿が見つかりません'));
            }

            await post.update({
                content,
                updatedAt: new Date()
            });

            res.json(createResponse.success(post));
        } catch (error) {
            console.error('投稿の更新中にエラーが発生しました:', error);
            res.status(500).json(createResponse.error('投稿の更新中にエラーが発生しました'));
        }
    },

    // 投稿を削除する
    deletePost: async (req, res) => {
        try {
            const { id } = req.params;

            const post = await Post.findByPk(id);
            if (!post) {
                return res.status(404).json(createResponse.error('投稿が見つかりません'));
            }

            await post.destroy();

            res.json(createResponse.success({ message: '投稿を削除しました' }));
        } catch (error) {
            console.error('投稿の削除中にエラーが発生しました:', error);
            res.status(500).json(createResponse.error('投稿の削除中にエラーが発生しました'));
        }
    }
};

module.exports = postController; 