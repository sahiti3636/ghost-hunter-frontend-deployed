import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface VesselData {
    id: string;
    name: string;
    risk: number;
    status: string;
    lat: number | null;
    lng: number | null;
    lastSeen: string;
    type: string;
    flag: string;
    behavior_analysis: {
        reasoning?: string;
    };
}

export interface AnalysisResults {
    detection_summary: any;
    intelligence_analysis: any;
}

export const generateAnalysisPDF = (
    vessels: VesselData[],
    analysisResults: AnalysisResults | null,
    scenarioId: string
) => {
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- HEADER ---
    doc.setFillColor(10, 10, 10); // Dark background like the app
    doc.rect(0, 0, pageWidth, 20, 'F');

    doc.setTextColor(6, 182, 212); // Cyan-500
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('GHOST HUNTER // INTELLIGENCE REPORT', 14, 13);

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`SCENARIO: ${scenarioId}`, pageWidth - 14, 13, { align: 'right' });
    doc.text(`GENERATED: ${new Date().toLocaleString()}`, pageWidth - 14, 25, { align: 'right' });

    let currentY = 35;

    // --- EXECUTIVE SUMMARY ---
    if (analysisResults?.intelligence_analysis) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('EXECUTIVE SUMMARY', 14, currentY);

        currentY += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const summary = analysisResults.intelligence_analysis.executive_summary || "No summary available.";
        // Split text to fit page
        const splitSummary = doc.splitTextToSize(summary, pageWidth - 28);
        doc.text(splitSummary, 14, currentY);

        currentY += (splitSummary.length * 5) + 10;
    }

    // --- DETECTION STATS ---
    if (analysisResults?.detection_summary) {
        const stats = analysisResults.detection_summary;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DETECTION STATISTICS', 14, currentY);
        currentY += 7;

        const statText = `Total Vessels: ${stats.total_detections || 0}   |   Dark Vessels: ${stats.dark_vessels || 0}   |   High Risk: ${stats.high_risk_vessels || 0}`;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(statText, 14, currentY);

        currentY += 15;
    }

    // --- VESSEL TABLE ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETECTED VESSELS', 14, currentY);
    currentY += 5;

    const tableData = vessels.map(v => [
        v.id,
        `${v.risk}%`,
        v.status,
        v.type,
        v.flag,
        v.lat && v.lng ? `${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}` : 'N/A'
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['ID', 'Risk', 'Status', 'Type', 'Flag', 'Coordinates']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [6, 182, 212], // Cyan
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        }
    });

    // --- SAVE ---
    doc.save(`ghost-hunter-report-${scenarioId}.pdf`);
};
