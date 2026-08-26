DROP TABLE IF EXISTS avaliacao CASCADE;
DROP TABLE IF EXISTS item_pedido CASCADE;
DROP TABLE IF EXISTS pedido CASCADE;
DROP TABLE IF EXISTS item_carrinho CASCADE;
DROP TABLE IF EXISTS carrinho CASCADE;
DROP TABLE IF EXISTS endereco CASCADE;
DROP TABLE IF EXISTS produto CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

CREATE TABLE usuario (
    id bigint GENERATED ALWAYS AS IDENTITY,
    login text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    role text NOT NULL DEFAULT 'user',
    
    -- Constraints
    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT uk_usuario_login UNIQUE (login), -- unicidade
    CONSTRAINT uk_usuario_email UNIQUE (email), -- unicidade
    CONSTRAINT ck_usuario_login_length CHECK (length(login) >= 3 AND length(login) <= 50), -- comprimento
    CONSTRAINT ck_usuario_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- formato de email com expressão regular
    CONSTRAINT ck_usuario_senha_length CHECK (length(senha) >= 6), -- comprimento mínimo
    CONSTRAINT ck_usuario_role_valid CHECK (role IN ('admin', 'user')) -- tipos de usuário
);

CREATE TABLE categoria (
    id int GENERATED ALWAYS AS IDENTITY,
    nome text NOT NULL,

    CONSTRAINT pk_categoria PRIMARY KEY (id)
);

CREATE TABLE produto (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome text NOT NULL,
    descricao text NOT NULL,
    quantidade_disponivel int NOT NULL,
    preco numeric(10,2),
    id_categoria INT NOT NULL REFERENCES categoria(id),
    id_usuario bigint NOT NULL REFERENCES usuario(id),

    CONSTRAINT pk_produto PRIMARY KEY (id)
);

CREATE TABLE endereco (
    id bigint GENERATED ALWAYS AS IDENTITY,
    CEP int NOT NULL,
    rua text NOT NULL,
    numero int NOT NULL,
    cidade text NOT NULL,
    estado text NOT NULL,
    complemento text NULL,
    id_usuario bigint REFERENCES usuario(id) NOT NULL,

    CONSTRAINT pk_endereco PRIMARY KEY (id)
);

CREATE TABLE carrinho (
    id bigint GENERATED ALWAYS AS IDENTITY,
    id_usuario int NOT NULL REFERENCES usuario(id),

    CONSTRAINT pk_carrinho PRIMARY KEY (id)
);

CREATE TABLE item_carrinho (
    id bigint GENERATED ALWAYS AS IDENTITY,
    quantidade int NOT NULL,
    preco_unitario int NOT NULL,
    id_carrinho bigint NOT NULL REFERENCES carrinho(id),
    id_produto bigint NOT NULL REFERENCES produto(id),

    CONSTRAINT pk_item_carrinho PRIMARY KEY (id)
);

CREATE TABLE pedido (
    id bigint GENERATED ALWAYS AS IDENTITY,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status text NOT NULL,
    valor int NOT NULL,
    id_usuario bigint NOT NULL REFERENCES usuario(id),
    id_endereco bigint NOT NULL REFERENCES endereco(id),

    CONSTRAINT pk_pedido PRIMARY KEY (id)
);

CREATE TABLE item_pedido (
    id bigint GENERATED ALWAYS AS IDENTITY,
    quantidade int NOT NULL,
    preco_unitario int NOT NULL,
    subtotal int NOT NULL,
    id_pedido bigint NOT NULL REFERENCES pedido(id),
    id_produto bigint NOT NULL REFERENCES produto(id),

    CONSTRAINT pk_item_pedido PRIMARY KEY (id)
);

CREATE TABLE avaliacao (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nota int NOT NULL,
    comentario text NULL,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario bigint NOT NULL REFERENCES usuario(id),
    id_produto bigint NOT NULL REFERENCES produto(id),

    CONSTRAINT pk_avaliacao PRIMARY KEY (id),
    CONSTRAINT ck_avaliacao_nota CHECK (nota >= 1 AND nota <= 5)
);   

INSERT INTO usuario (login, email, senha, role) VALUES

-- senha efelantinho
('hermenegildo', 'hermenegildo@email.com', '$2a$12$f2c.uHGHS4drfaz6HR870OLamkarD57kI.gkr4//Vbbp0vN9IrFfG', 'admin'),
('Ardoncap', 'ardoncap@yahoo.com', '$2a$12$7d0imLUVIPYWExaqnQbdAe8jb71JXuS3U.g0155qVF2i0B.L6INyy', 'admin'),
('ArdoncapUser', 'ardoncapuser@yahoo.com', '$2a$12$7d0imLUVIPYWExaqnQbdAe8jb71JXuS3U.g0155qVF2i0B.L6INyy', 'user');
