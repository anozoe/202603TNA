package com.example.tna.repository;

import com.example.tna.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    Optional<UserEntity> findByEmailAndPassword(String email, String password);

    boolean existsByEmail(String email);

    List<UserEntity> findAllByOrderByIdAsc();
}