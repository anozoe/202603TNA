package com.example.tna.util;

public final class AttendanceWorkStatus {

    private AttendanceWorkStatus() {
    }

    public static final String NONE = "";
    public static final String MORNING_OFF = "2";
    public static final String AFTERNOON_OFF = "3";
    public static final String SUBSTITUTE_HOLIDAY = "4";
    public static final String HOLIDAY = "5";

    public static boolean isHolidayLike(String workStatus) {
        return SUBSTITUTE_HOLIDAY.equals(workStatus) || HOLIDAY.equals(workStatus);
    }
}