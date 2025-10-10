package com.goiashop.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Serviço responsável pelo armazenamento de imagens no sistema de arquivos local.
 * 
 * Este serviço pode ser facilmente substituído por uma implementação S3 no futuro,
 * mantendo a mesma interface.
 * 
 * Funcionalidades:
 * - Salvar imagens com UUID único
 * - Organizar por ano/mês
 * - Validar MIME types e tamanhos
 * - Sanitizar nomes de arquivos
 * - Deletar imagens
 */
@Service
public class ImageStorageFilesystem {
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    @Value("${app.public.base-url:http://localhost:8080}")
    private String publicBaseUrl;
    
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    /**
     * Salva uma imagem no sistema de arquivos
     * 
     * @param file Arquivo a ser salvo
     * @param subfolder Subpasta (ex: "produtos")
     * @return Dados do arquivo salvo
     * @throws IOException Se houver erro no salvamento
     * @throws IllegalArgumentException Se o arquivo não for válido
     */
    public ImageStorageResult saveImage(MultipartFile file, String subfolder) throws IOException {
        // 1. Validações de segurança
        validateFile(file);
        
        // 2. Sanitizar nome original
        String originalName = sanitizeFileName(file.getOriginalFilename());
        
        // 3. Gerar UUID único
        String uuid = UUID.randomUUID().toString();
        String extension = getFileExtension(originalName);
        String fileName = uuid + "." + extension;
        
        // 4. Manter compatibilidade - sem organização por data por enquanto
        String relativePath = subfolder + "/" + fileName;
        
        // 5. Criar diretório se não existir
        Path fullPath = Paths.get(uploadDir, relativePath);
        Files.createDirectories(fullPath.getParent());
        
        // 6. Salvar arquivo usando Files.copy ao invés de transferTo
        try (var inputStream = file.getInputStream()) {
            Files.copy(inputStream, fullPath);
        }
        
        // 7. Gerar URL pública
        String publicUrl = publicBaseUrl + "/" + uploadDir + "/" + relativePath;
        
        return new ImageStorageResult(
            originalName,
            fileName,
            relativePath,
            publicUrl,
            file.getSize(),
            file.getContentType()
        );
    }
    
    /**
     * Deleta uma imagem do sistema de arquivos
     * 
     * @param relativePath Caminho relativo da imagem
     * @return true se deletou com sucesso, false se não encontrou
     */
    public boolean deleteImage(String relativePath) {
        try {
            Path fullPath = Paths.get(uploadDir, relativePath);
            return Files.deleteIfExists(fullPath);
        } catch (IOException e) {
            return false;
        }
    }
    
    /**
     * Valida se o arquivo é seguro para upload
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo não pode estar vazio");
        }
        
        // Validar tamanho
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Arquivo muito grande. Máximo: " + (MAX_FILE_SIZE / 1024 / 1024) + "MB");
        }
        
        // Validar MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido. Permitidos: " + ALLOWED_MIME_TYPES);
        }
        
        // Validar extensão do arquivo
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do arquivo é obrigatório");
        }
        
        String extension = getFileExtension(originalName).toLowerCase();
        List<String> allowedExtensions = Arrays.asList("jpg", "jpeg", "png", "gif", "webp");
        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("Extensão não permitida: " + extension);
        }
        
        // Validação adicional de cabeçalho (magic bytes)
        validateFileHeader(file);
    }
    
    /**
     * Valida os magic bytes do arquivo para garantir que é realmente uma imagem
     */
    private void validateFileHeader(MultipartFile file) {
        try {
            byte[] header = new byte[12];
            int bytesRead = file.getInputStream().read(header);
            
            System.out.println("🔍 Validando arquivo: " + file.getOriginalFilename());
            System.out.println("🔍 Tamanho do arquivo: " + file.getSize());
            System.out.println("🔍 Content-Type: " + file.getContentType());
            System.out.println("🔍 Bytes lidos: " + bytesRead);
            
            if (bytesRead < 4) {
                System.out.println("❌ Arquivo muito pequeno: " + bytesRead + " bytes");
                throw new IllegalArgumentException("Arquivo corrompido ou muito pequeno");
            }
            
            // Log dos primeiros bytes em hex
            StringBuilder hexString = new StringBuilder();
            for (int i = 0; i < Math.min(bytesRead, 12); i++) {
                hexString.append(String.format("%02X ", header[i]));
            }
            System.out.println("🔍 Magic bytes: " + hexString.toString());
            
            // Verificar magic bytes para diferentes formatos
            boolean isJpegValid = isJpeg(header);
            boolean isPngValid = isPng(header);
            boolean isGifValid = isGif(header);
            boolean isWebpValid = isWebp(header);
            
            System.out.println("🔍 JPEG válido: " + isJpegValid);
            System.out.println("🔍 PNG válido: " + isPngValid);
            System.out.println("🔍 GIF válido: " + isGifValid);
            System.out.println("🔍 WEBP válido: " + isWebpValid);
            
            if (isJpegValid || isPngValid || isGifValid || isWebpValid) {
                System.out.println("✅ Arquivo é uma imagem válida!");
                return; // Arquivo válido
            }
            
            System.out.println("❌ Nenhum formato válido detectado!");
            throw new IllegalArgumentException("Arquivo não é uma imagem válida");
            
        } catch (IOException e) {
            System.out.println("❌ Erro de IO: " + e.getMessage());
            throw new IllegalArgumentException("Erro ao ler cabeçalho do arquivo");
        }
    }
    
