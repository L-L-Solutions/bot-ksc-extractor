# Sistema de Notificações WhatsApp

## Visão Geral

Sistema integrado de notificações via WhatsApp para monitoramento em tempo real do processo de extração e sincronização.

## Módulo notifier.js

### Função Principal

```javascript
notificar(processo, mensagem, tipo)
```

**Parâmetros:**
- `processo`: identificador do módulo (ex: 'bot-ksc-scraper')
- `mensagem`: texto da notificação
- `tipo`: 'INFO', 'SUCESSO' ou 'ERRO'

### Formato de Mensagem

```
[PREFIXO] processo: mensagem
```

**Prefixos:**
- `[INFO]`: notificações informativas
- `[OK]`: operações bem-sucedidas
- `[ERRO]`: falhas e erros críticos

### Endpoint

- **URL**: `https://n8n.llsolutions.com.br/webhook/dspwpp`
- **Método**: POST
- **Header**: `x-api-key` (via `X_API_KEY` no .env)

### Payload

```json
{
  "cliente": "lldevs",
  "processo": "bot-ksc",
  "mensagem": "[PREFIXO] processo: mensagem"
}
```

## Pontos de Notificação

### bot-ksc-container
- Startup do container com informações do ambiente:
  - Hostname
  - Endereço IP
  - Plataforma e arquitetura
  - Versão do Node.js
  - Memória disponível/total
  - Timezone configurado
  - Hora atual do servidor
  - Status KSC_HEADLESS
  - Próximo agendamento
  - **AVISO CRÍTICO**: Se KSC_HEADLESS=false em container Docker (tipo: ERRO)

### bot-ksc-scheduler
- Início do scheduler com data/hora da próxima execução
- Início de execução agendada (04:00)

### bot-ksc-orchestrator
- Início do processo automatizado
- Sucesso completo (scraper + db_sync)
- Falha crítica no processo

### bot-ksc-scraper
- Início da extração
- Sucesso na extração
- Erro fatal no scraper

### bot-ksc-db_sync
- Início da sincronização com informações detalhadas:
  - Database e host
  - Tabela alvo
  - Semana de referência
  - Modo de processamento
- Contagem de arquivos encontrados
- Erros individuais por arquivo (se houver)
- Sucesso final com analytics completos:
  - Total de arquivos processados/com erro
  - Total de registros inseridos
  - Total de registros soft-deleted
  - Resumo da operação

## Configuração

### Variável de Ambiente

```bash
X_API_KEY="sua_chave_api_n8n"
```

### Comportamento sem API Key

Se `X_API_KEY` não estiver configurada:
- Logs locais continuam funcionando
- Notificações WhatsApp são desabilitadas
- Aviso exibido no console

## Exemplos de Uso

### Notificação de Sucesso

```javascript
await notificar('bot-ksc-scraper', 'Extracao finalizada com sucesso. Relatorios salvos.', 'SUCESSO');
```

**Resultado no WhatsApp:**
```
[OK] bot-ksc-scraper: Extracao finalizada com sucesso. Relatorios salvos.
```

### Notificação de Erro

```javascript
await notificar('bot-ksc-orchestrator', `FALHA CRITICA: ${erro.message}`, 'ERRO');
```

**Resultado no WhatsApp:**
```
[ERRO] bot-ksc-orchestrator: FALHA CRITICA: Connection timeout
```

## Logs Locais

Todas as notificações também geram logs locais com timestamp:

```
[22/03/2026 17:00:00] [SUCESSO] bot-ksc-scraper: Extracao finalizada com sucesso. Relatorios salvos.
```

## Tratamento de Erros

Falhas no envio de notificações:
- Não interrompem o processo principal
- Erro logado no console
- Retorna objeto com `success: false`

## Boas Práticas

### Mensagens Claras
- Descrever ação realizada
- Incluir contexto relevante (ex: quantidade de arquivos)
- Evitar jargão técnico excessivo

### Uso de Tipos
- **INFO**: início de processos, status
- **SUCESSO**: conclusão bem-sucedida
- **ERRO**: falhas que requerem atenção

### Evitar Spam
- Não notificar cada iteração de loop
- Agrupar informações quando possível
- Priorizar eventos importantes