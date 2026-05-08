# Caso de Uso 1: Buscar Produtos

## Ator:
Comprador

## Fluxo Principal:
O comprador seleciona a opção "Buscar".
O comprador digita o nome do produto que deseja.
O sistema exibe os produtos correspondentes.

## Fluxo Alternativo A: Campo vazio
O comprador seleciona a opção "Buscar".
O comprador não preenche o campo de pesquisa.
O sistema solicita o preenchimento do campo.

## Fluxo Alternativo B: Produto não encontrado
O comprador seleciona a opção "Buscar".
O comprador digita o nome do produto.
O sistema não encontra produtos correspondentes.
O sistema exibe uma mensagem de aviso.

## Fluxo Alternativo C: Estoque vazio
O comprador seleciona a opção "Buscar".
O comprador digita o nome do produto.
O sistema encontra o produto sem estoque disponível.
O sistema informa indisponibilidade do produto.



# Caso de Uso 2: Visualizar Produto

## Ator:
Comprador

## Fluxo Principal:
O comprador seleciona um produto.
O sistema exibe os detalhes do produto.
O comprador pode adicionar ao carrinho ou comprar.

## Fluxo Alternativo A: Produto não encontrado
O comprador seleciona um produto.
O sistema não localiza o produto.
O sistema exibe mensagem de aviso.

## Fluxo Alternativo B: Anúncio removido
O comprador seleciona um produto.
O sistema identifica que o anúncio foi removido.
O sistema informa indisponibilidade do anúncio.

## Fluxo Alternativo C: Produto indisponível
O comprador seleciona um produto.
O sistema exibe os detalhes do produto.
O sistema informa que o produto está indisponível para compra.



# Caso de Uso 3: Visualizar Categorias

## Ator:
Comprador

## Fluxo Principal:
O comprador acessa a opção de categorias.
O sistema exibe as categorias disponíveis.
O comprador seleciona uma das categorias.
O sistema mostra os produtos da categoria escolhida.

## Fluxo Alternativo A: Categoria vazia
O comprador acessa a opção de categorias.
O comprador seleciona uma categoria.
O sistema informa que não há produtos cadastrados na categoria.


# Caso de Uso 4: Gerenciar Carrinho

## Ator:
Comprador

## Fluxo Principal:
O comprador acessa o carrinho de compras.
O sistema exibe os produtos adicionados.
O comprador pode remover produtos do carrinho.
O comprador pode prosseguir para finalizar a compra.

## Fluxo Alternativo A: Carrinho vazio
O comprador acessa o carrinho de compras.
O sistema identifica que não há produtos adicionados.
O sistema informa que o carrinho está vazio.

## Fluxo Alternativo B: Produto indisponível
O comprador acessa o carrinho de compras.
O sistema identifica um produto indisponível.
O sistema informa a indisponibilidade do produto.

## Fluxo Alternativo C: Quantidade inválida
O comprador altera a quantidade de um produto.
O sistema identifica quantidade inválida.
O sistema solicita uma quantidade válida.



# Caso de Uso 5: Finalizar Compra

## Ator:
Comprador

## Fluxo Principal:
O comprador inicia a finalização da compra.
O sistema apresenta um resumo do pedido.
O comprador confirma a compra.
O sistema registra o pedido.

## Fluxo Alternativo A: Campo obrigatório vazio
O comprador inicia a finalização da compra.
O comprador não preenche um campo obrigatório.
O sistema solicita o preenchimento do campo.

## Fluxo Alternativo B: Campo obrigatório inválido
O comprador preenche um campo obrigatório incorretamente.
O sistema identifica dados inválidos.
O sistema solicita correção das informações.

## Fluxo Alternativo C: Produto fora de estoque
O comprador confirma a compra.
O sistema identifica indisponibilidade de estoque.
O sistema informa que o produto está fora de estoque.

## Fluxo Alternativo D: Pagamento recusado
O comprador confirma a compra.
O sistema envia os dados para pagamento.
O pagamento é recusado.
O sistema informa falha no pagamento.



# Caso de Uso 6: Acompanhar Pedido

## Ator:
Comprador

## Fluxo Principal:
O comprador acessa seus pedidos.
O sistema exibe a lista de pedidos realizados.
O comprador visualiza o status de um pedido.

## Fluxo Alternativo A: Pedido não encontrado
O comprador acessa seus pedidos.
O sistema não encontra o pedido solicitado.
O sistema exibe mensagem de aviso.



# Caso de Uso 7: Avaliar Produto

## Ator:
Comprador

## Fluxo Principal:
O comprador acessa seus pedidos concluídos.
O comprador seleciona um dos pedidos.
O comprador dá uma nota e um comentário.
O sistema registra a avaliação.

## Fluxo Alternativo A: Campo vazio
O comprador seleciona um pedido concluído.
O comprador não preenche a avaliação.
O sistema solicita o preenchimento da avaliação.

