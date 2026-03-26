/*package com.example.tna.old;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class TnaRequest {
    
    @Size(max = 50)
    String email;


    @Size(max = 16, min = 8)
    String password;

   
    @Size(max = 30)
    String name;

    @Max(6)
    int yearMonth;

    @NotNull
    LocalDate workDate;

    LocalTime startTime;

    LocalTime endTime;

    LocalTime breakTime;

    LocalTime actualWorkTime;

    @NotNull
    @Size(max = 2)
    String workStatus;
}*/