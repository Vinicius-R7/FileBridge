// ========================
// Configuração
// ========================

const API_URL = 'https://filebridge-api.onrender.com';

// ========================
// Elementos do DOM
// ========================

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const successMessage = document.getElementById('successMessage');
const uploadedFileName = document.getElementById('uploadedFileName');
const uploadedFileSize = document.getElementById('uploadedFileSize');
const downloadLink = document.getElementById('downloadLink');
const copyBtn = document.getElementById('copyBtn');
const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
const refreshBtn = document.getElementById('refreshBtn');
const filesList = document.getElementById('filesList');

// ========================
// Event Listeners
// ========================

// Clique na área de upload
uploadArea.addEventListener('click', () => fileInput.click());

// Seleção de arquivo
fileInput.addEventListener('change', handleFileSelect);

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect();
    }
});

// Copiar link
copyBtn.addEventListener('click', copyToClipboard);

// Enviar outro arquivo
uploadAnotherBtn.addEventListener('click', resetUpload);

// Atualizar lista
refreshBtn.addEventListener('click', loadFiles);

// ========================
// Funções Principais
// ========================

/**
 * Processa arquivo selecionado
 */
function handleFileSelect() {
    const file = fileInput.files[0];
    
    if (!file) {
        alert('❌ Nenhum arquivo selecionado');
        return;
    }
    
    // Validação de tamanho (100MB máximo)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
        alert('❌ Arquivo muito grande! Máximo: 100MB');
        return;
    }
    
    uploadFile(file);
}

/**
 * Faz upload do arquivo para o backend
 */
async function uploadFile(file) {
    // Mostra barra de progresso
    uploadArea.style.display = 'none';
    progressContainer.style.display = 'block';
    
    try {
        // Cria FormData
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulação de progresso (FastAPI não retorna progresso real via fetch)
        simulateProgress();
        
        // Faz requisição
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Completa barra de progresso
        progressFill.style.width = '100%';
        progressText.textContent = '✅ Upload concluído!';
        
        // Aguarda um pouco para mostrar 100%
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mostra mensagem de sucesso
        showSuccess(data);
        
        // Atualiza lista de arquivos
        loadFiles();
        
    } catch (error) {
        console.error('Erro no upload:', error);
        alert(`❌ Erro ao enviar arquivo: ${error.message}`);
        resetUpload();
    }
}

/**
 * Simula progresso de upload
 */
function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) {
            clearInterval(interval);
            progress = 90;
        }
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Enviando... ${Math.round(progress)}%`;
    }, 300);
}

/**
 * Mostra mensagem de sucesso com link
 */
function showSuccess(data) {
    progressContainer.style.display = 'none';
    successMessage.style.display = 'block';
    
    uploadedFileName.textContent = data.filename;
    uploadedFileSize.textContent = formatFileSize(data.size);
    
    // Gera link de download
    const downloadUrl = `${window.location.protocol}//${window.location.host}/download.html?id=${data.file_id}`;
    downloadLink.value = downloadUrl;
}

/**
 * Copia link para área de transferência
 */
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(downloadLink.value);
        
        // Feedback visual
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copiado!';
        copyBtn.style.background = '#10b981';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
        
    } catch (error) {
        // Fallback para navegadores antigos
        downloadLink.select();
        document.execCommand('copy');
        alert('✅ Link copiado!');
    }
}

/**
 * Reseta formulário de upload
 */
function resetUpload() {
    fileInput.value = '';
    progressFill.style.width = '0%';
    uploadArea.style.display = 'block';
    progressContainer.style.display = 'none';
    successMessage.style.display = 'none';
}

/**
 * Carrega lista de arquivos
 */
async function loadFiles() {
    filesList.innerHTML = '<p class="loading">Carregando arquivos...</p>';
    
    try {
        const response = await fetch(`${API_URL}/files`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.files.length === 0) {
            filesList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p>Nenhum arquivo enviado ainda</p>
                </div>
            `;
            return;
        }
        
        // Ordena por data (mais recente primeiro)
        data.files.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Renderiza lista
        filesList.innerHTML = data.files.map(file => `
            <div class="file-item">
                <div class="file-item-info">
                    <div class="file-item-name">📄 ${file.filename}</div>
                    <div class="file-item-meta">
                        ${formatFileSize(file.size)} • ${formatDate(file.created_at)}
                    </div>
                </div>
                <div class="file-item-actions">
                    <button class="btn-download" onclick="downloadFile('${file.file_id}')">
                        ⬇️ Baixar
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar arquivos:', error);
        filesList.innerHTML = `
            <div class="empty-state">
                <p>❌ Erro ao carregar arquivos</p>
                <button class="btn-secondary" onclick="loadFiles()">Tentar novamente</button>
            </div>
        `;
    }
}

/**
 * Faz download de um arquivo
 */
function downloadFile(fileId) {
    // Abre a página de download com o ID do arquivo
    window.open(`${window.location.origin}/download.html?id=${fileId}`, '_blank');
}

// ========================
// Funções Auxiliares
// ========================

/**
 * Formata tamanho de arquivo
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formata data
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ========================
// Inicialização
// ========================

// Carrega arquivos ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    loadFiles();
    
    // Verifica conexão com API
    checkAPIConnection();
});

/**
 * Verifica se o backend está rodando
 */
async function checkAPIConnection() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (!response.ok) {
            console.warn('⚠️ Backend não está respondendo corretamente');
        }
    } catch (error) {
        console.error('❌ Não foi possível conectar ao backend:', error);
        console.log('Certifique-se de que o backend está rodando em:', API_URL);
    }
}