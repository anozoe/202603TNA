package com.example.tna.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tna.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Integer> {

}