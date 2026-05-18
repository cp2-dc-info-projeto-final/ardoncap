DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS anuncio;
DROP TABLE IF EXISTS endereco;
DROP TABLE IF EXISTS item_carrinho;
DROP TABLE IF EXISTS carrinho;
DROP TABLE IF EXISTS item_pedido;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS avaliacao;

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

CREATE TABLE anuncio (
    id bigint GENERATED ALWAYS AS IDENTITY,
    nome text NOT NULL,
    descricao text NOT NULL,
    preco int NOT NULL,
    id_categoria INT REFERENCES categoria(id),
    id_usuario INT REFERENCES usuario(id),

    CONSTRAINT pk_anuncio PRIMARY KEY (id)
);

CREATE TABLE endereco (
    id bigint GENERATED ALWAYS AS IDENTITY,
    CEP int NOT NULL,
    rua text NOT NULL,
    numero int NOT NULL,
    cidade text NOT NULL,
    estado text NOT NULL,
    complemento text NULL,
    id_usuario REFERENCES usuario(id),

    CONSTRAINT pk_endereco PRIMARY KEY (id)
);

CREATE TABLE item_carrinho (
    id bigint GENERATED ALWAYS AS IDENTITY,
    CONSTRAINT pk_endereco PRIMARY KEY (id)
)
INSERT INTO usuario (login, email, senha, role) VALUES
-- senha efelantinho
('hermenegildo', 'hermenegildo@email.com', '$2a$12$f2c.uHGHS4drfaz6HR870OLamkarD57kI.gkr4//Vbbp0vN9IrFfG', 'admin'),
('zoroastra', 'zoroastra@email.com', '$2a$12$f2c.uHGHS4drfaz6HR870OLamkarD57kI.gkr4//Vbbp0vN9IrFfG', 'user');
