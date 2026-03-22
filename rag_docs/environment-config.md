# Configuração de Ambiente

## Variáveis KSC (Kaspersky Security Center)

### Autenticação
- `KSC_USER`: email de login
- `KSC_PASSWORD`: senha
- `KSC_WORKSPACE`: nome do workspace alvo

### Operação
- `KSC_CATEGORIAS`: categorias separadas por vírgula (padrão: "Servers - Linux,Servers - Windows")
- `KSC_PASTA_RELATORIOS`: pasta destino dos CSVs (padrão: "relatorios")
- `KSC_HEADLESS`: modo headless do navegador (padrão: "false")

## Variáveis Database

- `DB_USER`: usuário PostgreSQL
- `DB_PASSWORD`: senha PostgreSQL
- `DB_HOST`: host do banco (localhost ou IP)
- `DB_PORT`: porta (padrão: 5432, projeto usa 5442)
- `DB_NAME`: nome do database

## Carregamento

### Pattern
```javascript
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
```

### Acesso
```javascript
const user = process.env.KSC_USER;
const isHeadless = process.env.KSC_HEADLESS === 'true';
const categorias = process.env.KSC_CATEGORIAS.split(',').map(c => c.trim());
```

## Docker Compose

### PostgreSQL
- Porta mapeada: `5442:5432` (evita conflito com instâncias locais)
- Volume: `pgdata` para persistência
- Credenciais: root/rootpassword
- Timezone: America/Sao_Paulo

### Playwright
- Imagem: `mcr.microsoft.com/playwright:v1.42.0-jammy`
- Volume: `.:/app` (pasta raiz montada)
- Timezone: America/Sao_Paulo
- Comando: `npm install && node scheduler.js`
- Inicia scheduler automaticamente
