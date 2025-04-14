const { Thread, Comment, User, Post } = require('../models');
const createResponse = require('../utils/response');
const { Op } = require('sequelize');
const db = require('../config/database');

const threadController = {
    // スレッド一覧を取得
    getThreads: async (req, res) => {
        try {
            const threads = await Thread.findAll({
                include: [{
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username']
                }],
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                threads
            });
        } catch (error) {
            console.error('Get threads error:', error);
            res.status(500).json({
                success: false,
                message: 'スレッド一覧の取得中にエラーが発生しました'
            });
        }
    },

    // 人気スレッド一覧を取得
    getPopularThreads: async (req, res) => {
        try {
            const threads = await Thread.findAll({
                include: [{
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username']
                }, {
                    model: Comment,
                    attributes: ['id']
                }],
                order: [
                    [Comment, 'createdAt', 'DESC']
                ],
                group: ['Thread.id', 'User.id'],
                limit: 10
            });

            res.json(createResponse.success(threads));
        } catch (error) {
            console.error('Get popular threads error:', error);
            res.status(500).json(createResponse.error('人気スレッド一覧の取得中にエラーが発生しました'));
        }
    },

    // スレッドを作成
    createThread: async (req, res) => {
        try {
            // 管理者権限チェック
            if (!req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'スレッドの作成は管理者のみが行えます'
                });
            }

            const { title, categoryId } = req.body;

            // 必須フィールドのバリデーション
            if (!title || !categoryId) {
                return res.status(400).json({
                    success: false,
                    message: 'タイトルとカテゴリーは必須です'
                });
            }

            const thread = await Thread.create({
                title,
                categoryId,
                authorId: req.user.id
            });

            return res.status(201).json({
                success: true,
                thread
            });
        } catch (error) {
            console.error('Create thread error:', error);
            return res.status(500).json({
                success: false,
                message: 'スレッドの作成中にエラーが発生しました'
            });
        }
    },

    // スレッド詳細を取得
    getThread: async (req, res) => {
        try {
            const { id } = req.params;
            const thread = await Thread.findByPk(id, {
                include: [
                    {
                        model: Post,
                        as: 'posts',
                        include: [{
                            model: User,
                            as: 'author',
                            attributes: ['username']
                        }]
                    },
                    {
                        model: User,
                        as: 'author',
                        attributes: ['username']
                    }
                ]
            });

            if (!thread) {
                return res.status(404).json({
                    success: false,
                    message: 'スレッドが見つかりませんでした'
                });
            }

            res.json({
                success: true,
                thread
            });
        } catch (error) {
            console.error('スレッド取得エラー:', error);
            res.status(500).json({
                success: false,
                message: 'スレッドの取得中にエラーが発生しました'
            });
        }
    },

    // スレッドを更新
    updateThread: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content } = req.body;
            const userId = req.user.id;

            const thread = await Thread.findByPk(id);

            if (!thread) {
                return res.status(404).json(createResponse.error('スレッドが見つかりません'));
            }

            if (thread.userId !== userId) {
                return res.status(403).json(createResponse.error('このスレッドを編集する権限がありません'));
            }

            await thread.update({ title, content });

            res.json(createResponse.success(thread));
        } catch (error) {
            console.error('Update thread error:', error);
            res.status(500).json(createResponse.error('スレッドの更新中にエラーが発生しました'));
        }
    },

    // スレッドを削除
    deleteThread: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const thread = await Thread.findByPk(id);

            if (!thread) {
                return res.status(404).json(createResponse.error('スレッドが見つかりません'));
            }

            if (thread.userId !== userId) {
                return res.status(403).json(createResponse.error('このスレッドを削除する権限がありません'));
            }

            await thread.destroy();

            res.json(createResponse.success({ message: 'スレッドを削除しました' }));
        } catch (error) {
            console.error('Delete thread error:', error);
            res.status(500).json(createResponse.error('スレッドの削除中にエラーが発生しました'));
        }
    },

    // コメントを作成
    createComment: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user.id;

            const thread = await Thread.findByPk(id);

            if (!thread) {
                return res.status(404).json(createResponse.error('スレッドが見つかりません'));
            }

            const comment = await Comment.create({
                content,
                userId,
                threadId: id
            });

            res.status(201).json(createResponse.success(comment));
        } catch (error) {
            console.error('Create comment error:', error);
            res.status(500).json(createResponse.error('コメントの作成中にエラーが発生しました'));
        }
    },

    // コメント一覧を取得
    getComments: async (req, res) => {
        try {
            const { id } = req.params;

            const comments = await Comment.findAll({
                where: { threadId: id },
                include: [{
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username']
                }],
                order: [['createdAt', 'ASC']]
            });

            res.json(createResponse.success(comments));
        } catch (error) {
            console.error('Get comments error:', error);
            res.status(500).json(createResponse.error('コメント一覧の取得中にエラーが発生しました'));
        }
    },

    // スレッドの投稿一覧を取得
    getThreadPosts: async (req, res) => {
        try {
            const threadId = req.params.id;
            const posts = await db.query(`
                SELECT 
                    p.*,
                    u.username,
                    u.avatar_url
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.thread_id = $1
                ORDER BY p.created_at DESC
            `, [threadId]);

            if (posts.rows.length === 0) {
                return res.status(404).json({ message: 'このスレッドには投稿がありません。' });
            }

            res.json(posts.rows);
        } catch (error) {
            console.error('投稿一覧の取得中にエラーが発生しました:', error);
            res.status(500).json({ message: '投稿一覧の取得中にエラーが発生しました。' });
        }
    },

    // 投稿を作成
    createPost: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;

            // ユーザーの承認状態をチェック
            if (!req.user.isApproved) {
                return res.status(403).json({
                    success: false,
                    message: '承認されたユーザーのみが投稿できます'
                });
            }

            // スレッドの存在確認
            const thread = await Thread.findByPk(id);
            if (!thread) {
                return res.status(404).json({
                    success: false,
                    message: 'スレッドが見つかりません'
                });
            }

            // 投稿番号を取得
            const postCount = await Post.count({ where: { thread_id: id } });
            const postNumber = postCount + 1;

            // 投稿を作成
            const post = await Post.create({
                content,
                thread_id: id,
                user_id: req.user.id,
                post_number: postNumber
            });

            return res.status(201).json({
                success: true,
                post
            });
        } catch (error) {
            console.error('Create post error:', error);
            return res.status(500).json({
                success: false,
                message: '投稿の作成中にエラーが発生しました'
            });
        }
    },

    // 店舗情報を更新する
    updateShopDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const { shopName, address, phoneNumber, businessHours, regularHoliday } = req.body;

            const thread = await Thread.findByPk(id);
            if (!thread) {
                return res.status(404).json(createResponse.error('スレッドが見つかりません'));
            }

            await thread.update({
                shopName,
                address,
                phoneNumber,
                businessHours,
                regularHoliday,
                updatedAt: new Date()
            });

            res.json(createResponse.success(thread));
        } catch (error) {
            console.error('店舗情報の更新中にエラーが発生しました:', error);
            res.status(500).json(createResponse.error('店舗情報の更新中にエラーが発生しました'));
        }
    }
};

module.exports = threadController; 