## Fluxo Alternativo B: Avaliação duplicada
O comprador seleciona um pedido já avaliado.
O sistema identifica uma avaliação existente.
O sistema informa que a avaliação já foi realizada.



# Caso de Uso 8: Gerenciar Produtos

## Ator:
Vendedor

## Fluxo Principal:
O vendedor acessa a área de gerenciamento de produtos.
O vendedor cadastra, edita ou remove produtos.
O sistema salva as alterações realizadas.

## Fluxo Alternativo A: Campo obrigatório vazio
O vendedor acessa a área de gerenciamento de produtos.
O vendedor deixa campos obrigatórios em branco.
O sistema solicita o preenchimento dos campos.

## Fluxo Alternativo B: Produto já cadastrado
O vendedor tenta cadastrar um produto existente.
O sistema identifica duplicidade de cadastro.
O sistema informa que o produto já está cadastrado.

## Fluxo Alternativo C: Produto não encontrado
O vendedor tenta editar ou remover um produto.
O sistema não encontra o produto selecionado.
O sistema exibe mensagem de aviso.

## Fluxo Alternativo D: Erro ao salvar alterações
O vendedor realiza alterações no produto.
O sistema não consegue salvar as alterações.
O sistema informa que há dados inválidos. 



# Caso de Uso 9: Gerenciar Pedidos

## Ator:
Vendedor

## Fluxo Principal:
O vendedor acessa a área de pedidos.
O sistema exibe os pedidos recebidos.
O vendedor atualiza o status do pedido.
O sistema registra a atualização.

## Fluxo Alternativo A: Pedido inexistente
O vendedor acessa a área de pedidos.
O vendedor seleciona um pedido inválido.
O sistema informa que o pedido não existe.

## Fluxo Alternativo B: Ação não permitida
O vendedor tenta atualizar um pedido bloqueado.
O sistema identifica ação não autorizada.
O sistema informa que a ação não é permitida.



# Caso de Uso 10: Administrar Produtos

## Ator:
Administrador

## Fluxo Principal:
O administrador acessa a área de produtos.
O sistema exibe os produtos cadastrados.
O administrador edita ou remove produtos.
O sistema salva as alterações.

## Fluxo Alternativo A: Produto não encontrado
O administrador acessa a área de produtos.
O administrador seleciona um produto inexistente.
O sistema exibe mensagem de aviso.

## Fluxo Alternativo B: Campo obrigatório vazio
O administrador edita ou cadastra um produto.
O administrador deixa campos obrigatórios em branco.
O sistema solicita o preenchimento dos campos.

## Fluxo Alternativo C: Dados inválidos
O administrador informa dados inválidos do produto.
O sistema identifica inconsistência nas informações.
O sistema solicita correção dos dados.

## Fluxo Alternativo D: Produto já cadastrado
O administrador tenta cadastrar um produto já existente.
O sistema identifica duplicidade de cadastro.
O sistema informa que o produto já está cadastrado.



# Caso de Uso 11: Administrar Usuários

## Ator:
Administrador

## Fluxo Principal:
O administrador acessa a área de usuários.
O sistema exibe os usuários cadastrados.
O administrador adiciona, edita ou remove usuários.
O sistema salva as alterações.

## Fluxo Alternativo A: Usuário não encontrado
O administrador acessa a área de usuários.
O administrador seleciona um usuário inexistente.
O sistema exibe mensagem de aviso.

## Fluxo Alternativo B: Campo obrigatório vazio
O administrador adiciona ou edita um usuário.
O administrador deixa campos obrigatórios em branco.
O sistema solicita o preenchimento dos campos.

## Fluxo Alternativo C: Dados inválidos
O administrador informa dados inválidos do usuário.
O sistema identifica inconsistência nas informações.
O sistema solicita correção dos dados.

## Fluxo Alternativo D: Usuário já cadastrado
O administrador tenta cadastrar um usuário já existente.
O sistema identifica duplicidade de cadastro.
O sistema informa que o usuário já está cadastrado.



# Caso de Uso 12: Administrar Categorias

## Ator:
Administrador

## Fluxo Principal:
O administrador acessa a área de categorias.
O sistema exibe as categorias cadastradas.
O administrador adiciona, edita ou remove categorias.
O sistema salva as alterações.

## Fluxo Alternativo A: Categoria não encontrada
O administrador acessa a área de categorias.
O administrador seleciona uma categoria inexistente.
O sistema exibe mensagem de aviso.

## Fluxo Alternativo B: Campo obrigatório vazio
O administrador adiciona ou edita uma categoria.
O administrador deixa campos obrigatórios em branco.
O sistema solicita o preenchimento dos campos.

## Fluxo Alternativo C: Dados inválidos
O administrador informa dados inválidos da categoria.
O sistema identifica inconsistência nas informações.
O sistema solicita correção dos dados.

## Fluxo Alternativo D: Categoria já cadastrada
O administrador tenta cadastrar uma categoria já existente.
O sistema identifica duplicidade de cadastro.
O sistema informa que a categoria já está cadastrada.