package com.library.api.controller;

import com.library.api.dto.DashboardSummary;
import com.library.api.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard")
public class DashboardController {
    private final DashboardService dashboard;
    public DashboardController(DashboardService dashboard) { this.dashboard = dashboard; }
    @GetMapping("/summary") @Operation(summary = "Consultar indicadores reais do acervo")
    public DashboardSummary summary() { return dashboard.summary(); }
}
