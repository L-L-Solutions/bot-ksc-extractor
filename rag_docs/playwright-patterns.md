# Padrões Playwright

## Seletores Utilizados

### Por TestId
```javascript
page.getByTestId('signIn')
page.getByTestId('signin-login')
page.getByTestId('hierarchy-tree-body')
```

### Por Texto
```javascript
page.getByText('Ativos (dispositivos)').first()
page.getByText(categoria, { exact: true })
```

### Por Role
```javascript
page.getByRole('link', { name: servidor })
page.getByRole('button', { name: 'OK' })
```

## Retry Pattern
```javascript
let tentativas = 3;
while (tentativas > 0) {
    try {
        await action();
        break;
    } catch (erro) {
        tentativas--;
        if (tentativas === 0) throw erro;
        await page.reload();
        await page.waitForTimeout(30000);
    }
}
```

## Download Pattern
```javascript
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: ' Exportar para CSV' }).click();
const download = await downloadPromise;
await download.saveAs(caminhoArquivo);
```

## Extração de Dados da DOM
```javascript
const dados = await page.evaluate(() => {
    const elementos = document.querySelectorAll('.selector');
    return Array.from(elementos).map(el => el.innerText.trim());
});
```

## Timeouts
- Ações críticas: `{ timeout: 60000 }` (60s)
- Esperas entre ações: `waitForTimeout(1500)` a `waitForTimeout(3000)`
- Reload em falha: `waitForTimeout(30000)` (30s)
