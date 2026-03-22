const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const { notificar } = require('./notifier');

async function executar() {
    const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    console.log(`[${timestamp}] Iniciando processo automatizado`);
    
    await notificar('bot-ksc-orchestrator', 'Iniciando processo automatizado de extracao e sincronizacao', 'INFO');
    
    try {
        console.log('Executando scraper.js...');
        const { stdout: scraperOut, stderr: scraperErr } = await execPromise('node scraper.js');
        console.log(scraperOut);
        if (scraperErr) console.error(scraperErr);
        
        console.log('\nScraper finalizado com sucesso. Iniciando sincronizacao...');
        
        const { stdout: syncOut, stderr: syncErr } = await execPromise('node db_sync.js');
        console.log(syncOut);
        if (syncErr) console.error(syncErr);
        
        const timestampFim = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        console.log(`[${timestampFim}] Processo finalizado com sucesso`);
        
        await notificar('bot-ksc-orchestrator', 'Processo finalizado com sucesso. Extracao e sincronizacao concluidas.', 'SUCESSO');
        
        process.exit(0);
    } catch (erro) {
        const timestampErro = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        console.error(`[${timestampErro}] Erro no processo:`, erro.message);
        
        await notificar('bot-ksc-orchestrator', `FALHA CRITICA: ${erro.message}`, 'ERRO');
        
        process.exit(1);
    }
}

executar();