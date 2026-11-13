var express = require('express');
var router = express.Router();

const pool = require('../db/config');
const { verifyToken } = require('../middlewares/auth');

function sendSuccess(res, status, message, data) {
    const payload = { success: true };
    if (message) payload.message = message;
    if (typeof data !== 'undefined') payload.data = data;
    return res.status(status).json(payload);
}

function sendError(res, status, message, errors = []) {
    return res.status(status).json({
        success: false,
        message,
        errors
    });
}


/* LISTAR AVALIAÇÕES DE UM PRODUTO */
router.get('/produto/:id', async function(req, res) {
    try {
        const { id } = req.params;

        if (!id || !/^\d+$/.test(id)) {
            return sendError(res, 400, 'ID do produto inválido');
        }

        // Verifica se o produto existe
        const produtoExiste = await pool.query(
            'SELECT id FROM produto WHERE id = $1',
            [id]
        );

        if (produtoExiste.rows.length === 0) {
            return sendError(res, 404, 'Produto não encontrado');
        }

        // Busca avaliações
        const result = await pool.query(
            `SELECT
                a.id,
                a.nota,
                a.comentario,
                a.data_avaliacao,
                a.id_usuario,
                u.login AS usuario
             FROM avaliacao a
             INNER JOIN usuario u ON u.id = a.id_usuario
             WHERE a.id_produto = $1
             ORDER BY a.data_avaliacao DESC`,
            [id]
        );

        // Calcula média e quantidade
        const estatisticas = await pool.query(
            `SELECT
                COALESCE(ROUND(AVG(nota), 1), 0) AS media,
                COUNT(*) AS total
             FROM avaliacao
             WHERE id_produto = $1`,
            [id]
        );

        return sendSuccess(
            res,
            200,
            'Avaliações encontradas',
            {
                avaliacoes: result.rows,
                media: Number(estatisticas.rows[0].media),
                total: Number(estatisticas.rows[0].total)
            }
        );

    } catch (error) {
        console.error('Erro ao listar avaliações:', error);
        return sendError(res, 500, 'Erro interno do servidor');
    }
});

/* VERIFICAR SE O USUÁRIO PODE AVALIAR */
router.get('/produto/:id/permissao', verifyToken, async function(req, res) {
    try {
        const { id } = req.params;
        const id_usuario = req.user.id;

        const compra = await pool.query(
            `SELECT EXISTS (
                SELECT 1
                FROM pedido p
                INNER JOIN item_pedido ip ON ip.id_pedido = p.id
                WHERE p.id_usuario = $1
                  AND ip.id_produto = $2
                  AND LOWER(TRIM(ip.status)) = 'entregue'
            ) AS pode_avaliar`,
            [id_usuario, id]
        );

        const avaliacao = await pool.query(
            `SELECT id
             FROM avaliacao
             WHERE id_usuario = $1
               AND id_produto = $2`,
            [id_usuario, id]
        );

        return sendSuccess(res, 200, 'Permissão consultada', {
            pode_avaliar: compra.rows[0].pode_avaliar,
            ja_avaliou: avaliacao.rows.length > 0
        });

    } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        return sendError(res, 500, 'Erro interno do servidor');
    }
});

