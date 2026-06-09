var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/* CADASTRAR CATEGORIAS */
router.post('/', verifyToken, isAdmin, async function(req, res) {
    try {
      const { nome } = req.body;
      console.log(nome);
      
      // Validação básica
      if (!nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório',
          errors: [{ field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' }]
        });
      }
      
      // Verificar se a categoria já existe
      const existingUser = await pool.query('SELECT id FROM categoria WHERE nome = $1', [nome]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Categoria já existe',
          errors: [{ field: 'nome', message: 'Categoria já existe', code: 'CONFLICT' }]
        });
      }

      const result = await pool.query(
        'INSERT INTO categoria (nome) VALUES ($1) RETURNING *',
        [nome]
      );

      return res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso',
        data: result.rows[0]
      });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    if (error.code === '23514') {
      return res.status(400).json({ success: false, message: 'Dados inválidos. Verifique o campo e tente novamente.' });
    }
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/* LISTAR E FILTRAR CATEGORIAS */
router.get('/', verifyToken, async function(req, res) {
  try {
    const { search } = req.query;
    let result;

    if (search) {
      result = await pool.query(
        'SELECT id, nome FROM categoria WHERE nome ILIKE $1 ORDER BY id',
        [`%${search}%`]
      );
    } else {
      result = await pool.query('SELECT id, nome FROM categoria ORDER BY id');
    }

    return res.status(200).json({
      success: true,
      message: null,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      errors: []
    });
  }
});


/* BUSCAR CATEGORIA POR ID */
router.get('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM categoria WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
        errors: [{ field: 'id', message: 'Categoria não existe', code: 'NOT_FOUND' }]
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Categoria encontrada',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/* ATUALIZAR CATEGORIA POR ID */
router.put('/:id', verifyToken, isAdmin, async function(req, res) {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório',
        errors: [{ field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' }]
      });
    }

    const categoryExists = await pool.query('SELECT id FROM categoria WHERE id = $1', [id]);
    if (categoryExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
        errors: [{ field: 'id', message: 'Categoria não existe', code: 'NOT_FOUND' }]
      });
    }

    const duplicateCheck = await pool.query('SELECT id FROM categoria WHERE nome = $1 AND id <> $2', [nome, id]);
    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Já existe outra categoria com este nome',
        errors: [{ field: 'nome', message: 'Nome de categoria já em uso', code: 'CONFLICT' }]
      });
    }

    const result = await pool.query(
      'UPDATE categoria SET nome = $1 WHERE id = $2 RETURNING *',
      [nome, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    if (error.code === '23514') {
      return res.status(400).json({ success: false, message: 'Dados inválidos. Verifique os campos e tente novamente.' });
    }
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router;
