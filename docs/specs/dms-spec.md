# Especificação - Document Management System

## 1. Objetivo

Disponibilizar um sistema web simples para que usuários enviem, visualizem e baixem documentos armazenados localmente pela aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de documentos por formulário web.
- Armazenamento dos arquivos no filesystem local.
- Registro dos metadados em memória.
- Listagem dos documentos do usuário.
- Download de documentos pelo identificador.
- Identificação simples do usuário por requisição.
- Tratamento de erros de validação, arquivo inexistente e falhas de armazenamento.
- Interface React para upload, listagem e download.
- API REST com Node.js e Express.

### Fora do escopo

- Armazenamento em nuvem ou provedores externos.
- Banco de dados persistente.
- Autenticação e autorização completas.
- Versionamento, edição ou exclusão de documentos.
- Compartilhamento entre usuários.
- Busca no conteúdo dos arquivos.
- Conversão ou processamento do conteúdo.
- Upload retomável ou em múltiplas partes.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário deve enviar um documento usando `multipart/form-data`. |
| RF-02 | O sistema deve rejeitar uploads sem arquivo. |
| RF-03 | O sistema deve gravar o arquivo em `backend/storage` usando `multer` com `diskStorage`. |
| RF-04 | O sistema deve gerar um identificador único para cada documento. |
| RF-05 | O sistema deve registrar os metadados após o upload. |
| RF-06 | O usuário deve listar os documentos associados ao seu identificador. |
| RF-07 | O usuário deve baixar um documento pelo identificador. |
| RF-08 | O sistema deve rejeitar documentos inexistentes. |
| RF-09 | O sistema deve impedir o download de documento pertencente a outro usuário. |
| RF-10 | O frontend deve exibir estados de carregamento, sucesso, lista vazia e erro. |
| RF-11 | O frontend deve permitir selecionar um arquivo e iniciar o upload. |
| RF-12 | O frontend deve exibir nome, tamanho e data de envio. |
| RF-13 | O frontend deve disponibilizar uma ação de download por documento. |
| RF-14 | O backend deve disponibilizar um endpoint de verificação de saúde. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e CommonJS. |
| RNF-02 | O frontend deve usar React, Vite e módulos ES. |
| RNF-03 | O armazenamento de arquivos deve ser exclusivamente local. |
| RNF-04 | O upload deve usar `multer` configurado com `diskStorage`. |
| RNF-05 | Os metadados devem permanecer em memória nesta primeira versão. |
| RNF-06 | A configuração deve usar variáveis de ambiente quando aplicável. |
| RNF-07 | O backend deve respeitar o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-08 | As camadas internas não devem depender diretamente de detalhes HTTP. |
| RNF-09 | O frontend deve acessar a API usando `fetch` pelo prefixo `/api`. |
| RNF-10 | A API deve retornar respostas JSON consistentes para erros. |
| RNF-11 | O nome físico do arquivo não deve depender diretamente do nome original. |
| RNF-12 | A API não deve expor caminhos absolutos do filesystem. |
| RNF-13 | Os fluxos críticos devem possuir testes automatizados com `node:test`. |

## 5. Premissas e regras de negócio

1. Cada documento pertence a um único usuário.
2. O usuário será identificado pelo cabeçalho `X-User-Id`.
3. Enquanto não houver autenticação, o valor padrão será `anonymous`.
4. O nome original será preservado apenas nos metadados e no nome sugerido no download.
5. O arquivo físico terá um nome interno seguro e único.
6. A pasta `backend/storage` deverá existir ou ser criada na inicialização.
7. O conteúdo não deverá ser carregado integralmente na memória durante upload ou download.
8. A listagem deverá ser ordenada do documento mais recente para o mais antigo.
9. Os metadados serão perdidos ao reiniciar o processo, mesmo que os arquivos permaneçam no filesystem.
10. O acesso ao download será validado pelo identificador e pelo proprietário.
11. O limite de upload deverá ser configurável por variável de ambiente.

## 6. Modelo de dados

