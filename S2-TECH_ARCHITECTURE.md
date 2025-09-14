# S2-TECH: Adapter Filesystem para Armazenamento de Imagens

## Visão Geral

O **S2-TECH** implementa um adapter filesystem robusto para armazenamento de imagens de produtos, preparado para migração futura para Amazon S3. Esta implementação segue os princípios SOLID e oferece alta segurança e configurabilidade.

## Arquitetura Implementada

### 1. ImageStorageFilesystem.java
**Localização**: `backend/src/main/java/com/goiashop/service/ImageStorageFilesystem.java`

**Responsabilidades**:
- Armazenamento seguro de imagens no sistema de arquivos local
- Validação avançada de arquivos (MIME types, magic bytes, tamanho)
- Organização automática por ano/mês
- Geração de URLs públicas
- Sanitização de nomes de arquivos
- Operações de exclusão segura

**Funcionalidades de Segurança**:
```java
// Validação de Magic Bytes para prevenir uploads maliciosos
private boolean isValidImageByMagicBytes(MultipartFile file)

// Sanitização de nomes de arquivos
private String sanitizeFileName(String fileName)

// Validação de MIME types permitidos
ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
```

**Organização de Arquivos**:
```
uploads/
└── produtos/
    ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
    ├── b2c3d4e5-f6g7-8901-bcde-f23456789012.png
    └── c3d4e5f6-g7h8-9012-cdef-g34567890123.webp
```

**Nota**: A organização por ano/mês foi temporariamente removida para manter compatibilidade com a estrutura existente. Pode ser reintroduzida em versões futuras quando necessário.

### 2. Configurações Environment-Ready

**Arquivo**: `backend/src/main/resources/application.properties`

```properties
# Configurações de Upload de Imagens
app.upload.dir=${UPLOAD_DIR:uploads}
app.public.base-url=${PUBLIC_BASE_URL:http://localhost:8080}
app.image.max-size=${IMAGE_MAX_SIZE:5242880}
app.image.allowed-types=${IMAGE_ALLOWED_TYPES:image/jpeg,image/jpg,image/png,image/gif,image/webp}
```

**Variáveis de Ambiente Suportadas**:
- `UPLOAD_DIR`: Diretório base para uploads (padrão: "uploads")
- `PUBLIC_BASE_URL`: URL base pública (padrão: "http://localhost:8080")
- `IMAGE_MAX_SIZE`: Tamanho máximo em bytes (padrão: 5MB)
- `IMAGE_ALLOWED_TYPES`: Tipos MIME permitidos (separados por vírgula)

### 3. Integração com ProdutoService

**Refatoração Completa**:
```java
// Antes (FileUploadService - deprecated)
String relativePath = fileUploadService.uploadFile(file, "produtos");
String url = fileUploadService.getFileUrl(relativePath);

// Depois (ImageStorageFilesystem - novo)
ImageStorageFilesystem.ImageStorageResult uploadResult = imageStorage.saveImage(file, "produtos");
imagem.setNomeArquivo(uploadResult.getOriginalName());
imagem.setCaminhoArquivo(uploadResult.getRelativePath());
imagem.setUrlArquivo(uploadResult.getPublicUrl());
imagem.setTamanhoArquivo(uploadResult.getFileSize());
imagem.setTipoMime(uploadResult.getMimeType());
```

### 4. Backward Compatibility

**FileUploadService.java** foi refatorado para manter compatibilidade:
```java
@Deprecated
@Service
public class FileUploadService {
    
    @Autowired
    private ImageStorageFilesystem imageStorage;
    
    // Métodos delegam para a nova implementação
    public String uploadFile(MultipartFile file, String subfolder) throws IOException {
        return imageStorage.saveImage(file, subfolder).getRelativePath();
    }
}
```

## Benefícios da Nova Arquitetura

### 1. **Segurança Avançada**
- Validação de magic bytes previne uploads de arquivos maliciosos
- Sanitização de nomes de arquivos previne ataques de path traversal
- Validação rigorosa de MIME types
- Controle de tamanho de arquivo

### 2. **Escalabilidade**
- UUIDs únicos evitam conflitos de nomes
- Estrutura de diretórios simples e compatível
- Preparado para migração S3 futura
- Organização por data pode ser reintroduzida quando necessário

### 3. **Configurabilidade**
- Todas as configurações são externalizáveis via environment variables
- Suporte a diferentes ambientes (dev, staging, prod)
- Configuração de limites ajustável

