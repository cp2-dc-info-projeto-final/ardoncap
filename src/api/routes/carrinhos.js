var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

/* CADASTRAR CARRINHO */
router.post('/', verifyToken, async function(req, res) {
    try {
      const { id_usuario } = req.user.id;
      
      // Validação básica
      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: 'Usuário é obrigatório',
          errors: [{ field: 'id_usuario', message: 'Usuário é obrigatório', code: 'REQUIRED' }]
        });
      }
      
      // Verificar se o carrinho já existe
      const existingUser = await pool.query('SELECT id FROM carrinho WHERE id_usuario = $1', [id_usuario]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Usuário já existe',
          errors: [{ field: 'nome', message: 'Usuário já existe', code: 'CONFLICT' }]
        });
      }

      const result = await pool.query(
        'INSERT INTO carrinho (id_usuario) VALUES ($1) RETURNING *',
        [id_usuario]
      );

      return res.status(201).json({
        success: true,
        message: 'Carrinho criado com sucesso',
        data: result.rows[0]
      });
  } catch (error) {
    console.error('Erro ao criar carrinho:', error);
    if (error.code === '23514') {
      return res.status(400).json({ success: false, message: 'Dados inválidos. Verifique o campo e tente novamente.' });
    }
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

/* CADASTRAR ITEM_CARRINHO */
router.post('/', verifyToken, async function(req, res) {
    try {
      const { quantidade } = req.body;
      const { preco_unitario } = req.body;
      const { id_carrinho } = req.body;
      const { id_produto } = req.body;
  
      // Validação básica
      if (!quantidade) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade é obrigatorio',
          errors: [{field: 'quantidade', message: 'Quantidade é obrigatória', code: 'REQUIRED' }]
        });
      }
  
      if (!preco_unitario) {
        return res.status(400).json({
          success: false,
          message: 'Preço unitário é obrigatoria',
          errors: [{field: 'preco_unitario', message: 'Preço unitário é obrigatório', code: 'REQUIRED' }]
        });
      }
  
      if (!id_carrinho) {
        return res.status(400).json({
          success: false,
          message: 'Carrinho é obrigatório',
          errors: [{field: 'id_carrinho', message: 'Carrinho é obrigatório', code: 'REQUIRED' }]
        });
      }

      if (!id_produto) {
        return res.status(400).json({
          success: false,
          message: 'Produto é obrigatório',
          errors: [{field: 'id_produto', message: 'Produto é obrigatório', code: 'REQUIRED' }]
        });
      }
  
      // Verificar se carrinho existe 
      const carrinhoExiste = await pool.query('SELECT id FROM carrinho WHERE id = $1', [id_carrinho]);
      if (carrinhoExiste.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Carrinho não encontrado',
          errors: [{field: 'id_carrinho', message: 'Carrinho não existe', code: 'NOT_FOUND' }]
        });
      }
  
      const result = await pool.query(
        `INSERT INTO item_carrinho (quantidade, preco_unitario, id_carrinho, id_produto)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [quantidade, preco_unitario, id_carrinho, id_produto]
      );
  
      return sendSuccess(res, 201, 'Item criado com sucesso', result.rows[0]);
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
          message: 'Carrinho ou produto informado não existe.'
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
    const { search, id_carrinho } = req.query;
    let result;
 
    if (id_carrinho) {
      result = await pool.query(
        `SELECT * 
        FROM item_carrinho i 
        WHERE id_carrinho = $1
        ORDER BY id `,
        [id_carrinho]
      );
    } else {
      result = await pool.query(
        `SELECT *
        FROM item_carrinho
        ORDER BY id`
      );
    }
 
    return res.status(200).json({
      success: true,
      message: null,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      errors: []
    });
  }
});