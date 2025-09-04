package com.goiashop.service;

import com.goiashop.model.User;
import com.goiashop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> listarTodos() {
        return userRepository.findAll();
    }

    public User buscarPorId(Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.orElse(null);
    }

    public List<User> listarPorGrupo(User.UserGroup grupo) {
        return userRepository.findByGrupo(grupo);
    }

    public List<User> listarPorStatus(User.UserStatus status) {
        return userRepository.findByStatus(status);
    }
}