    private boolean isJpeg(byte[] header) {
        return header.length >= 3 && 
               header[0] == (byte) 0xFF && 
               header[1] == (byte) 0xD8 && 
               header[2] == (byte) 0xFF;
    }
    
    private boolean isPng(byte[] header) {
        return header.length >= 8 && 
               header[0] == (byte) 0x89 && 
               header[1] == 0x50 && 
               header[2] == 0x4E && 
               header[3] == 0x47 && 
               header[4] == 0x0D && 
               header[5] == 0x0A && 
               header[6] == 0x1A && 
               header[7] == 0x0A;
    }
    
    private boolean isGif(byte[] header) {
        return header.length >= 6 && 
               header[0] == 0x47 && 
               header[1] == 0x49 && 
               header[2] == 0x46 && 
               header[3] == 0x38 && 
               (header[4] == 0x37 || header[4] == 0x39) && 
               header[5] == 0x61;
    }
    
    private boolean isWebp(byte[] header) {
        return header.length >= 12 && 
               header[0] == 0x52 && 
               header[1] == 0x49 && 
               header[2] == 0x46 && 
               header[3] == 0x46 && 
               header[8] == 0x57 && 
               header[9] == 0x45 && 
               header[10] == 0x42 && 
               header[11] == 0x50;
    }
    
    /**
     * Sanitiza o nome do arquivo removendo caracteres perigosos
     */
    private String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return "unnamed";
        }
        
        // Remover path traversal e caracteres perigosos
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_")
                      .replaceAll("_{2,}", "_")
                      .replaceAll("^_+|_+$", "");
    }
    
    /**
     * Extrai a extensão do arquivo
     */
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot == -1 || lastDot == fileName.length() - 1) {
            return "bin";
        }
        return fileName.substring(lastDot + 1).toLowerCase();
    }
    
    /**
     * Classe para retornar dados do arquivo salvo
     */
    public static class ImageStorageResult {
        private final String originalName;
        private final String fileName;
        private final String relativePath;
        private final String publicUrl;
        private final long fileSize;
        private final String mimeType;
        
        public ImageStorageResult(String originalName, String fileName, String relativePath, 
                                String publicUrl, long fileSize, String mimeType) {
            this.originalName = originalName;
            this.fileName = fileName;
            this.relativePath = relativePath;
            this.publicUrl = publicUrl;
            this.fileSize = fileSize;
            this.mimeType = mimeType;
        }
        
        // Getters
        public String getOriginalName() { return originalName; }
        public String getFileName() { return fileName; }
        public String getRelativePath() { return relativePath; }
        public String getPublicUrl() { return publicUrl; }
        public long getFileSize() { return fileSize; }
        public String getMimeType() { return mimeType; }
    }
}