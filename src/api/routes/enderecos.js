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

router.post('/', verifyToken, async function(req, res) {
    try {
      const { cep, rua, numero, cidade, estado, complemento } = req.body;
      const id_usuario = req.user?.id; // Capturado automaticamente pelo middleware verifyToken

      // Validação básica de campos obrigatórios
      if (!cep || !rua || !numero || !cidade || !estado) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos obrigatórios devem ser preenchidos.',
          errors: [{ field: 'geral', message: 'Campos obrigatórios em falta', code: 'REQUIRED' }]
        });
      }

      const result = await pool.query(
        'INSERT INTO endereco (CEP, rua, numero, cidade, estado, complemento, id_usuario) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [cep, rua, numero, cidade, estado, complemento || null, id_usuario]
      );

      return sendSuccess(res, 201, 'Endereço cadastrado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar endereço:', error);
    if (error.code === '23514') {
      return res.status(400).json({ success: false, message: 'Dados inválidos. Verifique os campos e tente novamente.' });
    }
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.get('/', verifyToken, async function(req, res) {
  try {
    const id_usuario = req.user?.id;

    const result = await pool.query(
      'SELECT id, CEP, rua, numero, cidade, estado, complemento FROM endereco WHERE id_usuario = $1 ORDER BY id DESC',
      [id_usuario]
    );

    return sendSuccess(res, 200, 'Endereços listados com sucesso', result.rows);
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.get('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
    const id_usuario = req.user?.id;

    if (id === 'undefined' || !id) {
      return sendError(res, 400, 'ID inválido fornecido');
    }

    const result = await pool.query('SELECT * FROM endereco WHERE id = $1 AND id_usuario = $2', [id, id_usuario]);
    
    if (result.rows.length === 0) {
      return sendError(res, 404, 'Endereço não encontrado', [
        { field: 'id', message: 'Endereço não existe ou permissão negada', code: 'NOT_FOUND' }
      ]);
    }

    return sendSuccess(res, 200, 'Endereço encontrado', result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.put('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
    const id_usuario = req.user?.id;
    const { cep, rua, numero, cidade, estado, complemento } = req.body;

    if (!cep || !rua || !numero || !cidade || !estado) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos.',
        errors: [{ field: 'geral', message: 'Campos obrigatórios em falta', code: 'REQUIRED' }]
      });
    }

    const addressExists = await pool.query('SELECT id FROM endereco WHERE id = $1 AND id_usuario = $2', [id, id_usuario]);
    if (addressExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Endereço não encontrado',
        errors: [{ field: 'id', message: 'Endereço não existe ou permissão negada', code: 'NOT_FOUND' }]
      });
    }

    const result = await pool.query(
      'UPDATE endereco SET CEP = $1, rua = $2, numero = $3, cidade = $4, estado = $5, complemento = $6 WHERE id = $7 AND id_usuario = $8 RETURNING *',
      [cep, rua, numero, cidade, estado, complemento || null, id, id_usuario]
    );

    return sendSuccess(res, 200, 'Endereço atualizado com sucesso', result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    if (error.code === '23514') {
      return res.status(400).json({ success: false, message: 'Dados inválidos. Verifique os campos e tente novamente.' });
    }
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.delete('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
    const id_usuario = req.user?.id;
    
    const addressExists = await pool.query('SELECT id FROM endereco WHERE id = $1 AND id_usuario = $2', [id, id_usuario]);
    if (addressExists.rows.length === 0) {
      return sendError(res, 404, 'Endereço não encontrado');
    }
    
    await pool.query('DELETE FROM endereco WHERE id = $1 AND id_usuario = $2', [id, id_usuario]);
    
    return sendSuccess(res, 200, 'Endereço deletado com sucesso');
  } catch (error) {
    console.error('Erro ao deletar endereço:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

module.exports = router;