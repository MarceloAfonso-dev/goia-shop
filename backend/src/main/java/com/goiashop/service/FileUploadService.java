package com.goiashop.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Serviço de upload de arquivos que delega para o ImageStorageFilesystem.
 * Mantido para compatibilidade com código existente.
 * 
 * @deprecated Use ImageStorageFilesystem diretamente para novas implementações.
 */
@Service
public class FileUploadService {
    
    @Autowired
    private ImageStorageFilesystem imageStorage;
    
    /**
     * Faz upload de um arquivo de imagem
     * 
     * @param file Arquivo a ser enviado
     * @param subDir Subdiretório (ex: "produtos")
     * @return Caminho relativo do arquivo
     * @throws IOException Se houver erro no upload
     */
    public String uploadFile(MultipartFile file, String subDir) throws IOException {
        ImageStorageFilesystem.ImageStorageResult result = imageStorage.saveImage(file, subDir);
        return result.getRelativePath();
    }
    
    /**
     * Faz upload e retorna dados completos do arquivo
     * 
     * @param file Arquivo a ser enviado
     * @param subDir Subdiretório
     * @return Resultado completo do upload
     * @throws IOException Se houver erro no upload
     */
    public ImageStorageFilesystem.ImageStorageResult uploadFileComplete(MultipartFile file, String subDir) throws IOException {
        return imageStorage.saveImage(file, subDir);
    }
    
    /**
     * Gera URL pública para um arquivo
     * 
     * @param relativePath Caminho relativo do arquivo
     * @return URL pública
     */
    public String getFileUrl(String relativePath) {
        // Esta função não é mais necessária pois a URL já vem do ImageStorageResult
        // Mantida para compatibilidade
        return "http://localhost:8080/uploads/" + relativePath;
    }
    
    /**
     * Remove um arquivo
     * 
     * @param relativePath Caminho relativo do arquivo
     */
    public void deleteFile(String relativePath) {
        imageStorage.deleteImage(relativePath);
    }
    
    /**
     * Valida se é um arquivo de imagem válido
     * 
     * @param file Arquivo a ser validado
     * @return true se for uma imagem válida
     */
    public boolean isValidImageFile(MultipartFile file) {
        try {
            imageStorage.saveImage(file, "temp");
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}