package com.example.tna.service;

import com.example.tna.dto.AttendanceRequestDto;
import com.example.tna.dto.AttendanceResponseDto;
import com.example.tna.dto.AttendanceRowDto;
import com.example.tna.dto.AttendanceSummaryDto;
import com.example.tna.entity.Attendance;
import com.example.tna.exception.BusinessException;
import com.example.tna.repository.AttendanceRepository;
import com.example.tna.util.AttendanceWorkStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("H:mm");

    public AttendanceResponseDto getAttendance(Integer userId, Integer year, Integer month) {
        validateSearchCondition(userId, year, month);

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate fromDate = yearMonth.atDay(1);
        LocalDate toDate = yearMonth.atEndOfMonth();

        List<Attendance> attendanceEntityList =
                attendanceRepository.findByUserIdAndWorkDateBetweenOrderByWorkDateAsc(userId, fromDate, toDate);

        Map<LocalDate, Attendance> attendanceMap = new HashMap<>();
        for (Attendance attendanceEntity : attendanceEntityList) {
            attendanceMap.put(attendanceEntity.getWorkDate(), attendanceEntity);
        }

        List<AttendanceRowDto> attendanceRowDtoList = new ArrayList<>();

        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            LocalDate workDate = yearMonth.atDay(day);
            AttendanceRowDto attendanceRowDto = createDefaultAttendanceRowDto(workDate);

            Attendance attendanceEntity = attendanceMap.get(workDate);
            if (attendanceEntity != null) {
                attendanceRowDto = convertEntityToRowDto(attendanceEntity);
            }

            attendanceRowDtoList.add(attendanceRowDto);
        }

        AttendanceSummaryDto attendanceSummaryDto = createAttendanceSummary(attendanceRowDtoList);

        AttendanceResponseDto attendanceResponseDto = new AttendanceResponseDto();
        attendanceResponseDto.setUserId(userId);
        attendanceResponseDto.setYear(year);
        attendanceResponseDto.setMonth(month);
        attendanceResponseDto.setAttendanceRowList(attendanceRowDtoList);
        attendanceResponseDto.setAttendanceSummary(attendanceSummaryDto);

        return attendanceResponseDto;
    }

    @Transactional
    public AttendanceResponseDto saveAttendance(AttendanceRequestDto attendanceRequestDto) {
        validateSaveRequest(attendanceRequestDto);

        Integer userId = attendanceRequestDto.getUserId();
        Integer year = attendanceRequestDto.getYear();
        Integer month = attendanceRequestDto.getMonth();

        for (AttendanceRowDto attendanceRowDto : attendanceRequestDto.getAttendanceRowList()) {
            saveAttendanceRow(userId, year, month, attendanceRowDto);
        }

        return getAttendance(userId, year, month);
    }

    private void saveAttendanceRow(Integer userId, Integer year, Integer month, AttendanceRowDto attendanceRowDto) {
        LocalDate workDate = parseDate(attendanceRowDto.getWorkDate());

        if (workDate == null) {
            throw new BusinessException("E001", "勤務日");
        }

        if (workDate.getYear() != year || workDate.getMonthValue() != month) {
            throw new BusinessException("E002", "勤務日");
        }

        Attendance attendanceEntity = attendanceRepository
                .findByUserIdAndWorkDate(userId, workDate)
                .orElseGet(Attendance::new);

        BeanUtils.copyProperties(
                attendanceRowDto,
                attendanceEntity,
                "id",
                "workDate",
                "startTime",
                "endTime",
                "breakTime",
                "actualWorkTime",
                "createdAt",
                "createdBy",
                "updatedAt",
                "updatedBy",
                "userId"
        );

        attendanceEntity.setUserId(userId);
        attendanceEntity.setWorkDate(workDate);

        String workStatus = normalizeWorkStatus(attendanceRowDto.getWorkStatus());
        attendanceEntity.setWorkStatus(workStatus);

        if (AttendanceWorkStatus.isHolidayLike(workStatus)) {
            attendanceEntity.setStartTime(null);
            attendanceEntity.setEndTime(null);
            attendanceEntity.setBreakTime(null);
            attendanceEntity.setActualWorkTime(LocalTime.of(0, 0));
        } else {
            LocalTime startTime = parseTime(attendanceRowDto.getStartTime());
            LocalTime endTime = parseTime(attendanceRowDto.getEndTime());
            LocalTime breakTime = parseTime(attendanceRowDto.getBreakTime());

            validateTimeRelation(startTime, endTime);

            attendanceEntity.setStartTime(startTime);
            attendanceEntity.setEndTime(endTime);
            attendanceEntity.setBreakTime(breakTime);
            attendanceEntity.setActualWorkTime(calculateActualWorkTime(startTime, endTime, breakTime));
        }

        LocalDateTime now = LocalDateTime.now();

        if (attendanceEntity.getId() == null) {
            attendanceEntity.setCreatedAt(now);
            attendanceEntity.setCreatedBy("system");
        }

        attendanceEntity.setUpdatedAt(now);
        attendanceEntity.setUpdatedBy("system");

        attendanceRepository.save(attendanceEntity);
    }

    private AttendanceRowDto createDefaultAttendanceRowDto(LocalDate workDate) {
        AttendanceRowDto attendanceRowDto = new AttendanceRowDto();
        attendanceRowDto.setWorkDate(workDate.format(DATE_FORMATTER));
        attendanceRowDto.setStartTime("");
        attendanceRowDto.setEndTime("");
        attendanceRowDto.setBreakTime("");
        attendanceRowDto.setActualWorkTime("0:00");
        attendanceRowDto.setWorkStatus(AttendanceWorkStatus.NONE);
        return attendanceRowDto;
    }

    private AttendanceRowDto convertEntityToRowDto(Attendance attendanceEntity) {
        AttendanceRowDto attendanceRowDto = new AttendanceRowDto();

        BeanUtils.copyProperties(
                attendanceEntity,
                attendanceRowDto,
                "workDate",
                "startTime",
                "endTime",
                "breakTime",
                "actualWorkTime"
        );

        attendanceRowDto.setWorkDate(
                attendanceEntity.getWorkDate() == null ? "" : attendanceEntity.getWorkDate().format(DATE_FORMATTER)
        );
        attendanceRowDto.setStartTime(formatTime(attendanceEntity.getStartTime()));
        attendanceRowDto.setEndTime(formatTime(attendanceEntity.getEndTime()));
        attendanceRowDto.setBreakTime(formatTime(attendanceEntity.getBreakTime()));
        attendanceRowDto.setActualWorkTime(formatTime(attendanceEntity.getActualWorkTime()));

        if (attendanceRowDto.getWorkStatus() == null) {
            attendanceRowDto.setWorkStatus(AttendanceWorkStatus.NONE);
        }

        return attendanceRowDto;
    }

    private AttendanceSummaryDto createAttendanceSummary(List<AttendanceRowDto> attendanceRowDtoList) {
        int totalWorkMinutes = 0;
        int workDays = 0;

        for (AttendanceRowDto attendanceRowDto : attendanceRowDtoList) {
            int actualWorkMinutes = timeTextToMinutes(attendanceRowDto.getActualWorkTime());
            totalWorkMinutes += actualWorkMinutes;

            String workStatus = normalizeWorkStatus(attendanceRowDto.getWorkStatus());
            if (!AttendanceWorkStatus.isHolidayLike(workStatus) && actualWorkMinutes > 0) {
                workDays++;
            }
        }

        AttendanceSummaryDto attendanceSummaryDto = new AttendanceSummaryDto();
        attendanceSummaryDto.setTotalWorkTime(minutesToTimeText(totalWorkMinutes));
        attendanceSummaryDto.setWorkDays(workDays);

        return attendanceSummaryDto;
    }

    private void validateSearchCondition(Integer userId, Integer year, Integer month) {
        if (userId == null) {
            throw new BusinessException("E001", "ユーザID");
        }
        if (year == null) {
            throw new BusinessException("E001", "年");
        }
        if (month == null) {
            throw new BusinessException("E001", "月");
        }
        if (month < 1 || month > 12) {
            throw new BusinessException("E002", "月");
        }
    }

    private void validateSaveRequest(AttendanceRequestDto attendanceRequestDto) {
        if (attendanceRequestDto == null) {
            throw new BusinessException("E001", "勤怠更新リクエスト");
        }

        validateSearchCondition(
                attendanceRequestDto.getUserId(),
                attendanceRequestDto.getYear(),
                attendanceRequestDto.getMonth()
        );

        if (attendanceRequestDto.getAttendanceRowList() == null) {
            throw new BusinessException("E001", "勤怠明細");
        }
    }

    private void validateTimeRelation(LocalTime startTime, LocalTime endTime) {
        if (startTime != null && endTime != null && !startTime.isBefore(endTime)) {
            throw new BusinessException("E002", "出勤時刻と退勤時刻");
        }
    }

    private String normalizeWorkStatus(String workStatus) {
        return workStatus == null ? AttendanceWorkStatus.NONE : workStatus;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalDate.parse(value, DATE_FORMATTER);
    }

    private LocalTime parseTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalTime.parse(normalizeTimeText(value), TIME_FORMATTER);
    }

    private String formatTime(LocalTime value) {
        if (value == null) {
            return "";
        }
        return value.format(TIME_FORMATTER);
    }

    private LocalTime calculateActualWorkTime(LocalTime startTime, LocalTime endTime, LocalTime breakTime) {
        if (startTime == null || endTime == null || breakTime == null) {
            return LocalTime.of(0, 0);
        }

        int startMinutes = startTime.getHour() * 60 + startTime.getMinute();
        int endMinutes = endTime.getHour() * 60 + endTime.getMinute();
        int breakMinutes = breakTime.getHour() * 60 + breakTime.getMinute();

        int result = endMinutes - startMinutes - breakMinutes;
        result = Math.max(result, 0);

        return LocalTime.of(result / 60, result % 60);
    }

    private int timeTextToMinutes(String value) {
        if (value == null || value.isBlank() || !value.contains(":")) {
            return 0;
        }

        String[] splitValue = value.split(":");
        int hour = Integer.parseInt(splitValue[0]);
        int minute = Integer.parseInt(splitValue[1]);

        return hour * 60 + minute;
    }

    private String minutesToTimeText(int minutes) {
        int hour = minutes / 60;
        int minute = minutes % 60;
        return hour + ":" + String.format("%02d", minute);
    }

    private String normalizeTimeText(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }

        String[] splitValue = value.split(":");
        if (splitValue.length != 2) {
            return value;
        }

        String hour = String.format("%02d", Integer.parseInt(splitValue[0]));
        String minute = String.format("%02d", Integer.parseInt(splitValue[1]));

        return hour + ":" + minute;
    }
}