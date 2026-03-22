const os = require('os');
const { exec } = require('child_process');
const { notificar } = require('./notifier');

async function getSystemInfo() {
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    
    const networkInterfaces = os.networkInterfaces();
    let ipAddress = 'N/A';
    
    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        for (const addr of addresses) {
            if (addr.family === 'IPv4' && !addr.internal) {
                ipAddress = addr.address;
                break;
            }
        }
        if (ipAddress !== 'N/A') break;
    }
    
    return {
        hostname,
        platform,
        arch,
        ipAddress,
        totalMem,
        freeMem,
        nodeVersion: process.version,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
}

async function enviarNotificacaoStartup() {
    const info = await getSystemInfo();
    
    const horaAtual = new Date().toLocaleString('pt-BR', { 
        timeZone: 'America/Sao_Paulo',
        dateStyle: 'short',
        timeStyle: 'medium'
    });
    
    const kscHeadless = process.env.KSC_HEADLESS || 'false';
    const headlessWarning = kscHeadless === 'false' 
        ? '\n\n*** ATENCAO: KSC_HEADLESS=false ***\nContainer Docker requer KSC_HEADLESS=true para funcionar!\nAltere no .env e reinicie o container.' 
        : '';
    
    const mensagem = `Container iniciado com sucesso
Hostname: ${info.hostname}
IP: ${info.ipAddress}
Plataforma: ${info.platform} (${info.arch})
Node: ${info.nodeVersion}
Memoria: ${info.freeMem}GB livre de ${info.totalMem}GB
Timezone: ${info.timezone}
Hora atual: ${horaAtual}
KSC_HEADLESS: ${kscHeadless}
Proximo agendamento: 04:00 (America/Sao_Paulo)${headlessWarning}`;
    
    const tipoNotificacao = kscHeadless === 'false' ? 'ERRO' : 'INFO';
    
    await notificar('bot-ksc-container', mensagem, tipoNotificacao);
    console.log('Notificacao de startup enviada');
}

enviarNotificacaoStartup().catch(err => {
    console.error('Erro ao enviar notificacao de startup:', err.message);
});