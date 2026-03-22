# Processamento de CSV

## Parser Configuration

### Tratamento de BOM e Espaços
```javascript
const csv = require('csv-parser');

fs.createReadStream(arquivo)
    .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '')
    }))
    .on('data', (data) => resultados.push(data))
    .on('end', () => console.log('Completo'))
    .on('error', (erro) => console.error(erro));
```

### BOM (Byte Order Mark)
- `\uFEFF`: caractere invisível no início de arquivos UTF-8
- Deve ser removido para evitar problemas de mapeamento

## Estrutura CSV Esperada

### Headers
- Nome
- Versão
- Fornecedor
- Atualizações

### Acesso aos Dados
```javascript
const nome = linha['Nome'] || '';
const versao = linha['Versão'] || '';
const fornecedor = linha['Fornecedor'] || '';
const atualizacoes = linha['Atualizações'] || '';
```

## Promise Wrapper Pattern

### Conversão de Stream para Promise
```javascript
await new Promise((resolve, reject) => {
    fs.createReadStream(arquivo)
        .pipe(csv())
        .on('data', (data) => resultados.push(data))
        .on('end', resolve)
        .on('error', reject);
});
```

### Uso
Permite usar `await` com streams, simplificando fluxo assíncrono.

## Filtro de Arquivos

### Por Semana
```javascript
const prefixo = getWeekRange();
const arquivos = fs.readdirSync(dir)
    .filter(file => file.endsWith('.csv'))
    .filter(file => file.startsWith(prefixo));
```

### Todos os Arquivos
```javascript
const reprocessarTudo = process.argv.includes('--all');
if (!reprocessarTudo) {
    arquivos = arquivos.filter(file => file.startsWith(prefixo));
}
```