/* CADASTRAR AVALIAÇÃO */
router.post('/produto/:id', verifyToken, async function(req, res) {
    try {
        const { id } = req.params;
        const { nota, comentario } = req.body;

        // ID obtido exclusivamente do token
        const id_usuario = req.user.id;

        if (!id || !/^\d+$/.test(id)) {
            return sendError(res, 400, 'ID do produto inválido');
        }

        // Valida nota
        if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
            return sendError(res, 400, 'A nota deve ser um número inteiro entre 1 e 5', [
                {
                    field: 'nota',
                    message: 'Informe uma nota entre 1 e 5',
                    code: 'INVALID_VALUE'
                }
            ]);
        }

        // Valida comentário
        if (
            comentario !== undefined &&
            comentario !== null &&
            typeof comentario !== 'string'
        ) {
            return sendError(res, 400, 'Comentário inválido');
        }

        // Verifica se o produto existe
        const produtoExiste = await pool.query(
            'SELECT id FROM produto WHERE id = $1',
            [id]
        );

        if (produtoExiste.rows.length === 0) {
            return sendError(res, 404, 'Produto não encontrado');
        }

        // Verifica se o usuário recebeu o produto
        const compra = await pool.query(
            `SELECT ip.id
             FROM pedido p
             INNER JOIN item_pedido ip
                ON ip.id_pedido = p.id
             WHERE p.id_usuario = $1
               AND ip.id_produto = $2
               AND LOWER(TRIM(ip.status)) = 'entregue'
             LIMIT 1`,
            [id_usuario, id]
        );

        if (compra.rows.length === 0) {
            return sendError(
                res,
                403,
                'Você precisa ter recebido este produto para avaliá-lo',
                [{
                    field: 'compra',
                    message: 'Produto sem compra concluída pelo usuário',
                    code: 'PURCHASE_REQUIRED'
                }]
            );
        }

        // Verifica se já avaliou
        const avaliacaoExiste = await pool.query(
            `SELECT id
             FROM avaliacao
             WHERE id_usuario = $1
               AND id_produto = $2`,
            [id_usuario, id]
        );

        if (avaliacaoExiste.rows.length > 0) {
            return sendError(res, 409, 'Você já avaliou este produto');
        }

        // Cadastra avaliação
        const result = await pool.query(
            `INSERT INTO avaliacao
                (nota, comentario, id_usuario, id_produto)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                nota,
                comentario?.trim() || null,
                id_usuario,
                id
            ]
        );

        return sendSuccess(
            res,
            201,
            'Avaliação cadastrada com sucesso',
            result.rows[0]
        );

    } catch (error) {
        console.error('Erro ao cadastrar avaliação:', error);

        if (error.code === '23505') {
            return sendError(res, 409, 'Você já avaliou este produto');
        }

        return sendError(res, 500, 'Erro interno do servidor');
    }
});


/* CONSULTAR MINHA AVALIAÇÃO */
router.get('/produto/:id/minha', verifyToken, async function(req, res) {
    try {
        const { id } = req.params;
        const id_usuario = req.user.id;

        const result = await pool.query(
            `SELECT *
             FROM avaliacao
             WHERE id_produto = $1
               AND id_usuario = $2`,
            [id, id_usuario]
        );

        if (result.rows.length === 0) {
            return sendSuccess(
                res,
                200,
                'Você ainda não avaliou este produto',
                null
            );
        }

        return sendSuccess(
            res,
            200,
            'Sua avaliação encontrada',
            result.rows[0]
        );

    } catch (error) {
        console.error('Erro ao consultar avaliação:', error);
        return sendError(res, 500, 'Erro interno do servidor');
    }
});


/* EDITAR MINHA AVALIAÇÃO */
router.put('/:id', verifyToken, async function(req, res) {
    try {
        const { id } = req.params;
        const { nota, comentario } = req.body;
        const id_usuario = req.user.id;

        if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
            return sendError(res, 400, 'A nota deve ser um número inteiro entre 1 e 5');
        }

        if (
            comentario !== undefined &&
            comentario !== null &&
            typeof comentario !== 'string'
        ) {
            return sendError(res, 400, 'Comentário inválido');
        }

        const result = await pool.query(
            `UPDATE avaliacao
             SET nota = $1,
                 comentario = $2,
                 data_avaliacao = CURRENT_TIMESTAMP
             WHERE id = $3
               AND id_usuario = $4
             RETURNING *`,
            [
                nota,
                comentario?.trim() || null,
                id,
                id_usuario
            ]
        );

        if (result.rows.length === 0) {
            return sendError(
                res,
                404,
                'Avaliação não encontrada ou você não tem permissão para editá-la'
            );
        }

        return sendSuccess(
            res,
            200,
            'Avaliação atualizada com sucesso',
            result.rows[0]
        );

    } catch (error) {
        console.error('Erro ao editar avaliação:', error);
        return sendError(res, 500, 'Erro interno do servidor');
    }
});


/* EXCLUIR AVALIAÇÃO */
router.delete('/:id', verifyToken, async function(req, res) {
    try {
        const { id } = req.params;
        const usuarioId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        const result = await pool.query(
            `DELETE FROM avaliacao
             WHERE id = $1
               AND (id_usuario = $2 OR $3 = true)
             RETURNING id`,
            [id, usuarioId, isAdmin]
        );

        if (result.rows.length === 0) {
            const existe = await pool.query(
                'SELECT id FROM avaliacao WHERE id = $1',
                [id]
            );

            if (existe.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Avaliação não encontrada'
                });
            }

            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para excluir esta avaliação'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Avaliação excluída com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir avaliação:', error);

        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router;
