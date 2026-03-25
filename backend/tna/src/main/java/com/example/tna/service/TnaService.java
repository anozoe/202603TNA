package com.example.tna.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.tna.dto.TnaRequest;
import com.example.tna.dto.TnaResponse;
import com.example.tna.entity.TnaEntity;
import com.example.tna.repository.TnaRepository;

@Service
public class TnaService {
    private final TnaRepository tnaRepository;

    public TnaService(TnaRepository tnaRepository) {
        this.tnaRepository = tnaRepository;
    }

    public List<TnaResponse> getAttendanceById(Integer yearMonth, Integer id) {
        int year = yearMonth / 100;
        int month = yearMonth % 100;
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = YearMonth.of(year, month).atEndOfMonth();
        List<TnaEntity> tnaEntityList = tnaRepository.findByUserIdAndWorkDateBetween(id, startDate, endDate);
        List<TnaResponse> tnaResponseList = new ArrayList<>();
        for (TnaEntity entity : tnaEntityList) {
            TnaResponse response = new TnaResponse();
            BeanUtils.copyProperties(entity, response);
            tnaResponseList.add(response);
        }
        return tnaResponseList;
    }

    public TnaResponse updateAttendance(Integer yearMonth, Integer id, TnaRequest request) {
        TnaEntity entity = tnaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("データが見つかりません"));

        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setBreakTime(request.getBreakTime());
        entity.setActualWorkTime(request.getActualWorkTime());
        entity.setWorkStatus(request.getWorkStatus());

        TnaEntity saved = tnaRepository.save(entity);

        TnaResponse response = new TnaResponse();
        BeanUtils.copyProperties(saved, response);
        return response;
    }
}