var express = require('express');
var router = express.Router();
const pool = require('../db/config');
const { verifyToken } = require('../middlewares/auth');

const TRANSICOES_STATUS = {
  pendente:  ['enviado', 'cancelado'],
  enviado:   ['entregue'],
  entregue:  [],
  cancelado: []
};

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
        `INSERT INTO item_pedido
         (quantidade, preco_unitario, status, subtotal, id_pedido, id_produto)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          item.quantidade,
          item.preco_unitario,
          'pendente',
          item.subtotal,
          novoPedido.id,
          item.id_produto
        ]
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

router.get('/vendedor', verifyToken, async function(req, res) {
  try {
    const id_vendedor = req.user?.id;

    const result = await pool.query(
      `SELECT
          p.id AS id_pedido,
          p.data_pedido,
          p.status AS status_pedido,
          p.valor,
          p.id_usuario AS id_comprador,

          u.login AS comprador,

          e.rua,
          e.numero,
          e.cidade,
          e.estado,
          e."CEP" AS cep,
          e.complemento,

          ip.id AS id_item,
          ip.quantidade,
          ip.preco_unitario,
          ip.subtotal,
          ip.status AS status_item,

          prod.id AS id_produto,
          prod.nome AS nome_produto,
          prod.imagem AS imagem_produto

       FROM pedido p
       JOIN item_pedido ip ON ip.id_pedido = p.id
       JOIN produto prod ON prod.id = ip.id_produto
       JOIN usuario u ON u.id = p.id_usuario
       JOIN endereco e ON e.id = p.id_endereco

       WHERE prod.id_usuario = $1

       ORDER BY p.data_pedido DESC`,
      [id_vendedor]
    );

    return sendSuccess(
      res,
      200,
      'Pedidos do vendedor carregados',
      result.rows
    );

  } catch (error) {
    console.error('Erro ao buscar pedidos do vendedor:', error);
    return sendError(res, 500, 'Erro interno do servidor');
  }
});

router.put('/vendedor/item/:id', verifyToken, async function(req, res) {
  const id_item = Number(req.params.id);
  const id_vendedor = req.user?.id;
  const { status } = req.body;

  if (!Number.isInteger(id_item) || id_item <= 0) {
    return sendError(res, 400, 'ID do item inválido.');
  }

  if (typeof status !== 'string' || !(status in TRANSICOES_STATUS)) {
    return sendError(res, 400, 'Status inválido.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Busca o item e verifica quem é o vendedor
    const itemResult = await client.query(
      `SELECT
          ip.id,
          ip.status,
          ip.quantidade,
          ip.id_produto,
          ip.id_pedido,
          prod.id_usuario AS id_vendedor

       FROM item_pedido ip
       JOIN produto prod ON prod.id = ip.id_produto

       WHERE ip.id = $1

       FOR UPDATE OF ip, prod`,
      [id_item]
    );

    if (itemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 404, 'Item não encontrado.');
    }

    const item = itemResult.rows[0];

    // Verifica se o produto pertence ao vendedor autenticado
    if (String(item.id_vendedor) !== String(id_vendedor)) {
      await client.query('ROLLBACK');
      return sendError(res, 403, 'Você não pode alterar este item.');
    }

    // Verifica se a transição é permitida
    if (!TRANSICOES_STATUS[item.status].includes(status)) {
      await client.query('ROLLBACK');
      return sendError(
        res,
        409,
        `Não é possível mudar de "${item.status}" para "${status}".`
      );
    }

    // Se cancelar, devolve somente a quantidade deste item ao estoque
    if (status === 'cancelado') {
      await client.query(
        `UPDATE produto
         SET quantidade_disponivel = quantidade_disponivel + $1
         WHERE id = $2`,
        [item.quantidade, item.id_produto]
      );
    }

    // Atualiza somente o item solicitado
    await client.query(
      `UPDATE item_pedido
       SET status = $1
       WHERE id = $2`,
      [status, id_item]
    );

    // Busca os status de todos os itens do pedido
    const statusResult = await client.query(
      `SELECT status
       FROM item_pedido
       WHERE id_pedido = $1`,
      [item.id_pedido]
    );

    const statusItens = statusResult.rows.map(item => item.status);

    // Se todos forem iguais, o pedido recebe esse status.
    // Caso contrário, permanece pendente.
    const todosIguais = statusItens.every(
      statusItem => statusItem === statusItens[0]
    );

    const novoStatusPedido = todosIguais
      ? statusItens[0]
      : 'pendente';

    await client.query(
      `UPDATE pedido
       SET status = $1
       WHERE id = $2`,
      [novoStatusPedido, item.id_pedido]
    );

    await client.query('COMMIT');

    return sendSuccess(res, 200, 'Item atualizado com sucesso!', {
      id_item,
      status_item: status,
      id_pedido: item.id_pedido,
      status_pedido: novoStatusPedido
    });

  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      console.error('Falha no rollback:', e);
    }

    console.error('Erro ao atualizar item:', error);
    return sendError(res, 500, 'Erro interno ao atualizar o item.');

  } finally {
    client.release();
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

    // Busca os itens e seus respectivos produtos
    const itensResult = await pool.query(
      `SELECT
          ip.*,
          json_build_object(
              'id', prod.id,
              'nome', prod.nome,
              'imagem', prod.imagem,
              'descricao', prod.descricao,
              'preco', prod.preco,
              'categoria_nome', c.nome
          ) AS produto
      FROM item_pedido ip
      JOIN produto prod ON ip.id_produto = prod.id
      JOIN categoria c ON prod.id_categoria = c.id
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


