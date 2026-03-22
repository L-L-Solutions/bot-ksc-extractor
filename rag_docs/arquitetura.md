# Arquitetura do Sistema

## Componentes

### scraper.js
Extrator principal que automatiza navegação no Kaspersky Security Center.

**Fluxo:**
1. Login via Playwright
2. Seleção de workspace
3. Iteração por categorias (Linux/Windows)
4. Download de CSV por servidor
5. Nomenclatura: `{semana}_{cliente}_{tipo}_{servidor}_aplicativos.csv`

**Configurações:**
- `KSC_CATEGORIAS`: categorias alvo (padrão: Servers - Linux, Servers - Windows)
- `KSC_HEADLESS`: modo headless (padrão: false)
- `KSC_PASTA_RELATORIOS`: destino dos CSVs (padrão: relatorios)

### db_sync.js
Sincronizador de CSVs para PostgreSQL com soft-delete.

**Fluxo:**
1. Leitura de CSVs da pasta relatorios
2. Soft-delete de registros antigos do mesmo arquivo
3. Inserção de novos registros
4. Commit transacional

**Modos:**
- Padrão: processa apenas semana atual
- `--all`: reprocessa todos os arquivos

### run.js
Orquestrador de execução sequencial.

**Fluxo:**
1. Executa scraper.js
2. Aguarda conclusão
3. Se sucesso, executa db_sync.js
4. Se erro, interrompe e reporta

### scheduler.js
Agendador automático com node-cron.

**Configuração:**
- Horário: 04:00 diariamente
- Timezone: America/Sao_Paulo
- Executa: run.js
- Logs: `logs/execution-YYYY-MM-DD.log`

## Estrutura de Dados

### Tabela aplicativos_kaspersky
- `id`: SERIAL PRIMARY KEY
- `nome`: TEXT
- `versao`: TEXT
- `fornecedor`: TEXT
- `atualizacoes`: TEXT
- `arquivo_origem`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE
- `deleted_at`: TIMESTAMP WITH TIME ZONE (soft-delete)

## Padrão de Nomenclatura
Formato: `{M_D_YYYY}-{M_D_YYYY}_{cliente}_{tipo}_{servidor}_aplicativos.csv`

Exemplo: `3_16_2026-3_23_2026_Bild_linux_srv-web-01_aplicativos.csv`

## Automação

### Fluxo Automatizado
1. Scheduler aguarda horário (04:00 America/Sao_Paulo)
2. Executa run.js
3. run.js executa scraper.js
4. Se sucesso, run.js executa db_sync.js
5. Logs salvos em `logs/execution-YYYY-MM-DD.log`

### Componentes
- **scheduler.js**: node-cron com timezone configurado
- **run.js**: orquestrador sequencial com tratamento de erro
- **logs/**: diretório de logs de execução

### Execução Manual
```bash
docker exec -it bot_ksc_playwright node run.js
```