### 6.1 Documento interno

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador público único. |
| `originalName` | string | Sim | Nome original enviado pelo usuário. |
| `storedName` | string | Sim | Nome interno usado no filesystem. |
| `storagePath` | string | Sim | Caminho interno do arquivo armazenado. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `mimeType` | string | Sim | Tipo MIME do arquivo. |
| `uploadedAt` | string | Sim | Data/hora do upload em ISO 8601. |
| `owner` | string | Sim | Identificador do usuário proprietário. |

### 6.2 Representação pública

`storedName` e `storagePath` são detalhes internos e não devem ser retornados pela API.

```json
{
  "id": "doc_123",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-09-23T12:00:00.000Z",
  "owner": "user-1"
}
```

### 6.3 Contrato do repositório

O repositório deve fornecer, no mínimo:

- `create(document)`
- `findById(id)`
- `findByOwner(owner)`
- `getFilePath(document)`

A implementação inicial poderá manter os metadados em uma coleção em memória e usar o filesystem local para os arquivos.

## 7. Arquitetura

### 7.1 Backend

Estrutura esperada:

```text
backend/src/
  app.js
  routes/
  controllers/
  services/
  repositories/
```

Responsabilidades:

- `routes/`: registra endpoints, middlewares e parâmetros HTTP.
- `controllers/`: interpreta requisições, faz validações básicas e produz respostas HTTP.
- `services/`: concentra regras de negócio, autorização e fluxos de upload/download.
- `repositories/`: persiste metadados em memória e acessa arquivos locais.
- `app.js`: configura Express, middlewares, rotas e tratamento de erros.

O `multer` deve ser configurado com `diskStorage` em middleware de upload. Controllers não devem acessar diretamente o filesystem.

### 7.2 Frontend

Estrutura esperada:

```text
frontend/src/
  App.jsx
  components/
  pages/
  services/
```

- `services/`: encapsula chamadas `fetch`.
- `components/`: contém upload, listagem e download reutilizáveis.
- `pages/`: compõe as telas.
- `App.jsx`: compõe a aplicação principal.

## 8. Contratos de API

### 8.1 GET `/health`

Resposta `200`:

```json
{
  "status": "ok"
}
```

### 8.2 POST `/upload`

Headers:

```text
X-User-Id: user-1
Content-Type: multipart/form-data
```

Campo obrigatório:

```text
file: <arquivo>
```

Resposta `201`:

```json
{
  "id": "doc_123",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-09-23T12:00:00.000Z",
  "owner": "user-1"
}
```

Erros:

- `400 FILE_REQUIRED`: arquivo não enviado.
- `413 FILE_TOO_LARGE`: limite de tamanho excedido.
- `500 UPLOAD_FAILED`: falha no armazenamento.

Formato:

```json
{
  "error": {
    "code": "FILE_REQUIRED",
    "message": "Um arquivo deve ser enviado."
  }
}
```

### 8.3 GET `/documents`

Header:

```text
X-User-Id: user-1
```

Resposta `200`:

```json
{
  "documents": [
    {
      "id": "doc_123",
      "originalName": "relatorio.pdf",
      "size": 24576,
      "mimeType": "application/pdf",
      "uploadedAt": "2026-09-23T12:00:00.000Z",
      "owner": "user-1"
    }
  ]
}
```

Quando não houver documentos:

```json
{
  "documents": []
}
```

### 8.4 GET `/documents/:id/download`

Header:

```text
X-User-Id: user-1
```

Resposta `200`:

- corpo binário do arquivo;
- `Content-Type` correspondente ao MIME type;
- `Content-Disposition` com o nome original.

Erros:

- `400`: identificador inválido;
- `403 DOCUMENT_ACCESS_DENIED`: documento pertence a outro usuário;
- `404 DOCUMENT_NOT_FOUND`: documento ou arquivo não existe;
- `500 FILE_READ_FAILED`: falha de leitura.

## 9. Contrato do frontend

| Operação | URL | Método |
| --- | --- | --- |
| Verificar backend | `/api/health` | `GET` |
| Enviar arquivo | `/api/upload` | `POST` |
| Listar documentos | `/api/documents` | `GET` |
| Baixar documento | `/api/documents/:id/download` | `GET` |

