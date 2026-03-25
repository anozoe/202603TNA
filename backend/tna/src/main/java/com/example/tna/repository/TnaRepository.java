package com.example.tna.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.tna.entity.TnaEntity;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface TnaRepository extends JpaRepository<TnaEntity, Integer>{
    List<TnaEntity> findByUserIdAndWorkDateBetween(
        Integer userId,
        LocalDate startDate,
        LocalDate endDate
    );
}