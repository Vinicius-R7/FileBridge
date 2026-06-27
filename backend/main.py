"""
FileBridge API - Backend FastAPI
Gerencia upload e download de arquivos via Supabase Storage
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import uuid
from datetime import datetime

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

# Inicializa FastAPI
app = FastAPI(
    title="FileBridge API",
    description="API para transferência de arquivos entre dispositivos",
    version="1.0.0"
)

# Configuração de CORS (permite requisições do frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique o domínio do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "filebridge-uploads"

# Validação das variáveis de ambiente
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "❌ ERRO: Configure as variáveis SUPABASE_URL e SUPABASE_KEY no arquivo .env"
    )

# Cria cliente do Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@app.get("/")
async def root():
    """Endpoint raiz - verifica se a API está funcionando"""
    return {
        "message": "FileBridge API está funcionando! 🌉",
        "version": "1.0.0",
        "endpoints": {
            "upload": "/upload",
            "download": "/download/{file_id}",
            "list": "/files"
        }
    }

MAX_FILES = 10

def cleanup_old_files():
    """
    Remove arquivos mais antigos se ultrapassar o limite MAX_FILES
    """
    try:
        # Lista todos os arquivos ordenados por data
        files = supabase.storage.from_(BUCKET_NAME).list(
            options={"sortBy": {"column": "created_at", "order": "asc"}}
        )
        
        if not files:
            return
            
        # Se ultrapassou o limite, apaga os mais antigos
        if len(files) > MAX_FILES:
            files_to_delete = files[:len(files) - MAX_FILES]
            
            for file in files_to_delete:
                supabase.storage.from_(BUCKET_NAME).remove([file['name']])
                print(f"🗑️ Arquivo apagado: {file['name']}")
                
    except Exception as e:
        print(f"⚠️ Erro na limpeza: {str(e)}")


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Faz upload de um arquivo para o Supabase Storage
    
    Args:
        file: Arquivo enviado pelo usuário
        
    Returns:
        JSON com file_id, URL pública e informações do arquivo
    """
    try:
        # Gera ID único para o arquivo
        file_id = str(uuid.uuid4())
        
        # Pega extensão do arquivo original
        file_extension = os.path.splitext(file.filename)[1]
        
        # Nome do arquivo no storage: id_original-name.ext
        storage_filename = f"{file_id}_{file.filename}"
        
        # Lê o conteúdo do arquivo
        file_content = await file.read()
        
        # Upload para o Supabase Storage
        response = supabase.storage.from_(BUCKET_NAME).upload(
            path=storage_filename,
            file=file_content,
            file_options={
                "content-type": file.content_type,
                "cache-control": "3600"
            }
        )
        
        # Gera URL pública para download
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(storage_filename)

        # Limpeza automática: mantém máximo de 10 arquivos
        cleanup_old_files()
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "size": len(file_content),
            "content_type": file.content_type,
            "public_url": public_url,
            "upload_date": datetime.now().isoformat(),
            "message": "✅ Arquivo enviado com sucesso!"
        }
        
    except Exception as e:
        print("❌ ERRO DETALHADO:", e)
        print("❌ TIPO DO ERRO:", type(e))
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao fazer upload: {str(e)}"
        )


@app.get("/download/{file_id}")
async def get_download_url(file_id: str):
    """
    Retorna informações e URL de download de um arquivo
    
    Args:
        file_id: ID único do arquivo
        
    Returns:
        JSON com URL de download e metadados
    """
    try:
        # Lista arquivos no bucket que começam com o file_id
        files = supabase.storage.from_(BUCKET_NAME).list()
        
        # Procura o arquivo pelo ID
        matching_file = None
        for f in files:
            if f['name'].startswith(file_id):
                matching_file = f
                break
        
        if not matching_file:
            raise HTTPException(
                status_code=404,
                detail="❌ Arquivo não encontrado"
            )
        
        # Gera URL pública
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(matching_file['name'])
        
        # Extrai nome original do arquivo
        original_filename = matching_file['name'].split('_', 1)[1] if '_' in matching_file['name'] else matching_file['name']
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": original_filename,
            "download_url": public_url,
            "size": matching_file.get('metadata', {}).get('size', 'unknown'),
            "created_at": matching_file.get('created_at', 'unknown')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar arquivo: {str(e)}"
        )
    

from fastapi.responses import RedirectResponse

@app.get("/force-download/{file_id}")
async def force_download(file_id: str):
    """
    Força o download do arquivo via redirect com header de download
    """
    try:
        # Lista arquivos no bucket
        files = supabase.storage.from_(BUCKET_NAME).list()
        
        # Procura o arquivo pelo ID
        matching_file = None
        for f in files:
            if f['name'].startswith(file_id):
                matching_file = f
                break
        
        if not matching_file:
            raise HTTPException(status_code=404, detail="Arquivo não encontrado")
        
        # Gera URL pública com download forçado
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(
            matching_file['name']
        )
        
        # Adiciona parâmetro de download
        download_url = f"{public_url}?download="
        
        return RedirectResponse(url=download_url)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")


@app.get("/files")
async def list_files():
    """
    Lista todos os arquivos no storage
    
    Returns:
        JSON com lista de arquivos e seus metadados
    """
    try:
        # Lista todos os arquivos no bucket
        files = supabase.storage.from_(BUCKET_NAME).list()
        
        # Formata a resposta
        formatted_files = []
        for f in files:
            # Extrai file_id e nome original
            file_id = f['name'].split('_')[0] if '_' in f['name'] else 'unknown'
            original_name = f['name'].split('_', 1)[1] if '_' in f['name'] else f['name']
            
            formatted_files.append({
                "file_id": file_id,
                "filename": original_name,
                "size": f.get('metadata', {}).get('size', 0),
                "created_at": f.get('created_at', 'unknown'),
                "download_url": supabase.storage.from_(BUCKET_NAME).get_public_url(f['name'])
            })
        
        return {
            "success": True,
            "total_files": len(formatted_files),
            "files": formatted_files
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao listar arquivos: {str(e)}"
        )


# Endpoint de saúde para monitoramento
@app.get("/health")
async def health_check():
    """Verifica se a API e conexão com Supabase estão OK"""
    try:
        # Testa conexão com Supabase
        supabase.storage.from_(BUCKET_NAME).list(limit=1)
        return {
            "status": "healthy",
            "supabase_connection": "ok",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )


if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Iniciando FileBridge API...")
    print(f"📡 Supabase URL: {SUPABASE_URL}")
    print(f"🗂️  Bucket: {BUCKET_NAME}")
    print("🌐 Acesse: http://localhost:8000")
    print("📚 Documentação: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-reload quando o código mudar
    )