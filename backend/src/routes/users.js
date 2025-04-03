const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');

// ユーザー情報を取得
router.get('/me', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                nickname: true,
                email: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'ユーザーが見つかりません' });
        }

        res.json(user);
    } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

// ユーザーの投稿履歴を取得
router.get('/me/posts', auth, async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json(posts);
    } catch (error) {
        console.error('投稿履歴取得エラー:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
});

module.exports = router; 