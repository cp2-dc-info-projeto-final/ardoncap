var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const { verifyToken, isAdmin } = require('../middlewares/auth');

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

/* CADASTRAR PRODUTOS */
router.post('/', verifyToken, async function(req, res) {
  try {
    const { nome } = req.body;
    const { descricao } = req.body;
    const { quantidade_disponivel } = req.body;
    const { preco } = req.body;
    const { id_categoria } = req.body;
    const id_usuario = req.user.id;

    // Validação básica
    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatorio',
        errors: [{field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' }]
      });
    }

    if (!descricao) {
      return res.status(400).json({
        success: false,
        message: 'Descrição é obrigatoria',
        errors: [{field: 'descricao', message: 'Descrição é obrigatória', code: 'REQUIRED' }]
      });
    }

    if (typeof quantidade_disponivel !== 'number' || quantidade_disponivel <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantidade disponível é obrigatória',
        errors: [{field: 'quantidade_disponivel', message: 'Quantidade disponível deve ser um número maior que zero', code: 'REQUIRED' }]
      });
    }

    if (typeof preco !== 'number' || preco < 0) {
      return res.status(400).json({
        success: false,
        message: 'Preço é obrigatório',
        errors: [{field: 'preco', message: 'Preço deve ser um número maior ou igual a zero', code: 'REQUIRED' }]
      });
    }

    if (!id_categoria) {
      return res.status(400).json({
        success: false,
        message: 'Categoria é obrigatória',
        errors: [{field: 'id_categoria', message: 'Categoria é obrigatória', code: 'REQUIRED' }]
      });
    }

    // Verificar se a categoria existe 
    const categoriaExiste = await pool.query('SELECT id FROM categoria WHERE id = $1', [id_categoria]);
    if (categoriaExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
        errors: [{field: 'id_categoria', message: 'Categoria não existe', code: 'NOT_FOUND' }]
      });
    }

    const result = await pool.query(
      `INSERT INTO produto (nome, descricao, quantidade_disponivel, preco, id_categoria, id_usuario)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nome, descricao, quantidade_disponivel, preco, id_categoria, id_usuario]
    );

    return sendSuccess(res, 201, 'Produto criado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Verifique os campos e tente novamente.'
      });
    }
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Categoria ou usuário informado não existe.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/* LISTAR E FILTRAR PRODUTOS */
router.get('/', verifyToken, async function(req, res) {
  try {
    const { search, id_categoria } = req.query;
    let result;
 
    if (search && id_categoria) {
      result = await pool.query(
        `SELECT p*, c.nome as categoria_nome 
        FROM produto p 
        INNER JOIN categoria c ON p.id_categoria = c.id
        WHERE p.nome ILIKE $1 AND p.id_categoria = $2 
        ORDER BY p.id `,
        [`%${search}%`, id_categoria]
      );
    } else if (search) {
      result = await pool.query(
        `SELECT p*, c.nome as categoria_nome 
        FROM produto p 
        INNER JOIN categoria c ON p.id_categoria = c.id
        WHERE p.nome ILIKE = $1
        ORDER BY p.id `,
        [`%${search}%`]
      );
    } else if (id_categoria) {
      result = await pool.query(
        `SELECT p*, c.nome as categoria_nome 
        FROM produto p 
        INNER JOIN categoria c ON p.id_categoria = c.id
        WHERE p.id_categoria = $1
        ORDER BY p.id `,
        [id_categoria]
      );
    } else {
      result = await pool.query('SELECT * FROM produto ORDER BY id'
        `SELECT p*, c.nome as categoria_nome 
        FROM produto p 
        INNER JOIN categoria c ON p.id_categoria = c.id
        ORDER BY p.id `,
      );
    }
 
    return res.status(200).json({
      success: true,
      message: null,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      errors: []
    });
  }
});

/* BUSCAR PRODUTO POR ID */
router.get('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;

    if (id === 'undefined' || !id) {
      return sendError(res, 400, 'ID inválido fornecido');
    }

    const result = await pool.query(
      `SELECT p*, c.nome AS categoria_nome 
        FROM produto p 
        INNER JOIN categoria c ON p.id_categoria = c.id
        WHERE p.id = $1,`
        [id]
        );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Produto não encontrado', [
        { field: 'id', message: 'Produto não existe', code: 'NOT_FOUND' }
      ]);
    }

    return sendSuccess(res, 200, 'Produto encontrado', result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

/* ATUALIZAR PRODUTO POR ID */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    const { descricao } = req.body;
    const { quantidade_disponivel } = req.body;
    const { preco } = req.body;
    const { id_categoria } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatorio',
        errors: [{field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' }]
      });
    }

    if (!descricao) {
      return res.status(400).json({
        success: false,
        message: 'Descrição é obrigatoria',
        errors: [{field: 'descricao', message: 'Descrição é obrigatória', code: 'REQUIRED' }]
      });
    }

    if (typeof quantidade_disponivel !== 'number' || quantidade_disponivel <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantidade disponível é obrigatória',
        errors: [{field: 'quantidade_disponivel', message: 'Quantidade disponível deve ser um número maior que zero', code: 'REQUIRED' }]
      });
    }

    if (typeof preco !== 'number' || preco < 0) {
      return res.status(400).json({
        success: false,
        message: 'Preço é obrigatório',
        errors: [{field: 'preco', message: 'Preço deve ser um número maior ou igual a zero', code: 'REQUIRED' }]
      });
    }

    if (!id_categoria) {
      return res.status(400).json({
        success: false,
        message: 'Categoria é obrigatória',
        errors: [{field: 'id_categoria', message: 'Categoria é obrigatória', code: 'REQUIRED' }]
      });
    }

    const produtoExiste = await pool.query('SELECT id FROM produto WHERE id = $1', [id]);
    if (produtoExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
        errors: [{ field: 'id', message: 'Produto não existe', code: 'NOT_FOUND' }]
      });
    }

    const categoriaExiste = await pool.query('SELECT id FROM categoria WHERE id = $1', [id_categoria]);
    if (categoriaExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
        errors: [{field: 'id_categoria', message: 'Categoria não existe', code: 'NOT_FOUND' }]
      });
    }

    const result = await pool.query(
      `UPDATE produto SET nome = $1, descricao = $2, quantidade_disponivel = $3, preco = $4, id_categoria = $5 WHERE id = $6 RETURNING *`,
      [nome, descricao, quantidade_disponivel, preco, id_categoria, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos. Verifique os campos e tente novamente.',
        errors: [{ field: 'dados', message: 'Dados inválidos', code: 'INVALID_DATA' }]
      });
    }
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Categoria informada não existe.',
        errors: [{ field: 'id_categoria', message: 'Categoria não existe', code: 'NOT_FOUND' }]
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      errors: [{ field: 'servidor', message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' }]
    });
  }
});

/* EXCLUIR PRODUTO POR ID */
router.delete('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;

    const produtoExiste = await pool.query(
      'SELECT id FROM produto WHERE id = $1', [id]);
    if (produtoExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
        errors: [{ field: 'id', message: 'Produto não existe', code: 'NOT_FOUND' }]
      });
    }

    await pool.query('DELETE FROM produto WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

module.exports = router;