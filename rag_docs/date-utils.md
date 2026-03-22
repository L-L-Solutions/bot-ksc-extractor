# Utilitários de Data

## getWeekRange()

### Propósito
Gera string de intervalo semanal para nomenclatura de arquivos.

### Implementação
```javascript
function getWeekRange() {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 7);

    const format = (d) => `${d.getMonth() + 1}_${d.getDate()}_${d.getFullYear()}`;
    return `${format(firstDayOfWeek)}-${format(lastDayOfWeek)}`;
}
```

### Comportamento
- Domingo como primeiro dia da semana (`getDay()` retorna 0)
- Intervalo de 7 dias a partir do domingo
- Formato: `M_D_YYYY-M_D_YYYY`

### Exemplos
- Executado em 22/03/2026 (sábado): `3_16_2026-3_23_2026`
- Executado em 23/03/2026 (domingo): `3_23_2026-3_30_2026`

### Uso
```javascript
const weekRange = getWeekRange();
const nomeArquivo = `${weekRange}_${cliente}_${tipo}_${servidor}_aplicativos.csv`;
```

## Considerações

### Timezone
Usa timezone local do sistema. Para UTC, usar:
```javascript
const today = new Date();
const utcDate = new Date(today.toISOString());
```

### Semana Comercial
Para segunda-feira como início:
```javascript
const dayOfWeek = today.getDay();
const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
firstDayOfWeek.setDate(today.getDate() + diff);
```
