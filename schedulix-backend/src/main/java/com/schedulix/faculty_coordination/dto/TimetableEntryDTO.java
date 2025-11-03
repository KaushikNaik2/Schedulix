package com.schedulix.faculty_coordination.dto;

import com.schedulix.faculty_coordination.model.DayOfWeek;
import lombok.Data;
import java.time.LocalTime;

@Data
public class TimetableEntryDTO {
    private Long id;
    private String facultyName;
    private DayOfWeek day;
    private String subject;
    private LocalTime startTime;
    private LocalTime endTime;
}