router.put('/:id', verifyToken, async function(req, res) {
  const id_pedido = Number(req.params.id);
  const id_usuario = req.user?.id;

  if (!Number.isInteger(id_pedido) || id_pedido <= 0) {
    return sendError(res, 400, 'ID de pedido inválido.');
  }

  const { id_endereco } = req.body;

  if (id_endereco === undefined) {
    return sendError(res, 400, 'Informe o novo endereço.');
  }

  if (!Number.isInteger(id_endereco) || id_endereco <= 0) {
    return sendError(res, 400, 'ID de endereço inválido.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Busca e trava o pedido
    const pedidoResult = await client.query(
      `SELECT id, status, id_usuario, id_endereco
       FROM pedido
       WHERE id = $1 AND id_usuario = $2
       FOR UPDATE`,
      [id_pedido, id_usuario]
    );

    if (pedidoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(res, 404, 'Pedido não encontrado.');
    }

    const pedido = pedidoResult.rows[0];

    // Só permite alterar o endereço enquanto pendente
    if (pedido.status !== 'pendente') {
      await client.query('ROLLBACK');
      return sendError(
        res,
        409,
        'O endereço só pode ser alterado enquanto o pedido está pendente.'
      );
    }

    // Verifica se o endereço pertence ao comprador
    const addressCheck = await client.query(
      `SELECT id
       FROM endereco
       WHERE id = $1 AND id_usuario = $2`,
      [id_endereco, id_usuario]
    );

    if (addressCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return sendError(
        res,
        404,
        'Endereço inválido ou não pertence a este usuário.'
      );
    }

    const updated = await client.query(
      `UPDATE pedido
       SET id_endereco = $1
       WHERE id = $2
       RETURNING *`,
      [id_endereco, id_pedido]
    );

    await client.query('COMMIT');

    return sendSuccess(
      res,
      200,
      'Endereço do pedido atualizado com sucesso!',
      updated.rows[0]
    );

  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      console.error('Falha no rollback:', e);
    }

    console.error('Erro ao atualizar endereço do pedido:', error);
    return sendError(res, 500, 'Erro interno ao atualizar o pedido.');

  } finally {
    client.release();
  }
});

module.exports = router;
