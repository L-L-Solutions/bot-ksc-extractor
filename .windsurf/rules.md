---
description: Regras do projeto bot-ksc-extractor
---

# Regras do Projeto

## Princípios Fundamentais

### Código Limpo
- Sem comentários no código
- Sem emojis
- Código autoexplicativo via nomes descritivos

### Filosofia MVP
- Soluções simplistas e diretas
- Evitar over-engineering
- Priorizar funcionalidade sobre elegância
- Mínimas alterações para manutenção

### Postura Técnica
- Abordagem de esquadrão sênior
- Decisões pragmáticas
- Foco em entrega e estabilidade

## Stack Técnica

### Core
- Node.js com CommonJS (`require/module.exports`)
- Playwright v1.42+ para automação
- PostgreSQL 15+ para persistência
- csv-parser para processamento

### Dependências
```json
{
  "playwright": "automação web",
  "pg": "client PostgreSQL",
  "csv-parser": "parsing de CSV",
  "dotenv": "variáveis de ambiente"
}
```

## Arquitetura

### Componentes
- `scraper.js`: extração via Playwright
- `db_sync.js`: sincronização CSV → PostgreSQL
- `rag_docs/`: documentação técnica concentrada

### Padrões
- Soft-delete com `deleted_at`
- Transações para integridade
- Processamento semanal por padrão
- Retry pattern para operações críticas

## Convenções de Código

### Nomenclatura
- Arquivos: `snake_case.js`
- Variáveis/funções: `camelCase`
- Constantes de ambiente: `UPPER_SNAKE_CASE`
- Prefixos: `KSC_` para Kaspersky, `DB_` para database

### Estrutura
```javascript
const deps = require('deps');
require('dotenv').config();

function utilFunction() {}

(async () => {
    await mainLogic();
})();
```

### Error Handling
```javascript
try {
    await operation();
} catch (erro) {
    console.log(`Contexto: ${erro.message}`);
}
```

## Database

### Schema
- Sempre usar `IF NOT EXISTS` em DDL
- Timestamps automáticos: `created_at`, `updated_at`
- Soft-delete obrigatório: `deleted_at`

### Queries
- Prepared statements para segurança
- Transações para múltiplas operações
- Rollback em caso de erro

## Playwright

### Seletores (ordem de preferência)
1. `getByTestId()` - mais estável
2. `getByRole()` - semântico
3. `getByText()` - último recurso

### Timeouts
- Ações críticas: 60000ms
- Esperas entre ações: 1500-3000ms
- Reload em falha: 30000ms

### Retry
- 3 tentativas para operações críticas
- Reload de página entre tentativas
- Throw apenas na última falha

## Variáveis de Ambiente

### Obrigatórias
- `KSC_USER`, `KSC_PASSWORD`, `KSC_WORKSPACE`
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`

### Opcionais com Defaults
- `KSC_CATEGORIAS`: "Servers - Linux,Servers - Windows"
- `KSC_PASTA_RELATORIOS`: "relatorios"
- `KSC_HEADLESS`: "false"

## Documentação

### Localização
- Toda documentação técnica em `rag_docs/`
- Um conceito por arquivo
- Formato Markdown

### Estrutura
- Título claro
- Exemplos de código
- Casos de uso
- Considerações técnicas

### Estilo
- Conciso e direto
- Code snippets funcionais
- Sem explicações óbvias
