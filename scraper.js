const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { chromium } = require('playwright');
const fs = require('fs');
const { notificar } = require('./notifier');

function getWeekRange() {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 7);

    const format = (d) => `${d.getMonth() + 1}_${d.getDate()}_${d.getFullYear()}`;
    return `${format(firstDayOfWeek)}-${format(lastDayOfWeek)}`;
}

const categoriasAlvo = process.env.KSC_CATEGORIAS 
    ? process.env.KSC_CATEGORIAS.split(',').map(c => c.trim()) 
    : ['Servers - Linux', 'Servers - Windows'];

const nomePastaRelatorios = process.env.KSC_PASTA_RELATORIOS || 'relatorios';
const dirRelatorios = path.join(__dirname, nomePastaRelatorios);

if (!fs.existsSync(dirRelatorios)){
    fs.mkdirSync(dirRelatorios);
}

const isHeadless = process.env.KSC_HEADLESS ? process.env.KSC_HEADLESS === 'true' : false;

(async () => {
  await notificar('bot-ksc-scraper', 'Iniciando extracao de relatorios do Kaspersky Security Center', 'INFO');
  
  const browser = await chromium.launch({ headless: isHeadless }); 
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  console.log("Iniciando login no KSC...");
  await page.goto('https://ksc.kaspersky.com/login');
  await page.getByTestId('signIn').click();
  
  await page.locator('[data-test-id="signin-login"]').click();
  await page.locator('[data-test-id="signin-login"]').fill(process.env.KSC_USER);
  await page.locator('[data-test-id="signin-password"]').click();
  await page.locator('[data-test-id="signin-password"]').fill(process.env.KSC_PASSWORD);
  await page.locator('[data-test-id="signin-proceed"]').click();

  console.log("Acessando o Workspace...");
  try {
    await page.goto('https://ksc.kaspersky.com/?ui_locales=pt-br#/dashboard');
  } catch (e) {
  }
  
    let tentativasWorkspace = 3;
    while (tentativasWorkspace > 0) {
        try {
            await page.getByText(process.env.KSC_WORKSPACE).click({ timeout: 60000 });
            await page.getByTestId('openWorkspaceLink').click({ timeout: 60000 });
            await page.getByRole('button', { name: 'OK' }).click({ timeout: 60000 });
            break;
        } catch (erro) {
            tentativasWorkspace--;
            if (tentativasWorkspace === 0) {
                throw erro;
            }
            console.log(`Falha ao acessar workspace. Recarregando pagina. Tentativas restantes: ${tentativasWorkspace}`);
            await page.reload();
            await page.waitForTimeout(30000);
        }
    }

  console.log("Navegando ate Ativos (dispositivos)...");
  await page.getByText('Ativos (dispositivos)').first().click({ timeout: 60000 });
  await page.locator('.ant-tree-switcher.ant-tree-switcher_close').click();

  const weekRange = getWeekRange();

  for (const categoria of categoriasAlvo) {
    console.log(`\n--- Processando a categoria: ${categoria} ---`);
    
    await page.getByTestId('hierarchy-tree-body').getByText(categoria, { exact: true }).click();
    await page.waitForTimeout(3000); 

    const nomesServidores = await page.evaluate(() => {
        const linhas = document.querySelectorAll('.ant-table-tbody tr');
        let nomes = [];
        
        linhas.forEach(linha => {
            const link = linha.querySelector('a'); 
            if (link && link.innerText.trim() !== '>>' && link.innerText.trim().length > 3) {
                nomes.push(link.innerText.trim());
            }
        });
        
        return [...new Set(nomes)];
    });

    console.log(`Encontrados ${nomesServidores.length} servidores em ${categoria}.`);

    for (const servidor of nomesServidores) {
        console.log(`Extraindo relatorio de: ${servidor}`);
        
        try {
            await page.getByRole('link', { name: servidor }).click();
            await page.locator('a').filter({ hasText: 'Avançado' }).click();

            const downloadPromise = page.waitForEvent('download');
            await page.getByRole('button', { name: ' Exportar para CSV' }).click();
            const download = await downloadPromise;

            const nomeCliente = process.env.KSC_WORKSPACE.split(' ')[0]; 
            const tipoServidor = categoria.split(' - ')[1].toLowerCase(); 
            const nomeArquivo = `${weekRange}_${nomeCliente}_${tipoServidor}_${servidor}_aplicativos.csv`;
            
            const caminhoArquivo = path.join(dirRelatorios, nomeArquivo);
            await download.saveAs(caminhoArquivo);
            console.log(`Salvo: ${nomeArquivo}`);

            await page.getByRole('button', { name: 'Cancelar' }).click();
            await page.getByTestId('hierarchy-tree-body').getByText(categoria, { exact: true }).click();
            await page.waitForTimeout(1500); 

        } catch (erro) {
            console.log(`Erro em ${servidor}: ${erro.message}`);
            try { await page.getByRole('button', { name: 'Cancelar' }).click(); } catch(e) {}
            await page.getByTestId('hierarchy-tree-body').getByText(categoria, { exact: true }).click();
            await page.waitForTimeout(2000);
        }
    }
  }

  console.log("\nExtracao de todas as categorias finalizada!");
  await browser.close();
  
  await notificar('bot-ksc-scraper', 'Extracao finalizada com sucesso. Relatorios salvos.', 'SUCESSO');
})().catch(async (erro) => {
  console.error('Erro fatal no scraper:', erro.message);
  await notificar('bot-ksc-scraper', `ERRO FATAL: ${erro.message}`, 'ERRO');
  process.exit(1);
});