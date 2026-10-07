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
  const client = await pool.connect(); 
  try {
    const id_usuario = req.user?.id;
    const { id_endereco, items } = req.body;

    if (!id_endereco || !items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 400, 'Endereço de entrega e itens do carrinho são obrigatórios.');
    }

    // Inicia a transação SQL
    await client.query('BEGIN');

    // Valida se o endereço existe e pertence ao utilizador
    const addressCheck = await client.query(
      'SELECT id FROM endereco WHERE id = \$1 AND id_usuario = \$2',
      [id_endereco, id_usuario]
    );
    if (addressCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 404, 'Endereço de entrega inválido ou não pertence a este utilizador.');
    }

    let valorTotalPedido = 0;
    const itensProcessados = [];

    // Validar estoques, coletar preços e preparar dados
    for (const item of items) {
      const { id_produto, quantidade } = item;

      if (!id_produto || !quantidade || quantidade <= 0) {
        await client.query('ROLLBACK');
        return sendError(res, 400, 'Quantidade ou ID do produto inválido.');
      }

      // Busca o produto e bloqueia a linha para evitar concorrência (FOR UPDATE)
      const productCheck = await client.query(
        'SELECT id, nome, preco, quantidade_disponivel FROM produto WHERE id = \$1 FOR UPDATE',
        [id_produto]
      );

      if (productCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return sendError(res, 404, `Produto com ID ${id_produto} não foi encontrado.`);
      }

      const produto = productCheck.rows[0];

      // Verifica estoque disponível
      if (produto.quantidade_disponivel < quantidade) {
        await client.query('ROLLBACK');
        return sendError(res, 400, `Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.quantidade_disponivel}`);
      }

      const precoUnitarioCentavos = Math.round(produto.preco * 100);
      const subtotalCentavos = precoUnitarioCentavos * quantidade;

      valorTotalPedido += subtotalCentavos;

      itensProcessados.push({
        id_produto,
        quantidade,
        preco_unitario: precoUnitarioCentavos,
        subtotal: subtotalCentavos
      });

      // Atualiza/Dar baixa no estoque do produto
      await client.query(
        'UPDATE produto SET quantidade_disponivel = quantidade_disponivel - \$1 WHERE id = \$2',
        [quantidade, id_produto]
      );
    }

    // Insere o Pedido principal
    const statusInicial = 'pendente';
    const pedidoResult = await client.query(
      'INSERT INTO pedido (status, valor, id_usuario, id_endereco) VALUES (\$1, \$2, \$3, \$4) RETURNING *',
      [statusInicial, valorTotalPedido, id_usuario, id_endereco]
    );
    const novoPedido = pedidoResult.rows[0];

    for (const item of itensProcessados) {
      await client.query(
        'INSERT INTO item_pedido (quantidade, preco_unitario, subtotal, id_pedido, id_produto) VALUES (\$1, \$2, \$3, \$4, \$5)',
        [item.quantidade, item.preco_unitario, item.subtotal, novoPedido.id, item.id_produto]
      );
    }

    await client.query('COMMIT');

    return sendSuccess(res, 201, 'Pedido realizado com sucesso!', { id_pedido: novoPedido.id });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro na transação de pedido:', error);
    return sendError(res, 500, 'Erro interno ao processar o pedido.');
  } finally {
    client.release();
  }
});

router.get('/', verifyToken, async function(req, res) {
  try {
    const id_usuario = req.user?.id;

    // Busca os pedidos trazendo os detalhes textuais condensados do endereço escolhido
    const result = await pool.query(
      `SELECT p.*, 
              e.rua as endereco_rua, e.numero as endereco_numero, e.cidade as endereco_cidade
       FROM pedido p
       JOIN endereco e ON p.id_endereco = e.id
       WHERE p.id_usuario = $1 
       ORDER BY p.data_pedido DESC`,
      [id_usuario]
    );

    return sendSuccess(res, 200, 'Histórico de pedidos carregado', result.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico de pedidos:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.get('/:id', verifyToken, async function(req, res) {
  try {
    const { id } = req.params;
    const id_usuario = req.user?.id;

    // Busca as informações do pedido
    const pedidoResult = await pool.query(
      `SELECT p.*, e.rua, e.numero, e.cidade, e.estado, e.CEP
       FROM pedido p
       JOIN endereco e ON p.id_endereco = e.id
       WHERE p.id = $1 AND p.id_usuario = $2`,
      [id, id_usuario]
    );

    if (pedidoResult.rows.length === 0) {
      return sendError(res, 404, 'Pedido não encontrado ou permissão negada.');
    }

    // Busca os itens comprados vinculando os dados do produto para exibição na UI
    const itensResult = await pool.query(
      `SELECT ip.*, prod.nome, prod.imagem 
       FROM item_pedido ip
       JOIN produto prod ON ip.id_produto = prod.id
       WHERE ip.id_pedido = $1`,
      [id]
    );

    const dadosCompletos = {
      ...pedidoResult.rows[0],
      items: itensResult.rows
    };

    return sendSuccess(res, 200, 'Detalhes do pedido carregados', dadosCompletos);
  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

module.exports = router;
