# Padrões de Banco de Dados

## Soft-Delete Pattern

### Conceito
Registros não são deletados fisicamente, apenas marcados com `deleted_at`.

### Implementação
```javascript
await client.query(`
    UPDATE aplicativos_kaspersky 
    SET deleted_at = CURRENT_TIMESTAMP, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE arquivo_origem = $1 
    AND deleted_at IS NULL
`, [arquivo]);
```

### Consulta de Ativos
```sql
SELECT * FROM aplicativos_kaspersky 
WHERE deleted_at IS NULL;
```

### Consulta de Histórico
```sql
SELECT * FROM aplicativos_kaspersky 
WHERE arquivo_origem = 'arquivo.csv'
ORDER BY created_at DESC;
```

## Transações

### Pattern Completo
```javascript
await client.query('BEGIN');
try {
    await client.query('UPDATE ...');
    await client.query('INSERT ...');
    await client.query('COMMIT');
} catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
}
```

### Quando Usar
- Múltiplas operações interdependentes
- Sincronização de dados (soft-delete + insert)
- Garantia de integridade

## Conexão PostgreSQL

### Client Pattern
```javascript
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

await client.connect();
// operações
await client.end();
```

### Prepared Statements
```javascript
await client.query(
    'INSERT INTO tabela (col1, col2) VALUES ($1, $2)',
    [valor1, valor2]
);
```