### 4. **Manutenibilidade**
- Código limpo seguindo princípios SOLID
- Documentação inline completa
- Separação clara de responsabilidades
- Testes unitários implementáveis

## Migração Futura para S3

### Estratégia de Migração

1. **Criar ImageStorageS3.java** implementando a mesma interface
2. **Configurar perfis Spring** para alternar entre filesystem e S3
3. **Manter URLs relativas** para facilitar migração de dados
4. **Implementar sincronização gradual** de arquivos existentes
5. **Reintroduzir organização por data** quando migrar para S3

**Nota**: A estrutura atual é compatível com migração S3, mantendo a mesma interface de métodos.

## Histórico de Correções

### Versão 1.1 - Correção de Compatibilidade (12/09/2025)

**Problema Identificado**:
- A organização automática por ano/mês estava causando `FileNotFoundException`
- Conflito com a estrutura de arquivos existente
- Incompatibilidade com o path resolution do Tomcat

**Solução Aplicada**:
```java
// Antes (causando erro):
String yearMonth = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
String relativePath = subfolder + "/" + yearMonth + "/" + fileName;

// Depois (corrigido):
String relativePath = subfolder + "/" + fileName;
```

**Resultados**:
- ✅ Upload de imagens funcionando corretamente
- ✅ Compatibilidade total com arquivos existentes
- ✅ Todas as funcionalidades de segurança mantidas
- ✅ Preparação S3 preservada

### Exemplo de Configuração S3 Future-Ready:
```properties
# Perfil de Produção
spring.profiles.active=production
app.storage.type=${STORAGE_TYPE:s3}
app.s3.bucket=${S3_BUCKET:goia-shop-images}
app.s3.region=${S3_REGION:us-east-1}
```

## Como Testar

### 1. Teste de Upload
```bash
curl -X POST http://localhost:8080/api/produtos/1/imagens \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "isPrincipal=true"
```

### 2. Verificar Estrutura de Arquivos
```bash
ls -la backend/uploads/produtos/2025/09/
```

### 3. Teste de Validação de Segurança
```bash
# Tentar upload de arquivo não-imagem (deve falhar)
curl -X POST http://localhost:8080/api/produtos/1/imagens \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@malicious.exe"
```

## Configuração Docker

```dockerfile
# Dockerfile já configurado com volumes persistentes
VOLUME ["/app/uploads"]

# docker-compose.yml já mapeado
volumes:
  - ./backend/uploads:/app/uploads
```

## Status da Implementação

✅ **Completo**:
- [x] ImageStorageFilesystem.java com validações de segurança
- [x] Configurações environment-ready
- [x] Integração com ProdutoService
- [x] Backward compatibility com FileUploadService
- [x] Documentação técnica
- [x] Estrutura compatível com sistema existente
- [x] Suporte a containers Docker

✅ **Funcionalidades de Segurança**:
- [x] Validação de magic bytes
- [x] Sanitização de nomes de arquivos
- [x] Controle de MIME types
- [x] Limitação de tamanho de arquivo
- [x] Geração de UUIDs únicos

✅ **Preparação S3**:
- [x] Interface abstrata preparada
- [x] URLs relativas para migração
- [x] Configurações externalizáveis
- [x] Estrutura de pastas compatível

🔧 **Ajustes Realizados**:
- [x] Correção de compatibilidade com estrutura existente
- [x] Simplificação de diretórios para evitar conflitos
- [x] Manutenção de todas as funcionalidades de segurança
- [x] Preservação de arquivos existentes

## Conclusão

O **S2-TECH** está 100% implementado e oferece uma base sólida para armazenamento de imagens. A arquitetura permite fácil migração para S3 no futuro, mantendo alta segurança e performance no ambiente atual.

**Principais Melhorias Implementadas**:
- ✅ Validações avançadas de segurança (magic bytes, MIME types)
- ✅ Configuração externalizável via environment variables
- ✅ Arquitetura preparada para S3
- ✅ Compatibilidade total com sistema existente
- ✅ Preservação de todos os arquivos anteriores

**Correções Aplicadas**:
- 🔧 Simplificação da estrutura de diretórios para compatibilidade
- 🔧 Resolução de conflitos de path com Tomcat
- 🔧 Manutenção de todas as funcionalidades de segurança

O código está pronto para produção e seguindo as melhores práticas de desenvolvimento Java Spring Boot, com total compatibilidade retroativa.