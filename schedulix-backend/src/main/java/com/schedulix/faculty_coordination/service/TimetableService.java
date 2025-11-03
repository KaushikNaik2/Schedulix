package com.schedulix.faculty_coordination.service;

import com.schedulix.faculty_coordination.model.DayOfWeek;
import com.schedulix.faculty_coordination.model.TimetableEntry;
import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.TimetableRepository;
import com.schedulix.faculty_coordination.repository.UserRepository; // <-- 1. IMPORT UserRepository
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional; // <-- 2. IMPORT Optional

@Service
public class TimetableService {

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private UserRepository userRepository; // <-- 3. AUTOWIRE UserRepository

    // DataFormatter ko class level par rakhein taaki sab methods use kar sakein
    private final DataFormatter dataFormatter = new DataFormatter();

    @Transactional
    public void saveTimetableFromExcel(MultipartFile file, User faculty) throws IOException {
        timetableRepository.deleteByFacultyId(faculty.getId());

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("H:mm");

            // Step 1: Header row (Row 0) se DayOfWeek map karein
            Row headerRow = sheet.getRow(0);
            Map<Integer, DayOfWeek> dayColumnMap = new HashMap<>();
            if (headerRow == null) {
                throw new IOException("Invalid Excel format: Header row is missing.");
            }
            for (Cell cell : headerRow) {
                if (cell != null && cell.getCellType() == CellType.STRING) {
                    try {
                        String headerValue = cell.getStringCellValue().trim().toUpperCase();
                        DayOfWeek day = DayOfWeek.valueOf(headerValue);
                        dayColumnMap.put(cell.getColumnIndex(), day);
                    } catch (IllegalArgumentException e) {
                        // "Time Slot" jaise invalid days ko ignore karein
                    }
                }
            }
            if (dayColumnMap.isEmpty()) {
                throw new IOException("Invalid Excel format: Header row must contain days (MONDAY, TUESDAY, etc.).");
            }

            // Step 2: Data rows (Row 1 se) iterate karein
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row currentRow = sheet.getRow(i);
                if (isRowEmpty(currentRow)) continue;

                Cell timeSlotCell = currentRow.getCell(0); // Time column (A)
                if (timeSlotCell == null) continue;

                try {
                    // Step 3: Time slot "9:30 - 10:30" parse karein
                    String timeSlotStr = dataFormatter.formatCellValue(timeSlotCell).trim();
                    String[] times = timeSlotStr.split("-");
                    if (times.length != 2) {
                        System.err.println("Skipping row " + (i + 1) + ": Invalid time slot format '" + timeSlotStr + "'.");
                        continue;
                    }

                    LocalTime startTime = LocalTime.parse(times[0].trim(), timeFormatter);
                    LocalTime endTime = LocalTime.parse(times[1].trim(), timeFormatter);

                    // Step 4: Day columns iterate karein
                    for (Map.Entry<Integer, DayOfWeek> entry : dayColumnMap.entrySet()) {
                        int columnIndex = entry.getKey();
                        DayOfWeek day = entry.getValue();

                        Cell subjectCell = currentRow.getCell(columnIndex);
                        String cellValue = dataFormatter.formatCellValue(subjectCell).trim();

                        // Step 5: Agar cell khaali nahi hai, save karein
                        if (!cellValue.isEmpty()) {

                            // --- 4. YEH HAI LOCATION PARSING LOGIC ---
                            String subject;
                            String location = null;

                            // "Subject (Location)" format ko parse karein
                            int locationStart = cellValue.lastIndexOf('(');
                            int locationEnd = cellValue.lastIndexOf(')');
                            if (locationStart != -1 && locationEnd > locationStart) {
                                subject = cellValue.substring(0, locationStart).trim();
                                location = cellValue.substring(locationStart + 1, locationEnd).trim();
                            } else {
                                subject = cellValue; // Location nahi mila
                            }
                            // --- END PARSING LOGIC ---

                            TimetableEntry timetableEntry = new TimetableEntry();
                            timetableEntry.setFaculty(faculty);
                            timetableEntry.setDay(day);
                            timetableEntry.setStartTime(startTime);
                            timetableEntry.setEndTime(endTime);
                            timetableEntry.setSubject(subject); // Sirf subject save karein
                            timetableEntry.setLocation(location); // Naya location save karein

                            timetableRepository.save(timetableEntry);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("!!! ERROR processing row " + (i + 1) + ". Skipping row. !!!");
                    e.printStackTrace();
                }
            }
        }
    }

    // --- 5. YEH HAI AAPKA ERROR FIX ---
    /**
     * Availability check karta hai aur location batata hai.
     */
    public String checkFacultyAvailability(Long facultyId, DayOfWeek day, LocalTime time) {
        // Naya repository method call karein jo Optional return karta hai
        Optional<TimetableEntry> entryOpt = timetableRepository
                .findFirstByFacultyIdAndDayAndStartTimeLessThanEqualAndEndTimeGreaterThan(facultyId, day, time, time);

        if (entryOpt.isPresent()) {
            // Agar busy hain
            TimetableEntry entry = entryOpt.get();
            String subject = entry.getSubject() != null ? entry.getSubject() : "Class";
            String location = entry.getLocation() != null ? entry.getLocation() : "On Campus";
            // String.format use karein
            return String.format("Faculty is BUSY. Location: %s (Subject: %s)", location, subject);
        } else {
            // Agar available hain
            // Faculty ki default location (Cabin) unke profile se fetch karein
            User faculty = userRepository.findById(facultyId).orElse(null);
            String location = "Cabin"; // Default
            if (faculty != null && faculty.getOfficeLocation() != null && !faculty.getOfficeLocation().isEmpty()) {
                location = faculty.getOfficeLocation();
            }
            return String.format("Faculty is AVAILABLE. Location: %s", location);
        }
    }
    // --- END ERROR FIX ---

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && !dataFormatter.formatCellValue(cell).trim().isEmpty()) {
                return false; // Non-empty cell mila
            }
        }
        return true; // Saare cells khaali hain
    }

    // DataFormatter ko upar move kar diya gaya hai
}