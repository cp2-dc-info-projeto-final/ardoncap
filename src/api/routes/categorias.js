var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middlewares/auth');

/*CADASTRAR CATEGORIAS*/
router.post('/', verifyToken, isAdmin, async function(req, res) {
    try {
      const { nome } = req.body;
      
      // Validação básica
      if (!nome ) {
        const errors = [];
        if (!nome) errors.push({ field: 'nome', message: 'Nome é obrigatório', code: 'REQUIRED' });

        return sendError(res, 400, 'Nome é obrigatórios', errors);
      }
      
      // Verificar se a categoria já existe
      const existingUser = await pool.query('SELECT id FROM categoria WHERE nome = $1', [login]);
      if (existingUser.rows.length > 0) {
        return sendError(res, 409, 'Categoria já existe', [
          { field: 'nome', message: 'Categoria já existe', code: 'CONFLICT' }
        ]);
      }

    return sendSuccess(res, 201, 'Categoria criada com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    // Verificar se é erro de constraint
    if (error.code === '23514') {
      return sendError(res, 400, 'Dados inválidos. Verifique o campo e tente novamente.');
    }
    return sendError(res, 500, 'Erro interno do servidor');
  }
});