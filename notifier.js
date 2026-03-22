const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const WEBHOOK_URL = 'n8n.llsolutions.com.br';
const WEBHOOK_PATH = '/webhook/dspwpp';
const API_KEY = process.env.X_API_KEY;

function enviar(processo, mensagem, tipo = 'INFO') {
    return new Promise((resolve, reject) => {
        const prefixo = tipo === 'ERRO' ? '[ERRO]' : tipo === 'SUCESSO' ? '[OK]' : '[INFO]';
        const mensagemFormatada = `${prefixo} ${processo}: ${mensagem}`;
        
        const payload = JSON.stringify({
            cliente: 'lldevs',
            processo: 'bot-ksc',
            mensagem: mensagemFormatada
        });

        const options = {
            hostname: WEBHOOK_URL,
            path: WEBHOOK_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'x-api-key': API_KEY
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ success: true, data });
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(payload);
        req.end();
    });
}

function notificar(processo, mensagem, tipo = 'INFO') {
    const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    console.log(`[${timestamp}] [${tipo}] ${processo}: ${mensagem}`);
    
    if (!API_KEY) {
        console.log('[AVISO] X_API_KEY nao configurada. Notificacao WhatsApp desabilitada.');
        return Promise.resolve({ success: false, reason: 'API_KEY_NOT_SET' });
    }
    
    return enviar(processo, mensagem, tipo)
        .catch(erro => {
            console.error(`[ERRO] Falha ao enviar notificacao: ${erro.message}`);
            return { success: false, error: erro.message };
        });
}

module.exports = { notificar };