O serviço de API deve usar `fetch`, enviar o arquivo por `FormData`, não definir manualmente o `Content-Type` do `FormData`, interpretar erros JSON e atualizar a listagem após upload bem-sucedido.

## 10. Tratamento de erros

O backend deve possuir um middleware final para erros não tratados, retornando JSON sem stack trace ao cliente.

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocorreu um erro interno."
  }
}
```

Regras:

- Não expor caminhos internos do filesystem.
- Não expor stack traces em produção.
- Diferenciar validação, autorização, inexistência e falha interna.
- Registrar detalhes técnicos apenas no servidor quando necessário.

## 11. Configuração

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta do backend. |
| `STORAGE_DIR` | `backend/storage` | Diretório local dos arquivos. |
| `MAX_FILE_SIZE` | definido na implementação | Limite máximo em bytes. |
| `DEFAULT_USER_ID` | `anonymous` | Usuário padrão. |
| `NODE_ENV` | `development` | Ambiente de execução. |

Nenhuma configuração deve introduzir armazenamento externo ou serviços de upload de terceiros.

## 12. Plano de execução

### Etapa 1 - Validar a especificação

- Confirmar requisitos, modelo de dados e contratos HTTP.
- Definir o limite padrão de upload.
- Confirmar o uso de `X-User-Id` como identificação temporária.

**Critério de aceite:** o documento está aprovado antes de qualquer implementação.

### Etapa 2 - Implementar repositórios

- Criar o repositório de metadados em memória.
- Criar o acesso aos arquivos locais.
- Garantir nomes internos seguros e únicos.
- Encapsular o acesso a caminhos do filesystem.

**Critério de aceite:** documentos podem ser criados, consultados e filtrados por proprietário sem dependência de Express.

### Etapa 3 - Implementar serviços

- Implementar upload, listagem e download.
- Validar existência e propriedade do documento.
- Mapear entidades internas para respostas públicas.

**Critério de aceite:** as regras de negócio funcionam independentemente da camada HTTP.

### Etapa 4 - Implementar controllers e rotas

- Configurar `multer` com `diskStorage`.
- Criar `/health`, `/upload`, `/documents` e `/documents/:id/download`.
- Extrair o usuário de `X-User-Id`.
- Adicionar middleware de erros.

**Critério de aceite:** todos os endpoints respondem conforme os contratos definidos.

### Etapa 5 - Criar testes do backend

- Testar health check.
- Testar upload válido, ausência de arquivo e limite excedido.
- Testar listagem por usuário.
- Testar download válido e documento inexistente.
- Testar bloqueio de acesso entre usuários.

**Critério de aceite:** os testes executam com `npm test` e cobrem os fluxos críticos.

### Etapa 6 - Implementar frontend

- Criar serviço de API com `fetch`.
- Criar componentes de upload, listagem e download.
- Tratar estados de carregamento, sucesso, lista vazia e erro.
- Integrar as chamadas pelo prefixo `/api`.

**Critério de aceite:** o usuário consegue enviar, visualizar e baixar documentos pela interface.

### Etapa 7 - Validar a integração

- Executar backend e frontend.
- Validar o proxy do Vite.
- Executar o fluxo completo no navegador.
- Confirmar gravação em `backend/storage`.
- Confirmar a perda dos metadados após reinicialização, conforme o escopo desta versão.

**Critério de aceite:** upload, listagem e download funcionam ponta a ponta sem armazenamento externo.

## 13. Riscos e decisões

| Risco ou decisão | Tratamento |
| --- | --- |
| Metadados são perdidos no restart | Limitação documentada da primeira versão. |
| Arquivo pode ficar sem metadado após falha | Tentar limpeza compensatória e registrar a limitação. |
| Não há autenticação real | Usar `X-User-Id` apenas como mecanismo temporário. |
| Nome original pode conter caracteres perigosos | Nunca usá-lo como caminho físico. |
| Diretório de armazenamento pode não existir | Criá-lo na inicialização. |
| Arquivo removido manualmente | Retornar `404` sem expor o caminho físico. |
| Crescimento da coleção em memória | Aceito nesta fase; persistência será evolução futura. |
